import { useState, type MutableRefObject, type ChangeEvent, type KeyboardEvent } from "react"
import Loading from "./Loading"
import SendIcon from "./SendIcon"

type Props = {
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  content: string
  loading: boolean
  onSend: () => void
  onPrompt: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const ChatInput = ({
  onSend,
  textareaRef,
  content,
  onPrompt,
  loading
}: Props) => {
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className='mt-auto sticky bottom-0 bg-[var(--vscode-sideBar-background)]'>
      <div className='pb-2 pt-4 px-4'>
        <div className='relative block'>
          <textarea
            rows={1}
            ref={textareaRef}
            value={content}
            onChange={onPrompt}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            className='w-full resize-none bg-[var(--vscode-input-background)] p-2 focus:outline-[var(--vscode-focusBorder)]'
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
              onClick={onSend}
              disabled={loading}
              className='transition-all hover:scale-125'
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
