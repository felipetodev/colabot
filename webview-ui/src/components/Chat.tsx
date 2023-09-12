import { useEffect, memo } from "react"
import ChatInput from "./ChatInput"
import SidebarHeader from "./SidebarHeader"
import SidebarMessage from "./SidebarMessage"
import useAutoScroll from "../hooks/useAutoScroll"
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react"
import throttle from "just-throttle"
import { v4 as uuidv4 } from 'uuid';
import { type ChatState } from "../types"

type Props = {
  chatState: ChatState
  loading: boolean
  handleSendCommand: (type: { type: 'explain' | 'fix' | 'test' }) => void
  handleApiKey: (key: { key: string }) => void
  handleSend: (message: string) => void
}

const Chat = memo(({
  chatState,
  loading,
  handleSend,
  handleSendCommand,
  handleApiKey
}: Props) => {
  const {
    textareaRef,
    messagesEndRef,
    chatContainerRef,
    handleScroll,
    scrollDown,
  } = useAutoScroll()

  const throttledScrollDown = throttle(scrollDown, 250)

  useEffect(() => {
    throttledScrollDown()
  }, [chatState.length, throttledScrollDown])

  return (
    <div className="h-full min-h-screen flex flex-col">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <SidebarHeader
          onUpdateConversation={handleSendCommand}
        />

        <VSCodeDivider className="block m-0 mt-5 bg-gray-500/10 h-0.5" role="separator" />

        {chatState.map(({ role, content, language, error }) => (
          <SidebarMessage
            key={uuidv4()}
            content={content}
            role={role}
            error={error}
            language={language}
            onHandleApiKey={handleApiKey}
          />
        ))}
        <div
          className='h-0.5'
          ref={messagesEndRef}
        />
      </div>

      <ChatInput
        textareaRef={textareaRef}
        loading={loading}
        onSend={(message) => {
          messagesEndRef.current?.scrollIntoView(true)
          handleSend(message)
        }}
      />
    </div>
  )
})

export default Chat
