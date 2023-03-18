declare global {
  interface Window {
    responseText?: string;
  }
}

export type ChatState = Array<{
  role: 'user' | 'system'
  content: string
}>

export type OpenAIStreamPayload = {
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
  apiKey: string;
}
