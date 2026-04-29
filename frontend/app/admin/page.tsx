'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { deleteQuestion, fetchQuestions } from '@/lib/api'
import type { Difficulty, Question } from '@/lib/types'

const BADGE: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

const FILTERS: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All',    value: 'all' },
  { label: 'Easy',   value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard',   value: 'hard' },
]

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filter, setFilter] = useState<Difficulty | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    fetchQuestions('Sets', filter === 'all' ? undefined : filter)
      .then(setQuestions)
      .catch(() => setError('Could not load questions.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  async function handleDelete(q: Question) {
    if (!window.confirm(`Delete this question?\n\n"${q.question_text.slice(0, 80)}…"`)) return
    try {
      await deleteQuestion(q.id)
      setQuestions((prev) => prev.filter((x) => x.id !== q.id))
    } catch {
      alert('Delete failed.')
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Admin CMS</h2>
            <p className="text-xs text-slate-500">Manage Sets questions</p>
          </div>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Add Question
          </Link>
        </header>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white shrink-0 flex items-center gap-2">
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
          <span className="ml-auto text-xs text-slate-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto chat-scroll">
          {loading && (
            <p className="text-center py-16 text-slate-400 text-sm">Loading…</p>
          )}
          {error && (
            <p className="text-center py-16 text-red-500 text-sm">{error}</p>
          )}
          {!loading && !error && questions.length === 0 && (
            <p className="text-center py-16 text-slate-400 text-sm">
              No questions found.{' '}
              <Link href="/admin/new" className="text-indigo-600 underline">Add one</Link>
              {' '}or run the seed script.
            </p>
          )}

          {questions.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-3 font-semibold text-slate-500 w-1/2">Question</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Subtopic</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Difficulty</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Year / Paper</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Source</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-800 line-clamp-2 leading-relaxed">
                        {q.question_text}
                      </p>
                      {q.diagram_required && (
                        <span className="text-xs text-indigo-500 mt-0.5 block">📐 Diagram</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                      {q.subtopic ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                      {q.year ? `${q.year} · P${q.paper}V${q.variant}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.source === 'past_paper'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {q.source === 'past_paper' ? 'Past paper' : 'Generated'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(q)}
                        className="text-slate-400 hover:text-red-500 transition-colors text-lg leading-none"
                        title="Delete question"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
