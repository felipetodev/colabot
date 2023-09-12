import { workspace, window } from 'vscode'
import { COMMIT_TYPES } from '../lib/constants'
import { getApiResponse } from '../lib/utils'
import {
  getCommitTypeObject,
  commitTypesOpts,
  generateCommitMessage,
  releaseCommit
} from '../lib/utils.git'

export function aiCommits (apiKey: string) {
  const config = workspace.getConfiguration('colaBot')
  const withGitmoji = config.get('gitMoji') as boolean
  const withSemVer = config.get('semanticVersioningSpecification') as boolean
  const commitOptions = commitTypesOpts(withGitmoji, withSemVer)
  try {
    window
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
              aiCommitMessage = await getApiResponse(promptMessage, apiKey)
            } catch (err) {
              window.showErrorMessage(err as any)
            }
          }
        }
        window
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
    window.showErrorMessage(err as any)
    process.exit(1)
  }
}
