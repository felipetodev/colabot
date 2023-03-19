import snarkdown from 'snarkdown'
import { ChatState } from '../types';

type Props = {
  content: ChatState[0]['content'];
  type: ChatState[0]['role'];
}

export default function SidebarCard({ content, type }: Props) {
  return (
    <div className={`flex items-center justify-center ${type === 'user' ? 'bg-blue-500/50 rounded-br-lg' : 'bg-blue-500/20 rounded-bl-lg'} p-2 rounded-t-lg`}>
      {type === 'user' ? (
        <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) : (
        <svg fill="currentColor" className="w-6 h-6 mr-2" viewBox="0 0 24 24">
          <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM8 15h8v2H8v-2z"></path>
        </svg>
      )}
      <div className='flex-1 items-center whitespace-pre-wrap overflow-x-auto'>
        <div className='w-full break-words prose-invert'>
          <p dangerouslySetInnerHTML={{ __html: snarkdown(content) }} />
        </div>
      </div>
    </div>
  )
}
