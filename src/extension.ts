import * as vscode from 'vscode';
import { Panel } from './Panel';
import { OpenAIStream } from './OpenAI';
import { loaderMessage } from './utils/loaderMessage';
import { languageSupportsComments, parseLineComment } from './consts/comments';
import { parseOpenAIResponse, replaceWithUnicodes } from './utils';

export function activate(context: vscode.ExtensionContext) {
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
        loaderMessage("Please wait...");
        const { data } = await OpenAIStream(comment!);
        const response = parseOpenAIResponse(data);
        Panel.createOrShow(context.extensionUri, response!);
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
      }
    })
  );

  /**
   * WIP: another use cases
   */
  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.askCode', async () => {
      vscode.window.showInputBox({
        placeHolder: 'Ask me anything 🤖'
      }).then(async (value) => {
        if (!value) {return;}
        // const editor = vscode.window.activeTextEditor;
        // if (!editor) {
        //   return vscode.window.showErrorMessage("Select code");
        // }
        // const lang = editor.document.languageId;
        // const isLanguageSupported = languageSupportsComments(lang);
  
        // if (!isLanguageSupported) {
        //   return vscode.window.showErrorMessage("Language not supported");
        // }
        try {
          loaderMessage("Please wait...");
          const { data } = await OpenAIStream(value!);
          const response = parseOpenAIResponse(data);
          Panel.createOrShow(context.extensionUri, replaceWithUnicodes(response!));
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
        loaderMessage("Please wait...");
        const { data } = await OpenAIStream(`${selectedText}. Explain how this code works:`);
        const response = parseOpenAIResponse(data);
        Panel.createOrShow(context.extensionUri, response!);
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
