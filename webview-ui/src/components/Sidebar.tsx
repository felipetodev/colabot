import { FormEvent, useEffect, useState, Fragment } from "react"
import SidebarHeader from "./SidebarHeader"
import Loading from "./Loading"
import SendIcon from "./SendIcon"
import SidebarMessage from "./SidebarMessage"
import { v4 as uuidv4 } from 'uuid';
import { vscode } from "../utils/vscode"
import { VSCodeButton, VSCodeDivider, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { LangChainStream } from "../utils/opaneai-chain"
import useAutoScroll from "../hooks/useAutoScroll"
import throttle from 'just-throttle'

import { type ChatState, type Editor, VSCodeMessageTypes } from "../types.d"

export default function Sidebar() {
  const [chatState, setChatState] = useState<ChatState>(vscode.getState() as ChatState || [])
  const [userPrompt, setUserPrompt] = useState<string>('')
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = window.openAIPayload
    if (!payload) {
      vscode.postMessage({
        command: VSCodeMessageTypes.PayloadSidebarError,
        text: 'Something went wrong with the API. No payload found.',
      });
      return
    }

    if (!userPrompt) return

    const message = editor?.selectedText
      ? `${userPrompt}\n\n${editor.selectedText}`
      : userPrompt

    setLoading(true)
    setChatState((prev) => [...prev, { role: 'user', content: userPrompt }])

    let chatUpdate: ChatState = [...chatState, { role: 'user', content: message }]

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        payload,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            setUserPrompt('')
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
        { role: 'user', content: userPrompt },
        { role: 'system', content: text, language: editor?.language }
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setUserPrompt('')
      setEditor(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    // set up listener for selected text from editor
    window.addEventListener('message', async (event) => {
      const { type, editor } = event.data as { type: 'selectedText', editor: Editor }
      if (type === 'selectedText') {
        setEditor(editor)
      }
    })
  }, [])

  const handlePrompt = (value: string) => {
    vscode.postMessage({
      command: VSCodeMessageTypes.SelectedText
    });
    setUserPrompt(value)
  }

  const clearChatContext = () => {
    setChatState([])
    vscode.setState([])
  }

  const handleUpdateConversation = async (type: 'EXPLAIN' | 'FIX' | 'TEST') => {
    if (!editor?.selectedText) return

    setLoading(true)
    let prompt = ''
    if (type === 'EXPLAIN') {
      prompt = `Explain this code:\n
\`\`\`${editor.language}
${editor.selectedText}
\`\`\``
    }
    if (type === 'FIX') {
      prompt = `Fix this code:\n
\`\`\`${editor.language}
${editor.selectedText}
\`\`\``
    }
    if (type === 'TEST') {
      prompt = `Test this code:\n
\`\`\`${editor.language}
${editor.selectedText}
\`\`\``
    }

    let chatUpdate: ChatState = [...chatState, { role: 'user', content: prompt }]
    setChatState(chatUpdate)

    let text = ''
    let isFirst = true
    try {
      await LangChainStream(
        chatUpdate,
        window.openAIPayload!,
        ({ message }: { message: string }) => {
          if (message === '[DONE]' || message === '[ERROR]') {
            setUserPrompt('')
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

  return (
    <div
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="h-full min-h-screen flex flex-col pt-4"
    >
      <div className="px-4 bg-[var(--vscode-sideBar-background)] sticky top-0 z-10 flex justify-between items-center pb-4">
        <span className="flex justify-center items-center bg-white p-1.5 w-8 h-8 text-lg rounded-full mr-2">🤖</span>
        <h1 className='font-bold'>
          ColaBOT Chat
        </h1>
        <VSCodeButton appearance="secondary" className="flex ml-auto" onClick={clearChatContext}>
          Clear Chat
        </VSCodeButton>
      </div>
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

      <div className='mt-auto sticky bottom-0 bg-[var(--vscode-sideBar-background)]'>
        <form onSubmit={handleSubmit} className='pb-2 pt-4 px-4'>
          <div className='relative block'>
            <VSCodeTextField
              // @ts-ignore
              ref={textareaRef}
              value={userPrompt}
              onInput={({ target }) => {
                const { value } = target as HTMLInputElement;
                handlePrompt(value);
              }}
              autofocus
              placeholder='How can I help you?'
              name='prompt'
              type='text'
              style={{ width: '100%' }}
            />
            <div className='absolute top-0 flex items-center justify-center h-full right-4'>
              <button disabled={loading} className='transition-all hover:scale-125' type='submit'>
                {loading ? <Loading /> : <SendIcon />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
