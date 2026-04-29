'use client'

import { useState } from 'react'
import ChatInput from '@/components/ChatInput'
import ChatWindow from '@/components/ChatWindow'
import Sidebar from '@/components/Sidebar'
import { sendChat } from '@/lib/api'
import type { Message, SimilarQuestion } from '@/lib/types'

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content:
    "Hello! I'm your IGCSE Maths tutor.\n\n" +
    'Ask me anything about Sets — intersections, unions, Venn diagrams, set notation, and more.\n\n' +
    'Try: "Explain how to find A ∩ B" or "Draw a Venn diagram for two sets" or "Give me a practice question".',
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [loading, setLoading] = useState(false)

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg])
  }

  async function handleSend(text: string, questionId?: string) {
    addMessage({ id: Date.now().toString(), role: 'user', content: text })
    setLoading(true)

    try {
      const data = await sendChat(text, 'Sets', questionId)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation,
        data,
      })
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check that the backend is running.',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectSimilar(q: SimilarQuestion) {
    handleSend(`Show me how to solve this question: ${q.question_text}`, q.id)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Sets — AI Tutor</h2>
          <p className="text-xs text-slate-500">Cambridge IGCSE Mathematics 0580</p>
        </header>

        <ChatWindow messages={messages} loading={loading} onSelectSimilar={handleSelectSimilar} />
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}
