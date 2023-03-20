import { window } from 'vscode'
import { openAIPayload } from '../OpenAI'
import { getNonce, getUri } from './utils'
import type { Webview, WebviewViewProvider, WebviewView, TextDocument, Uri } from 'vscode'

export class SidebarProvider implements WebviewViewProvider {
  _view?: WebviewView
  _doc?: TextDocument
  _apiKey: string
  constructor (private readonly _extensionUri: Uri, apiKey: string) {
    this._apiKey = apiKey
  }

  public resolveWebviewView (webviewView: WebviewView) {
    this._view = webviewView
    this._setWebviewMessageListener(this._view.webview)
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri]
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
  }

  public revive (panel: WebviewView) {
    this._view = panel
  }

  private _getHtmlForWebview (webview: Webview) {
    const stylesUri = getUri(webview, this._extensionUri, ['webview-ui', 'build', 'assets', 'index.css'])
    const scriptUri = getUri(webview, this._extensionUri, ['webview-ui', 'build', 'assets', 'index.js'])

    const nonce = getNonce()

    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src https://api.openai.com/v1/completions https://api.openai.com/v1/chat/completions; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>ColaBOT: AI assistant 🤖</title>
          <script nonce="${nonce}">
            window.sidebar = ${JSON.stringify(true)};
            window.openAIPayload = ${JSON.stringify({ ...openAIPayload, apiKey: this._apiKey })};
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `
  }

  private _setWebviewMessageListener (webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command
        const text = message.text

        switch (command) {
          case 'payloadSidebarError': {
            window.showErrorMessage(text)
            break
          }
          case 'apiSidebarError': {
            window.showErrorMessage(text)
            break
          }
        }
      }
    )
  }
}
