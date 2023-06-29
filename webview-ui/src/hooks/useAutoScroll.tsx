import { useEffect, useRef, useState } from 'react'

export default function useAutoScroll () {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [showScrollDownButton, setShowScrollDownButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true)
    }
  }

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current
      const bottomTolerance = 30

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false)
        setShowScrollDownButton(true)
      } else {
        setAutoScrollEnabled(true)
        setShowScrollDownButton(false)
      }
    }
  }

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting)
        if (entry.isIntersecting) {
          textareaRef.current?.focus()
        }
      },
      {
        root: null,
        threshold: 0.5
      }
    )
    const messagesEndElement = messagesEndRef.current
    if (messagesEndElement) {
      observer.observe(messagesEndElement)
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement)
      }
    }
  }, [messagesEndRef])

  return {
    textareaRef,
    messagesEndRef,
    chatContainerRef,
    scrollDown,
    handleScroll,
    handleScrollDown,
    showScrollDownButton
  }
}
