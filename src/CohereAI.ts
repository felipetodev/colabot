/* eslint-disable @typescript-eslint/naming-convention */
import { workspace } from 'vscode'
import * as CohereAIApi from 'cohere-ai'

const config = workspace.getConfiguration('colaBot')

const payload = {
  length: 'long',
  format: 'paragraph',
  model: config.get('model') as string,
  temperature: config.get('temperature') as number
}

export async function cohereApi (selectedText: string, apiKey: string) {
  CohereAIApi.init(apiKey)
  try {
    if (payload.model === 'command-xlarge-nightly') {
      const response = await CohereAIApi.generate({
        prompt: selectedText,
        model: config.get('model') as string,
        max_tokens: config.get('maxTokens') as number,
        temperature: config.get('temperature') as number,
        k: 0,
        p: 0.75,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      })

      if (
        !response.statusCode ||
        response.statusCode < 200 ||
        response.statusCode > 299
      ) {
        // @ts-expect-error cohere dependency is missing types
        const errMsg: string = response.body?.message
        throw new Error(`Cohere API Error: ${errMsg}`)
      }

      return response.body.generations[0].text
    }

    const response = await CohereAIApi.summarize({
      text: selectedText,
      ...payload
    })

    if (response.statusCode !== 200) {
      // @ts-expect-error cohere dependency is missing types
      const errMsg: string = response.body?.message
      throw new Error(`Cohere API Error: ${errMsg}`)
    }

    return response.body.summary
  } catch (err) {
    const errorAsAny = err as any
    throw errorAsAny.message
  }
}
