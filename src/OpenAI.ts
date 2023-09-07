/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { workspace } from 'vscode'
import OpenAI from 'openai'

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

export async function OpenAIStream (selectedText: string, apiKey: string = ''): Promise<string> {
  const openai = new OpenAI({
    apiKey,
    ...openAIPayload.organizationId
      ? { organization: openAIPayload.organizationId }
      : {}
  })

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: selectedText }],
      model: openAIPayload.model,
      temperature: openAIPayload.temperature,
      top_p: 1,
      stream: false,
      max_tokens: openAIPayload.max_tokens,
      frequency_penalty: openAIPayload.frequency_penalty,
      presence_penalty: openAIPayload.presence_penalty,
      n: 1
    })

    return completion.choices[0].message.content!
  } catch (error) {
    const errorAsAny = error as any
    if (errorAsAny.code === 'ENOTFOUND') {
      throw new Error(
        `Error connecting to ${errorAsAny.hostname} (${errorAsAny.syscall}). Are you connected to the internet?`
      )
    }

    throw errorAsAny.message
  }
}
