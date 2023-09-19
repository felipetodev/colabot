import { useState, useEffect } from 'react'
import { vscode } from '../utils/vscode'
import {
  type ChatState,
  type Editor,
  type LLMProviderSettings,
  type WebviewEventListeners
} from '../types'

type Props = {
  setChatState: (chat: ChatState) => void
}

export function useMessageHandler({ setChatState }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [config, setConfig] = useState<LLMProviderSettings | null>(null)

  const handleMessageEvent = (event: MessageEvent<WebviewEventListeners>) => {
    const { type, editor, settings } = event.data

    if (type === 'selectedText') {
      setEditor(editor)
    }
    if (type === 'clearChat') {
      setChatState([])
      vscode.setState([])
    }
    if (type === 'updateSettings') {
      setConfig(settings)
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)

    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [])

  return {
    editor,
    config,
    setEditor
  }
}
