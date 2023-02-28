/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, OpenAIApi } from 'openai';

export async function OpenAIStream(selectedText: string) {
  const openai = new OpenAIApi(new Configuration({ apiKey: 'YOUR_API_KEY' }));
  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${selectedText} Explain how this code works:`,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 200,
      stream: false,
      n: 1,
    });

    return completion;
  } catch (error) {
    const errorAsAny = error as any;
    if (errorAsAny.code === 'ENOTFOUND') {
      throw new Error(
        `Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`
      );
    }

    errorAsAny.message = `OpenAI API Error: ${errorAsAny.message} - ${errorAsAny.response.statusText}`;
    throw errorAsAny;
  }
}
