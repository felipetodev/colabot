import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import type { ChatState } from "../types"
import Loading from "./Loading"
import SendIcon from "./SendIcon"
import SidebarCard from "./SidebarCard"
import { OpenAIStream } from "../utils/openai"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { v4 as uuidv4 } from 'uuid';
import { vscode } from "../utils/vscode"

const DEFAULT_CHAT_STATE: ChatState = [
  {
    role: 'system',
    content: 'Hi, I am ColaBOT, how can I help you?'
  }
]

const STORAGE_KEY = 'chatState'

const getDefaultChatState = () => {
  if (window !== undefined) {
    const chatState = localStorage.getItem(STORAGE_KEY)
    if (chatState) return JSON.parse(chatState)
    return DEFAULT_CHAT_STATE
  }
}

export default function Sidebar() {
  const [chatState, setChatState] = useState<ChatState>(getDefaultChatState())
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const payload = window.openAIPayload
    if (!payload) {
      vscode.postMessage({
        command: 'payloadSidebarError',
        text: 'Something went wrong with the API. No payload found.',
      });
      return
    }

    e.preventDefault()
    if (!userPrompt) return
    setLoading(true)
    setChatState((prev) => [...prev, { role: 'user', content: userPrompt }])
    setUserPrompt('')

    try {
      const content = await OpenAIStream([...chatState, { role: 'user', content: userPrompt }], payload)
      if (!content) {
        vscode.postMessage({
          command: 'apiSidebarError',
          text: 'Something went wrong with the API. Please try again later.',
        });
        return
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          ...chatState,
          { role: 'user', content: userPrompt },
          { role: 'system', content }
        ])
      )
      setChatState((prev) => [...prev, { role: 'system', content }])
    } catch (error) {
      console.error(error)
    } finally {
      setUserPrompt('')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.focus()
  }, [])

  const handlePrompt = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setUserPrompt(value)
  }

  const clearChatContext = () => {
    setChatState(DEFAULT_CHAT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="h-screen flex flex-col justify-between pt-4">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className='text-blue-400 text-xl font-bold'>
            ColaBOT Chat 🤖
          </h1>
          <VSCodeButton className="flex ml-auto" onClick={clearChatContext}>
            Clear Chat
          </VSCodeButton>
        </div>
        {chatState.map(({ role, content }, idx) => (
          <div key={uuidv4()} className='mb-4'>
            <SidebarCard content={content} type={role} />
            {chatState.length - 1 === idx && <div className='h-2' />}
          </div>
        ))}
        {loading && (
          <div className='-mt-6 px-1 flex items-center text-xs'>
            <Loading className="mr-2" /> Searching
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className='pb-4'>
        <div className='relative block'>
          <input
            ref={inputRef}
            value={userPrompt}
            onChange={handlePrompt}
            autoFocus
            placeholder='How can I help you?'
            name='prompt'
            type='text'
            className={`resize-none pr-10 placeholder-white/30 ${loading ? 'opacity-40 pointer-events-none' : ''} rounded-2xl block w-full text-md px-6 py-4 border border-blue-600 bg-white/5 backdrop-blur-3xl sm:text-md shadow-lg text-white outline-none overflow-hidden transition ring-blue-400/40 focus:ring-2 focus:outline-none`}
          />
          <div className='absolute top-0 flex items-center justify-center h-full right-4'>
            <button disabled={loading} className='transition-all hover:scale-125' type='submit'>
              {loading ? <Loading /> : <SendIcon />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
