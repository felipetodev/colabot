import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import type { ChatState } from "../types"
import Loading from "./Loading"
import SendIcon from "./SendIcon"
import SidebarCard from "./SidebarCard"
import { vscode } from "../utils/vscode"
import { OpenAIStream } from "../utils/openai"

const DEFAULT_CHAT_STATE: ChatState = [
  {
    role: 'system',
    content: 'Hi, I am ColaBOT, how can I help you?'
  }
]

const getDefaultChatState = () => {
  if (window !== undefined) {
    const chatState = localStorage.getItem('chatState')
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
    e.preventDefault()
    if (!userPrompt) return
    setLoading(true)
    setChatState((prev) => [...prev, { role: 'user', content: userPrompt }])
    setUserPrompt('')

    vscode.postMessage({
      command: 'sidebarPrompt',
      text: userPrompt,
    });

    try {
      let payload
      if (window !== undefined) {
        payload = window.openAIPayload
      }
      if (!payload) {
        throw new Error('No payload found')
      }
      const content = await OpenAIStream(userPrompt, payload);
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

  useEffect(() => {
    if (chatState.length <= 1) return
    localStorage.setItem('chatState', JSON.stringify(chatState))
  }, [chatState])

  const clearChatContext = () => {
    setChatState(DEFAULT_CHAT_STATE)
    localStorage.removeItem('chatState')
  }

  return (
    <div className="h-screen flex flex-col justify-between pt-4">
      <div>
        <h1 className='text-blue-400 text-3xl font-bold mb-4'>
          ColaBOT Chat 🤖
        </h1>
        <button className="flex ml-auto" onClick={clearChatContext}>Reset Chat</button>
        {chatState && chatState.map((chat, idx) => {
          const { role, content } = chat
          // TODO: Add uuidv4
          return (
            <div key={idx} className='mb-4'>
              <SidebarCard content={content} type={role} />
              {chatState.length - 1 === idx && <div className='h-2' />}
            </div>
          )
        })}
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
