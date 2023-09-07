/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { workspace } from 'vscode'
import { Configuration, OpenAIApi } from 'openai'

const config = workspace.getConfiguration('colaBot')

export const openAIPayload = {
  model: config.get('model') as string,
  temperature: config.get('temperature') as number,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: config.get('maxTokens') as number,
  stream: false,
  n: 1,
  organizationId: config.get('organizationId') as string
}

export async function OpenAIStream (selectedText: string, apiKey: string = '') {
  const openai = new OpenAIApi(new Configuration({ apiKey }))
  try {
    if (openAIPayload.model === 'gpt-3.5-turbo') {
      const completion = await openai.createChatCompletion({
        ...openAIPayload,
        messages: [{ role: 'user', content: selectedText }]
      })

      return completion.data.choices[0].message?.content
    }

    const completion = await openai.createCompletion({
      prompt: selectedText,
      ...openAIPayload
    })

    return completion.data.choices[0].text!
  } catch (error) {
    const errorAsAny = error as any
    if (errorAsAny.code === 'ENOTFOUND') {
      throw new Error(
        `Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`
      )
    }

    errorAsAny.message = `OpenAI API Error: ${errorAsAny.message} - ${errorAsAny.response.statusText}`
    throw errorAsAny
  }
}
