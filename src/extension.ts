import * as vscode from 'vscode'
import { Panel } from './panels/ReactPanel'
import { OpenAIStream } from './OpenAI'
import { cohereApi } from './CohereAI'
import { languageSupportsComments, parseLineComment } from './consts/comments'
import { replaceWithUnicodes } from './panels/utils'
import ApiKeySettings from './apiKeySettings'
import { generateCommitMessage } from './git/iacommit'
import { commitTypesOpts, getCommitTypeObject, releaseCommit } from './git/utils'
import { COMMIT_TYPES } from './git/commit-types'
import { SidebarProvider } from './panels/SideBar'
import { Util } from './Util'

const AI_INTELLISENSE = {
  openai: OpenAIStream,
  cohere: cohereApi
}

const progressOptions: vscode.ProgressOptions = {
  location: vscode.ProgressLocation.Notification,
  title: 'ColaBOT',
  cancellable: true
}

export async function activate (context: vscode.ExtensionContext) {
  Util.globalState = context.globalState
  ApiKeySettings.init(context)
  const settings = ApiKeySettings.instance
  const API_KEY = await settings.getKeyData()

  const config = vscode.workspace.getConfiguration('colaBot')
  const intellisenseSelected = config.get('apiKey') as keyof typeof AI_INTELLISENSE

  const getApiResponse = async (comment: string) => {
    return await vscode.window.withProgress(progressOptions, async (progress) => {
      progress.report({ message: 'Loading...' })

      return await AI_INTELLISENSE[intellisenseSelected](comment, API_KEY!)
    })
  }

  const sidebarProvider = new SidebarProvider(context, API_KEY!)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'colabot-sidebar',
      sidebarProvider
    )
  )

  vscode.commands.registerCommand('colabot-vscode.aiCommit', async () => {
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
              aiCommitMessage = await getApiResponse(promptMessage)
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
      vscode.window.showErrorMessage((err as Error).message)
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

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.getCode', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        return await vscode.window.showErrorMessage('Select code')
      }
      const lang = editor.document.languageId
      const isLanguageSupported = languageSupportsComments(lang)

      if (!isLanguageSupported) {
        return await vscode.window.showErrorMessage('Language not supported')
      }

      const position = editor.selection.active
      const currentLine = editor.document.lineAt(position)

      const comment = `${parseLineComment(currentLine.text, lang)!} for ${lang}`

      try {
        const response = await getApiResponse(comment)
        if (response) Panel.render(context.extensionUri, response)
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message)
      }
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.askCode', async () => {
      const editor = vscode.window.activeTextEditor
      let askWithCodeSelection = ''
      if (editor) {
        const selection = editor.selection
        const selectedText = editor.document.getText(selection)
        // validate selection and selection length
        if (selectedText && !selectedText.trim()) {
          return await vscode.window.showWarningMessage('Please do a better selection')
        }
        if (selectedText) {
          askWithCodeSelection = selectedText
        }
      }
      vscode.window
        .showInputBox({
          placeHolder: 'Ask me anything 🤖'
        })
        .then(async (value) => {
          if (!value) return

          if (value.trim().length < 8) {
            return await vscode.window.showWarningMessage('Please give some more information')
          }
          try {
            if (askWithCodeSelection) {
              value = `${askWithCodeSelection}\n\n${value}:`
            }
            const response = await getApiResponse(value)
            if (response) Panel.render(context.extensionUri, replaceWithUnicodes(response))
          } catch (err) {
            vscode.window.showErrorMessage((err as Error).message)
          }
        })
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('colabot-vscode.explainCode', async () => {
      const editor = vscode.window.activeTextEditor
      const selection = editor?.selection
      const selectedText = editor?.document?.getText(selection)
      if (!selectedText) {
        return await vscode.window.showWarningMessage('Please select some text first')
      }

      try {
        const message = `${selectedText}. Explain how this code works:`
        const response = await getApiResponse(message)
        if (response) Panel.render(context.extensionUri, response)
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message)
      }
    })
  )
}

// This method is called when your extension is deactivated
export function deactivate () {}
