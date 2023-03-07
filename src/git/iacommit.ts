const withSemanticVersioning = "(following the Semantic Versioning specification)";
const promptTemplate = (withSV: boolean) => `Write an insightful but concise Git commit message ${withSV ? withSemanticVersioning : ''} in a complete sentence in present tense for the following diff without prefacing it with anything:`;

export async function generateCommitMessage (diff: string, withSemanticVersioning: boolean) {
  const prompt = `${promptTemplate(withSemanticVersioning)}\n${diff}`;

  /**
	 * text-davinci-003 & gpt-3.5-turbo has a token limit of 4000
	 * https://platform.openai.com/docs/models/overview#:~:text=to%20Sep%202021-,text%2Ddavinci%2D003,-Can%20do%20any
	 */

  if (prompt.length > 4000) {
    throw new Error('The diff is too large for the OpenAI API. Try reducing the number of staged changes, or write your own commit message.');
  }

  return prompt;
}
