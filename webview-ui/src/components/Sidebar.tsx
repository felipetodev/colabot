import { useEffect, useState, Fragment, memo } from "react"
import SidebarHeader from "./SidebarHeader"
import SidebarMessage from "./SidebarMessage"
import ChatInput from "./ChatInput"
import { v4 as uuidv4 } from 'uuid';
import { vscode } from "../utils/vscode"
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import { LangChainStream } from "../utils/opaneai-chain"
import useAutoScroll from "../hooks/useAutoScroll"
import throttle from 'just-throttle'

import { type ChatState, type Editor, VSCodeMessageTypes } from "../types.d"

const Sidebar = memo(function Sidebar() {
  const [content, setContent] = useState('')
  const [chatState, setChatState] = useState<ChatState>(vscode.getState() as ChatState || [])
  const [editor, setEditor] = useState<Editor>(null)
  const [loading, setLoading] = useState<boolean>(false)
  
  const {
    textareaRef,
    messagesEndRef,
    chatContainerRef,
    handleScroll,
    scrollDown,
  } = useAutoScroll()

  const throttledScrollDown = throttle(scrollDown, 250)

  useEffect(() => {
    throttledScrollDown()
  }, [chatState.length, throttledScrollDown])

  const handleSend = async () => {
    const payload = window.openAIPayload
    if (!payload) {
      vscode.postMessage({
        command: VSCodeMessageTypes.PayloadSidebarError,
        text: 'Something went wrong with the API. No payload found.',
      });
      return
    }

    const message = textareaRef.current?.value
    const selectedText = editor?.selectedText ?? ''
    if (!message) return

    setLoading(true)
    setChatState((prev) => [...prev, { role: 'user', content: message }])

    let chatUpdate: ChatState = [...chatState, { role: 'user', content: message }]

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        selectedText,
        payload,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            if (textareaRef.current) {
              textareaRef.current.value = ''
            }
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
        command: VSCodeMessageTypes.PayloadSidebarError,
        text: JSON.parse(jsonError).error.message
      });
    } finally {
      textareaRef.current.value = ''
      setEditor(null)
      setLoading(false)
      setContent('')
    }
  }

  useEffect(() => {
    // set up listener for selected text from editor
    window.addEventListener('message', async (event) => {
      const { type, editor } = event.data as { type: 'selectedText' | 'clearChat', editor: Editor }
      if (type === 'selectedText') {
        setEditor(editor)
      }
      if (type === 'clearChat') {
        setChatState([])
        vscode.setState([])
      }
    })
  }, [])

  const handlePrompt = (value: string) => {
    vscode.postMessage({
      command: VSCodeMessageTypes.SelectedText
    })
    setContent(value)
  }

  const handleUpdateConversation = async (type: 'EXPLAIN' | 'FIX' | 'TEST') => {
    const selectedText = editor?.selectedText
    if (!selectedText) return
    setLoading(true)
    let prompt = ''
    if (type === 'EXPLAIN') {
      prompt = 'Explain this code'
    }
    if (type === 'FIX') {
      prompt = 'Fix this code'
    }
    if (type === 'TEST') {
      prompt = 'Test this code'
    }

    let chatUpdate: ChatState = [...chatState, { role: 'user', content: prompt }]
    setChatState(chatUpdate)

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        selectedText,
        window.openAIPayload!,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            if (textareaRef.current) {
              textareaRef.current.value = ''
            }
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
        { role: 'user', content: prompt },
        { role: 'system', content: text, language: editor?.language }
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setEditor(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`
    }
  }, [content])

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="h-full min-h-screen flex flex-col"
    >
      <div>
        <SidebarHeader
          onUpdateConversation={handleUpdateConversation}
        />

        <VSCodeDivider className="block m-0 mt-5 bg-gray-500/10 h-0.5" role="separator" />

        {chatState.map(({ role, content, language }) => (
          <Fragment key={uuidv4()}>
            <div className={`py-4 ${role === 'user' ? '' : 'bg-[var(--vscode-editor-background)]'}`}>
              <SidebarMessage
                content={content}
                role={role}
                language={language}
              />
            </div>
            <VSCodeDivider className="block m-0 bg-gray-500/10 h-0.5" role="separator" />
          </Fragment>
        ))}
        <div
          className='h-0.5'
          ref={messagesEndRef}
        />
      </div>

      {/* var(--vscode-editor-foreground) */}

      <ChatInput
        content={content}
        textareaRef={textareaRef}
        loading={loading}
        onSend={handleSend}
        onPrompt={({ target }) => handlePrompt(target.value)}
      />
    </div>
  )
})

export default Sidebar
