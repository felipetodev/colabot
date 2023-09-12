import { type MutableRefObject, type KeyboardEvent, useState, useEffect } from "react"
import Loading from "./Loading"
import SendIcon from "./SendIcon"
import { vscode } from "../utils/vscode"
import { VSCodeMessageTypes } from "../types"

type Props = {
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  loading: boolean
  onSend: (message: string) => void
}

const ChatInput = ({
  textareaRef,
  loading,
  onSend
}: Props) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault()
      onSend(message)
      setMessage('')
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
  }, [message])

  return (
    <div className='mt-auto sticky bottom-0 bg-[var(--vscode-sideBar-background)]'>
      <div className='pb-2 pt-4 px-4'>
        <div className='relative block'>
          <textarea
            rows={1}
            ref={textareaRef}
            value={message}
            onChange={({ target }) => {
              // add debounce (?)
              vscode.postMessage({
                command: VSCodeMessageTypes.SelectedText
              })
              setMessage(target.value)
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            className='w-full pr-10 resize-none bg-[var(--vscode-input-background)] p-2 focus:outline-[var(--vscode-focusBorder)]'
            placeholder='How can I help you?'
            name='prompt'
            style={{
              resize: 'none',
              bottom: `${textareaRef?.current?.scrollHeight ?? 0}px`,
              maxHeight: '200px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 200
                  ? 'auto'
                  : 'hidden'
              }`
            }}
          />
          <div className='absolute top-0 flex items-center justify-center h-full right-4'>
            <button
              onClick={() => {
                onSend(message)
                setMessage('')
              }}
              disabled={loading}
              className='transition-all hover:scale-110'
            >
              {loading ? <Loading /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
