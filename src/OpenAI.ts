/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, OpenAIApi } from 'openai';

const payload = {
  temperature: 0.3,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 1500,
  stream: false,
  n: 1,
};

export async function OpenAIStream(selectedText: string) {
  const openai = new OpenAIApi(new Configuration({ apiKey: 'YOUR_API_KEY' }));
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: "user", content: selectedText }],
      ...payload,
    });

    // const completion = await openai.createCompletion({
      //   model: 'text-davinci-003',
      //   prompt: selectedText,
      //   ...payload,
    // });

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
