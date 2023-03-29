import ReactMarkdown from 'react-markdown'
import { ChatState } from '../types';

type Props = {
  content: ChatState[0]['content'];
  type: ChatState[0]['role'];
}

export default function SidebarCard({ content, type }: Props) {
  return (
    <div className='mx-4 flex flex-col justify-center'>
      {type === 'user' ? (
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
            components={{
              pre: ({ node, ...props }) => (
                <pre className='p-1 bg-[var(--vscode-sideBar-background)] overflow-x-scroll' {...props} />
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
