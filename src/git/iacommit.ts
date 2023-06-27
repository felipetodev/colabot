import { window } from 'vscode'
import { getStagedDiff } from './'

const withSemVer = '(following the Semantic Versioning specification)'
const promptTemplate = (withSV: boolean) => `Write an insightful but concise Git commit message ${withSV ? withSemVer : ''} in a complete sentence in present tense for the following diff without prefacing it with anything:`

export async function generateCommitMessage (withSemVer: boolean) {
  const staged = await getStagedDiff()

  if (staged.files.length === 0) {
    return await window.showWarningMessage(
      'No staged changes found. Please stage your changes before trying to commit.'
    )
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
    return await window.showWarningMessage(
      'No staged changes found. Please stage your changes before trying to commit.'
    )
  }

  return `Write an insightful but concise Git commit body message for the following diff. answer using only that information, outputted in markdown format:\n${staged.diff}`
}
