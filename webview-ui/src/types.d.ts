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
}

export type ChatState = Array<Message>

export type OpenAIStreamPayload = {
  model: 'text-davinci-003' | 'gpt-3.5-turbo' | string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
  apiKey: string;
}

export type Editor = {
  selectedText: string
  language: string
} | null

export enum VSCodeMessageTypes {
  CopyToClipboard = 'copyToClipboard',
  SelectedText = 'selectedText',
  PayloadSidebarError = 'payloadSidebarError',
  ApiSidebarError = 'apiSidebarError',
  CloseWebviewPanel = 'closeWebviewPanel',
  ReplaceSelectedCode = 'replaceSelectedCode',
}
