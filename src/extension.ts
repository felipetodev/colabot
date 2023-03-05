import * as vscode from 'vscode';
import { Panel } from './Panel';
import { OpenAIStream } from './OpenAI';
import { cohereApi } from './CohereAI';
import { languageSupportsComments, parseLineComment } from './consts/comments';
import { replaceWithUnicodes } from './utils';
import ApiKeySettings from './apiKeySettings';

const IA_INTELLISENSE = {
  openai: OpenAIStream,
  cohere: cohereApi
};

const progressOptions: vscode.ProgressOptions = {
  location: vscode.ProgressLocation.Notification,
  title: 'ColaBOT',
  cancellable: true,
};

export async function activate(context: vscode.ExtensionContext) {
  ApiKeySettings.init(context);
  const settings = ApiKeySettings.instance;
  const API_KEY = await settings.getKeyData();

  const config = vscode.workspace.getConfiguration('colaBot');
  const intellisenseSelected = config.get('apiKey') as keyof typeof IA_INTELLISENSE;

  const getApiResponse = async (comment: string) => {
    return await vscode.window.withProgress(progressOptions, async (progress) => {
      progress.report({ message: "Loading..." });

      return await IA_INTELLISENSE[intellisenseSelected](comment, API_KEY!);
    });
  };

  vscode.commands.registerCommand("colabot-vscode.setApiKey", async () => {
    const tokenInput = await vscode.window.showInputBox();
    if (!tokenInput) {return;}
    await settings.storeKeyData(tokenInput);
    vscode.window.showInformationMessage(tokenInput!);
  });

  vscode.commands.registerCommand("colabot-vscode.removeApiKey", async () => {
    await settings.deleteKeyData();
    vscode.window.showInformationMessage("API Key removed");
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.getCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("Select code");
      }
      const lang = editor.document.languageId;
      const isLanguageSupported = languageSupportsComments(lang);

      if (!isLanguageSupported) {
        return vscode.window.showErrorMessage("Language not supported");
      }
      
      const position = editor.selection.active;
      const currentLine = editor.document.lineAt(position);
      
      const comment = `${parseLineComment(currentLine.text, lang)} for ${lang}`;
    
      try {
        const response = await getApiResponse(comment);
        Panel.createOrShow(context.extensionUri, response);
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.askCode', async () => {
      const editor = vscode.window.activeTextEditor;
      let askWithCodeSelection = '';
      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        // validate selection and selection length
        if (selectedText && !selectedText.trim()) {
          return vscode.window.showWarningMessage('Please do a better selection');
        }
        if (selectedText) {
          askWithCodeSelection = selectedText;
        }
      }
      vscode.window.showInputBox({
        placeHolder: 'Ask me anything 🤖'
      }).then(async (value) => {
        if (!value) {return;}
        if (value.trim().length < 8) {
          return vscode.window.showWarningMessage('Please give some more information');
        }
        try {
          if (askWithCodeSelection) {
            value = `${askWithCodeSelection}\n\n${value}:`;
          }
          const response = await getApiResponse(value);
          Panel.createOrShow(context.extensionUri, replaceWithUnicodes(response));
        } catch (err) {
          vscode.window.showErrorMessage((err as Error).message);
        }
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      const selection = editor?.selection;
      const selectedText = editor?.document?.getText(selection);
      if (!selectedText) {
        return vscode.window.showWarningMessage('Please select some text first');
      }

      try {
        const message = `${selectedText}. Explain how this code works:`;
        const response = await getApiResponse(message);
        Panel.createOrShow(context.extensionUri, response);
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
