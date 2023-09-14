import { window, commands, ProgressLocation, Uri, type Webview, type ProgressOptions } from 'vscode'
import { OpenAIStream } from '../OpenAI'
import { type SidebarProvider } from '../panels/SideBar'
import { type Settings } from '../types'

const progressOptions: ProgressOptions = {
  location: ProgressLocation.Notification,
  title: 'ColaBOT',
  cancellable: true
}

export function getUri (webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList))
}

export function getNonce () {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export function replaceWithUnicodes (val: string) {
  return val.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const getApiResponse = async (comment: string, settings: Settings) => {
  return await window.withProgress(progressOptions, async (progress) => {
    progress.report({ message: 'Loading...' })

    return await OpenAIStream(comment, settings)
  })
}

export const execReloadWindow = async (message: string) => {
  const action = 'Reload'
  window.showInformationMessage(message, action).then((selectedAction) => {
    if (selectedAction === action) {
      commands.executeCommand('workbench.action.reloadWindow')
    }
  })
}

export const triggerCommand = async (sidebarProvider: SidebarProvider, command: 'fix' | 'explain' | 'doc' | 'test') => {
  if (!sidebarProvider._view) {
    await commands.executeCommand('colabot-sidebar.focus')
    // wait till sidebar is ready. TODO: find a better way to improve this
    await new Promise((resolve) => setTimeout(resolve, 500))
  } else {
    sidebarProvider._view?.show?.(true)
  }

  const editor = window.activeTextEditor
  const selection = editor?.selection
  const selectedText = editor?.document?.getText(selection).trim()
  if (!selectedText) {
    return await window.showWarningMessage('Please select some text first')
  }

  sidebarProvider._view?.webview.postMessage({
    type: 'selectedText',
    editor: {
      selectedText,
      prompt: command,
      language: editor?.document.languageId
    }
  })
}
