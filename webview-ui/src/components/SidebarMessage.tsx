import { useRef, memo, type FormEvent } from 'react'
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';

import { type Message } from '../types.d';

interface Props extends Message {
  onHandleApiKey: (key: { key: string }) => void
}

const SidebarMessage = memo(function SidebarMessage({
  content,
  role,
  language,
  error = false,
  onHandleApiKey
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputRef.current || !inputRef.current.value.trim()) return
    onHandleApiKey({ key: inputRef.current.value })
  }
  return (
    <div className='mx-4 flex flex-col justify-center'>
      {role === 'user' ? (
        <div className='flex items-center mb-1.5'>
          <svg className="w-7 h-7 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h1 className='font-bold'>
            User
          </h1>
        </div>
      ) : (
        <div className='flex items-center mb-1.5'>
          <span className="flex justify-center items-center bg-white p-1.5 w-6 h-6 rounded-full mr-1.5">
            🤖
          </span>
          <h1 className='font-bold'>
            ColaBOT Assistant
          </h1>
        </div>
      )}
      <div className='flex-1 items-center whitespace-pre-wrap overflow-x-auto'>
        <div className='w-full break-words prose-invert'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code ({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className ?? '')

                return !inline
                  ? (
                    <CodeBlock
                      key={Math.random()}
                      language={language ?? (match && match[1]) ?? ''}
                      value={String(children).replace(/\n$/, '')}
                      {...props}
                    />
                    )
                  : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                    )
              },
            }}
          >
            {content}
          </ReactMarkdown>
          {error && (
            <form onSubmit={handleSubmit} className='flex gap-x-2 items-end'>
              <input
                ref={inputRef}
                type="password"
                className="mt-1.5 h-6 bg-[var(--vscode-input-background)] p-2 focus:outline-[var(--vscode-focusBorder)] placeholder:opacity-50"
                placeholder="•••••"
              />
              <button type='submit' className='hover:text-green-600'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
})

export default SidebarMessage
