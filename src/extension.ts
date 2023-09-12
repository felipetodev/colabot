import * as vscode from 'vscode'
import ApiKeySettings from './apiKeySettings'
import { generateCommitMessage } from './git/iacommit'
import { commitTypesOpts, getCommitTypeObject, releaseCommit } from './git/utils'
import { COMMIT_TYPES } from './lib/constants'
import { SidebarProvider } from './panels/SideBar'
import { Util } from './Util'
import { getApiResponse, triggerCommand } from './lib/utils'

export async function activate (context: vscode.ExtensionContext) {
  Util.globalState = context.globalState
  ApiKeySettings.init(context)
  const settings = ApiKeySettings.instance
  const apiKey = await settings.getKeyData()

  const sidebarProvider = new SidebarProvider(context, apiKey!)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.fixCode', () => {
      triggerCommand(sidebarProvider, 'fix')
    }),
    vscode.commands.registerCommand('colabot-vscode.docsCode', () => {
      triggerCommand(sidebarProvider, 'doc')
    }),
    vscode.commands.registerCommand('colabot-vscode.testCode', () => {
      triggerCommand(sidebarProvider, 'test')
    }),
    vscode.commands.registerCommand('colabot-vscode.explainCode', () => {
      triggerCommand(sidebarProvider, 'explain')
    }),
    vscode.commands.registerCommand('colabot-vscode.clearChat', () => {
      sidebarProvider._view?.webview.postMessage({
        type: 'clearChat'
      })
    }),
    vscode.commands.registerCommand('colabot-vscode.chatFeedback', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://github.com/felipetodev/colabot/issues'))
    })
  )

  vscode.commands.registerCommand('colabot-vscode.aiCommit', async () => {
    const config = vscode.workspace.getConfiguration('colaBot')
    const withGitmoji = config.get('gitMoji') as boolean
    const withSemVer = config.get('semanticVersioningSpecification') as boolean
    const commitOptions = commitTypesOpts(withGitmoji, withSemVer)
    try {
      vscode.window
        .showQuickPick(commitOptions, {
          placeHolder: 'Select a commit type',
          title: 'ColaBOT: Semantic Commit'
        })
        .then(async (commitType) => {
          if (!commitType) return
          let aiCommitMessage = '' as string | undefined

          if (commitType.includes(COMMIT_TYPES.ai.description)) {
            const promptMessage = await generateCommitMessage(withSemVer)
            if (promptMessage) {
              try {
                aiCommitMessage = await getApiResponse(promptMessage, apiKey!)
              } catch (err) {
                vscode.window.showErrorMessage(err as any)
              }
            }
          }
          vscode.window
            .showInputBox({
              value: aiCommitMessage,
              placeHolder: 'Eg: Add new props to the button component',
              prompt: `${
                aiCommitMessage ? 'Would you like to use this commit message?' : 'Write your commit message'
              }`
            })
            .then(async (commitMessage) => {
              if (!commitMessage) return

              if (!withSemVer) {
                return await releaseCommit(commitMessage, false)
              }

              if (aiCommitMessage) {
                const type = aiCommitMessage.split(':')[0].trim()
                const { commit, release } = getCommitTypeObject({
                  type,
                  isAI: !!aiCommitMessage,
                  withGitmoji,
                  commit: aiCommitMessage
                })

                await releaseCommit(commit, release)
              } else {
                const type = withGitmoji
                  ? commitType.split(' ')[1].replace(':', '')
                  : commitType.split(':')[0]
                const { commit, release } = getCommitTypeObject({
                  type,
                  isAI: !!aiCommitMessage,
                  withGitmoji,
                  commit: commitMessage
                })

                await releaseCommit(commit, release)
              }
            })
        })
    } catch (err) {
      vscode.window.showErrorMessage(err as any)
      process.exit(1)
    }
  })

  vscode.commands.registerCommand('colabot-vscode.setApiKey', async () => {
    const tokenInput = await vscode.window.showInputBox({
      password: true
    })
    if (!tokenInput) return

    await settings.storeKeyData(tokenInput)
    const action = 'Reload'
    const msgReload = 'API key set ✔. Please reload to apply changes.'
    vscode.window.showInformationMessage(msgReload, action).then((selectedAction) => {
      if (selectedAction === action) {
        vscode.commands.executeCommand('workbench.action.reloadWindow')
      }
    })
  })

  vscode.commands.registerCommand('colabot-vscode.removeApiKey', async () => {
    await settings.deleteKeyData()
    const action = 'Reload'
    const msgReload = 'API key removed. Please reload to apply changes.'
    vscode.window.showInformationMessage(msgReload, action).then((selectedAction) => {
      if (selectedAction === action) {
        vscode.commands.executeCommand('workbench.action.reloadWindow')
      }
    })
  })
}

// This method is called when your extension is deactivated
export function deactivate () {}
