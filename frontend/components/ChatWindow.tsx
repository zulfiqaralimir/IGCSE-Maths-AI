'use client'

import { useEffect, useRef } from 'react'
import type { Message, SimilarQuestion } from '@/lib/types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: Message[]
  loading: boolean
  onSelectSimilar: (q: SimilarQuestion) => void
}

export default function ChatWindow({ messages, loading, onSelectSimilar }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto chat-scroll px-6 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onSelectSimilar={onSelectSimilar} />
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
