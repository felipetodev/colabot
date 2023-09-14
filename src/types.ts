export interface Settings {
  apiKey?: string
  model?: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4' | 'gpt-4-32k' | string
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
  n?: number
  max_tokens?: number
  temperature?: number
  organizationId?: string
}
