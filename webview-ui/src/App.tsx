import { useEffect, useState } from "react"
import Chat from './components/Chat'
import { vscode } from "./utils/vscode"
import { LangChainStream } from "./utils/opaneai-chain"
import {
  type ChatState,
  type Editor,
  type Message,
  type WebviewEventListeners,
  type LLMProviderSettings,
  VSCodeMessageTypes
} from "./types"

function App() {
  const [chatState, setChatState] = useState<ChatState>(vscode.getState() as ChatState || [])
  const [editor, setEditor] = useState<Editor | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [config, setConfig] = useState<LLMProviderSettings | null>(null)

  const handleSend = async (message: string) => {
    const llmSettings = config || window.llmSettings
    if (!llmSettings?.apiKey) {
      const isMessageWithError = chatState.slice(-1)[0]?.error
      if (isMessageWithError) return
      setChatState((prev) => [
        ...prev,
        {
          role: 'system',
          error: true,
          content: `You must set an **OpenAI** API key:`
        }
      ])
      return
    }

    const selectedText = editor?.selectedText ?? ''
    if (!message) return

    const newMessage: Message = {
      role: 'user',
      content: message
    }

    setLoading(true)
    setChatState((prev) => [...prev, newMessage])

    let chatUpdate: ChatState = [...chatState, newMessage]

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        selectedText,
        llmSettings,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            setEditor(null)
            setLoading(false)
            return
          }
          text += message

          if (isFirst) {
            isFirst = false
            chatUpdate = [...chatUpdate, { role: 'system', content: '' }]
          }

          chatUpdate = chatUpdate.map(
            (chat, index) => {
              if (index === chatUpdate.length - 1) {
                return {
                  ...chat,
                  role: 'system',
                  content: text
                }
              }
              return chat
            }
          )

          setChatState(chatUpdate)
        }
      )

      vscode.setState([
        ...chatState,
        { role: 'user', content: message },
        { role: 'system', content: text, language: editor?.language }
      ])
    } catch (error) {
      console.error(error)
      const { message } = error as { message: string }
      
      const errIndex = message.indexOf('{')
      const jsonError = message.slice(errIndex)

      vscode.postMessage({
        command: VSCodeMessageTypes.ApiSidebarError,
        text: JSON.parse(jsonError).error.message
      });
    } finally {
      setEditor(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    const cbListener = (event: MessageEvent) => {
      const { type, editor, settings } = event.data as WebviewEventListeners

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

    window.addEventListener('message', cbListener)

    return () => {
      window.removeEventListener('message', cbListener)
    }
  }, [])

  useEffect(() => {
    // effect to handle an updated chatState
    if (editor?.selectedText && editor.prompt) {
      handleSendCommand({
        code: editor.selectedText,
        type: editor.prompt
      })
      setEditor(null)
    }
  }, [editor?.prompt])

  const handleSendCommand = async ({ code, type }: { code?: string, type: 'explain' | 'fix' | 'test' }) => {
    const selectedText = code ?? editor?.selectedText
    if (!selectedText) return
    setLoading(true)
    const llmSettings = config || window.llmSettings
    const promptCommand = `/${type}`
    let chatUpdate: ChatState = [...chatState, { role: 'user', content: promptCommand }]
    setChatState(chatUpdate)

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        selectedText,
        llmSettings,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            setEditor(null)
            setLoading(false)
            return
          }
          text += message

          if (isFirst) {
            isFirst = false
            chatUpdate = [...chatUpdate, { role: 'system', content: '' }]
          }

          chatUpdate = chatUpdate.map(
            (chat, index) => {
              if (index === chatUpdate.length - 1) {
                return {
                  ...chat,
                  role: 'system',
                  content: text
                }
              }
              return chat
            }
          )

          setChatState(chatUpdate)
        }
      )

      vscode.setState([
        ...chatState,
        { role: 'user', content: promptCommand },
        { role: 'system', content: text, language: editor?.language }
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setEditor(null)
      setLoading(false)
    }
  }

  const handleApiKey = ({ key }: { key: string }) => {
    const lastChat = chatState.slice(-1)[0]
    setChatState((prev) => [
      ...prev.slice(0, -1),
      { ...lastChat, content: 'API key set up correctly!', error: false }
    ])
    vscode.postMessage({
      command: VSCodeMessageTypes.ApiKeyMissing,
      text: key,
    })
  }

  return (
    <Chat
      chatState={chatState}
      loading={loading}
      handleSendCommand={handleSendCommand}
      handleApiKey={handleApiKey}
      handleSend={handleSend}
    />
  )
}

export default App;
