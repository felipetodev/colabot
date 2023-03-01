import * as vscode from 'vscode';
import { Panel } from './Panel';
import { OpenAIStream } from './OpenAI';
import { loaderMessage } from './utils/loaderMessage';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cohere-vscode.helloWorld', () => {
      const editor = vscode.window.activeTextEditor;
      const selection = editor?.selection;
      const selectedText = editor?.document.getText(selection);
      vscode.window.showInformationMessage(`${selectedText}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cohere-vscode.doSomething', async () => {
      const answer = await vscode.window.showInformationMessage(
        'Hello from DO SOMETHING 🚀',
        'OK',
        'Cancel'
      );

      if (answer === 'OK') {
        vscode.window.showInformationMessage('OK');
      }

      if (answer === 'Cancel') {
        vscode.window.showInformationMessage('Sorry to hear that!');
      }
    })
  );

  // ==============================================================================

  context.subscriptions.push(
    vscode.commands.registerCommand('cohere-vscode.helloWebviews', async () => {
      const editor = vscode.window.activeTextEditor;
      const selection = editor?.selection;
      const selectedText = editor?.document?.getText(selection);
      if (!selectedText) {
        return vscode.window.showInformationMessage('Please select some text first');
      }

      try {
        loaderMessage("Please wait...");
        const { data } = await OpenAIStream(selectedText);
        Panel.createOrShow(context.extensionUri, data.choices[0].text || 'No answer found');
      } catch (err) {
        vscode.window.showInformationMessage((err as Error).message);
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
