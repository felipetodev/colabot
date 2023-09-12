import { window } from 'vscode'
import { getStagedDiff, gitCommit } from './utils.cli'
import { COMMIT_TYPES } from '../lib/constants'

export function commitTypesOpts (withGitmoji: boolean, withSemVer: boolean) {
  if (withSemVer) {
    return Object.entries(COMMIT_TYPES).map(([key, val]) =>
      withGitmoji ? `${val.emoji} ${key}: ${val.description}` : `${key}: ${val.description}`
    )
  }

  return [
    withGitmoji
      ? `🤖 ai: ${COMMIT_TYPES.ai.description}`
      : `ai: ${COMMIT_TYPES.ai.description}`
  ]
}

export function getCommitTypeObject ({
  type,
  isAI,
  withGitmoji,
  commit
}: {
  type: string
  isAI: boolean
  withGitmoji: boolean
  commit: string
}) {
  const { emoji, release } = COMMIT_TYPES[type as keyof typeof COMMIT_TYPES]

  if (isAI) {
    return {
      release,
      commit: `${withGitmoji ? emoji : ''} ${commit.trim()}`
    }
  }

  return {
    release,
    commit: `${withGitmoji ? emoji : ''} ${type}: ${commit}`
  }
}

const stagedError = 'No staged changes found. Please stage your changes before committing.'

export async function releaseCommit (commit: string, release: boolean) {
  if (release) {
    const isBreakingChange = await window.showInformationMessage(
      'Are there any breaking changes?',
      'No',
      'Yes'
    )

    if (isBreakingChange === 'No') {
      try {
        await gitCommit(commit)
        return await window.showInformationMessage(`Commit created ✔: ${commit}`, { detail: '' })
      } catch (err) {
        window.showErrorMessage(stagedError)
        process.exit(0)
      }
    }

    if (isBreakingChange === 'Yes') {
      try {
        await gitCommit(`${commit} [breaking change]`)
        return await window.showInformationMessage(`Commit created ✔: ${commit} [breaking change]`)
      } catch (err) {
        window.showErrorMessage(stagedError)
        process.exit(0)
      }
    }
  }

  try {
    await gitCommit(commit)
    return await window.showInformationMessage(`Commit created ✔: ${commit}`)
  } catch (error) {
    window.showErrorMessage(stagedError)
    process.exit(0)
  }
}

const withSemVer = '(following the Semantic Versioning specification)'
const promptTemplate = (withSV: boolean) => `Write an insightful but concise Git commit message ${withSV ? withSemVer : ''} in a complete sentence in present tense for the following diff without prefacing it with anything:`

export async function generateCommitMessage (withSemVer: boolean) {
  const staged = await getStagedDiff()

  if (staged.files.length === 0) {
    return await window.showWarningMessage(stagedError)
  }

  const prompt = `${promptTemplate(withSemVer)}\n${staged.diff}`

  /**
   * text-davinci-003 & gpt-3.5-turbo has a token limit of 4000
   * https://platform.openai.com/docs/models/overview#:~:text=to%20Sep%202021-,text%2Ddavinci%2D003,-Can%20do%20any
   */

  if (prompt.length > 4000) {
    return await window.showWarningMessage(
      'The diff is too large for the OpenAI API. Try reducing the number of staged changes, or write your own commit message.'
    )
  }

  return prompt
}

export async function generateBodyMessage () {
  const staged = await getStagedDiff()

  if (staged.files.length === 0) {
    return await window.showWarningMessage(stagedError)
  }

  return `Write an insightful but concise Git commit body message for the following diff. answer using only that information, outputted in markdown format:\n${staged.diff}`
}
