import { FormEvent, useEffect, useRef, useState, Fragment } from "react"
import SidebarHeader from "./SidebarHeader"
import Loading from "./Loading"
import SendIcon from "./SendIcon"
import SidebarMessage from "./SidebarMessage"
import { OpenAIStream } from "../utils/openai"
import { v4 as uuidv4 } from 'uuid';
import { vscode } from "../utils/vscode"
import { VSCodeButton, VSCodeDivider, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ChatState } from "../types"

type Editor = {
  selectedText: string
  language: string
} | null

export default function Sidebar() {
  const [chatState, setChatState] = useState<ChatState>(vscode.getState() as ChatState || [])
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [editor, setEditor] = useState<Editor>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = window.openAIPayload
    if (!payload) {
      vscode.postMessage({
        command: 'payloadSidebarError',
        text: 'Something went wrong with the API. No payload found.',
      });
      return
    }

    if (!userPrompt) return

    const textContent = editor?.selectedText
      ? `${userPrompt}\n\n${editor.selectedText}`
      : userPrompt

    setLoading(true)
    setChatState((prev) => [...prev, { role: 'user', content: userPrompt }])

    try {
      const content = await OpenAIStream(
        [...chatState, { role: 'user', content: textContent }],
        payload
      )
      if (!content) {
        vscode.postMessage({
          command: 'apiSidebarError',
          text: 'Something went wrong with the API. Please try again later.',
        });
        return
      }
      vscode.setState([
        ...chatState,
        { role: 'user', content: userPrompt },
        { role: 'system', content, language: editor?.language }
      ])
      setChatState((prev) => [...prev, { role: 'system', content, language: editor?.language }])
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
      if (event.data.type === 'selectedText') {
        setEditor(event.data.editor)
      }
    })
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    containerRef.current?.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
  }, [chatState.length])

  const handlePrompt = (value: string) => {
    vscode.postMessage({
      command: 'selectedText'
    });
    setUserPrompt(value)
  }

  const clearChatContext = () => {
    setChatState([])
    vscode.setState([])
  }

  return (
    <div ref={containerRef} className="h-full min-h-screen flex flex-col pt-4">
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
          chatState={chatState}
          editor={editor}
          setChatState={setChatState}
          setLoading={setLoading}
          setEditor={setEditor}
        />

        <VSCodeDivider className="block m-0 mt-5 bg-gray-500/10 h-0.5" role="separator" />

        {chatState.map(({ role, content, language = '' }) => (
          <Fragment key={uuidv4()}>
            <div className={`py-4 ${role === 'user' ? '' : 'bg-[var(--vscode-editor-background)]'}`}>
              <SidebarMessage
                content={content}
                type={role}
                language={language}
              />
            </div>
            <VSCodeDivider className="block m-0 bg-gray-500/10 h-0.5" role="separator" />
          </Fragment>
        ))}
      </div>

      {/* var(--vscode-editor-foreground) */}

      <div className='mt-auto sticky bottom-0 bg-[var(--vscode-sideBar-background)]'>
        <form onSubmit={handleSubmit} className='pb-2 pt-4 px-4'>
          <div className='relative block'>
            <VSCodeTextField
              // @ts-ignore
              ref={inputRef}
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
