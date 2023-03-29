import { vscode } from "../utils/vscode"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { OpenAIStream } from "../utils/openai"
import type { ChatState } from "../types"

type Props = {
  chatState: ChatState
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>
  codeSelected: string
  setCodeSelected: (codeSelected: string) => void
  setLoading: (loading: boolean) => void
}

export default function Header({
  chatState,
  setChatState,
  codeSelected,
  setCodeSelected,
  setLoading
}: Props) {
  const clearChatContext = () => {
    setChatState([])
    vscode.setState([])
  }

  const getSelectedText = () => {
    vscode.postMessage({
      command: 'selectedText'
    });
  }

  const handleShortcut = async (shortcut: string) => {
    if (!codeSelected) alert('Please select some code first.')
    if (codeSelected) {
      setLoading(true)
      let prompt = ''
      if (shortcut === 'EXPLAIN') {
        prompt = `Explain this code:\n\n${codeSelected}`
      }
      if (shortcut === 'FIX') {
        prompt = `Fix this code:\n\n${codeSelected}`
      }
      if (shortcut === 'TEST') {
        prompt = `Test this code:\n\n${codeSelected}`
      }
      try {
        const content = await OpenAIStream([...chatState, { role: 'user', content: prompt }], window.openAIPayload!)
        if (!content) {
          vscode.postMessage({
            command: 'apiSidebarError',
            text: 'Something went wrong with the API. Please try again later.',
          });
          return
        }
        vscode.setState([
          ...chatState,
          { role: 'system', content }
        ])
        setChatState((prev) => [...prev, { role: 'system', content }])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
        setCodeSelected('')
      }
    }
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center mb-4">
        <span className="flex justify-center items-center bg-white p-1.5 w-8 h-8 text-lg rounded-full mr-2">🤖</span>
        <h1 className='font-bold'>
          ColaBOT Chat
        </h1>
        <VSCodeButton appearance="secondary" className="flex ml-auto" onClick={clearChatContext}>
          Clear Chat
        </VSCodeButton>
      </div>
      <div className="flex flex-col gap-3">
        <p>Welcome, I'm ColaBOT and I'm here to help you get things done faster. I can identify issues, explain and even improve code.</p>
        <p>You can ask generic questions, but what I'm really good at is helping you with your code. For example:</p>
        <div className="flex flex-col gap-2">
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => handleShortcut('TEST')} className="font-bold">Generate unit tests of my code.</VSCodeLink>
          </p>
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => handleShortcut('EXPLAIN')} className="font-bold">Explain the selected code.</VSCodeLink>
          </p>
          <p>
            ✨ <VSCodeLink onMouseOver={getSelectedText} onClick={() => handleShortcut('FIX')} className="font-bold">Propose a fix for the bugs in my code.</VSCodeLink>
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
