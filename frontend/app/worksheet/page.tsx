'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QuestionCard from '@/components/QuestionCard'
import Sidebar from '@/components/Sidebar'
import { fetchQuestions, sendChat } from '@/lib/api'
import type { Difficulty, Question } from '@/lib/types'

const FILTERS: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All',    value: 'all' },
  { label: 'Easy',   value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard',   value: 'hard' },
]

export default function WorksheetPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<Difficulty | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchQuestions('Sets', filter === 'all' ? undefined : filter)
      .then(setQuestions)
      .catch(() => setError('Could not load questions. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [filter])

  async function handleAnswer(answer: string, questionId: string) {
    // Fire the evaluation in background; route to chat so the student sees feedback
    await sendChat(`my answer is: ${answer}`, 'Sets', questionId)
    router.push('/chat')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Sets — Worksheet</h2>
          <p className="text-xs text-slate-500">Attempt questions, then get AI feedback</p>
        </header>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white shrink-0 flex gap-2">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Question grid */}
        <div className="flex-1 overflow-y-auto chat-scroll p-6">
          {loading && (
            <div className="text-center py-16 text-slate-400 text-sm">Loading questions…</div>
          )}
          {error && (
            <div className="text-center py-16 text-red-500 text-sm">{error}</div>
          )}
          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              No questions found. Run the seed script to populate the database.
            </div>
          )}
          <div className="grid gap-4 max-w-3xl mx-auto">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} onAnswer={handleAnswer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
