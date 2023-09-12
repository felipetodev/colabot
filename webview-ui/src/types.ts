declare global {
  interface Window {
    responseText?: string;
    sidebar?: boolean;
    openAIPayload?: OpenAIStreamPayload;
    currentTheme?: string;
  }
}

export type Message = {
  role: 'user' | 'system',
  content: string,
  language?: string | undefined,
  error?: boolean
}

export type ChatState = Array<Message>

export type OpenAIStreamPayload = {
  provider: 'openai';
  model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4' | 'gpt-4-32k' | string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
  apiKey: string;
  organizationId: string;
}

export type Editor = {
  selectedText: string
  language: string
  prompt?: 'explain' | 'fix' | 'test'
} | null

export enum VSCodeMessageTypes {
  CopyToClipboard = 'copyToClipboard',
  SelectedText = 'selectedText',
  PayloadSidebarError = 'payloadSidebarError',
  ApiSidebarError = 'apiSidebarError',
  CloseWebviewPanel = 'closeWebviewPanel',
  ReplaceSelectedCode = 'replaceSelectedCode',
}
