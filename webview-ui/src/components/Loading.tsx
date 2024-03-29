import { useState, useEffect } from 'react'

const loadingStates = [
  [true, false, false], // .
  [true, true, false], // ..
  [true, true, true] // ...
]

export default function Loading({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index + 1) % loadingStates.length)
    }, 500)

    return () => clearInterval(interval)
  }, [index])

  return (
    <div className={`flex items-center text-3xl ${className}`}>
      <div>·</div>
      <div className={index > 0 ? '' : 'invisible'}>·</div>
      <div className={index === 2 ? '' : 'invisible'}>·</div>
    </div>
  )
}
