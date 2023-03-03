import type { CreateChatCompletionResponse } from 'openai';

export function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function replaceWithUnicodes(val: string) {
  return val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function parseOpenAIResponse(data: CreateChatCompletionResponse) {
  return data.choices[0].message?.content!;
}
