import { vscode } from "../utils/vscode"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { VSCodeMessageTypes } from "../types.d"

type Props = {
  onUpdateConversation: (type: 'EXPLAIN' | 'FIX' | 'TEST') => void
}

export default function SidebarHeader({
  onUpdateConversation
}: Props) {
  const getSelectedText = () => {
    vscode.postMessage({
      command: VSCodeMessageTypes.SelectedText
    });
  }

  return (
    <div className="px-4">
      <div className="flex items-center py-2">
        <span className="flex justify-center items-center bg-white p-1.5 w-8 h-8 text-lg rounded-full mr-2">
          🤖
        </span>
        <h1 className='font-bold'>
          ColaBOT Chat
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        <p>Welcome, I'm ColaBOT and I'm here to help you get things done faster. I can identify issues, explain and even improve code.</p>
        <p>You can ask generic questions, but what I'm really good at is helping you with your code. For example:</p>
        <div className="flex flex-col gap-2">
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => onUpdateConversation('TEST')} className="font-bold">Generate unit tests of my code.</VSCodeLink>
          </p>
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => onUpdateConversation('EXPLAIN')} className="font-bold">Explain the selected code.</VSCodeLink>
          </p>
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => onUpdateConversation('FIX')} className="font-bold">Propose a fix for the bugs in my code.</VSCodeLink>
          </p>
        </div>
        <p>
          If you want to learn more about my capabilities,{' '}
          <VSCodeLink href="https://github.com/felipetodev/colabot/discussions" target='_blank' className="font-bold">
            ask for help in our repo.
          </VSCodeLink>
        </p>
      </div>
    </div>
  )
}
