'use client'

import { useState } from 'react'
import type { Question } from '@/lib/types'

const BADGE: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

interface Props {
  question: Question
  onAnswer: (answer: string, questionId: string) => void
}

export default function QuestionCard({ question, onAnswer }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    const trimmed = answer.trim()
    if (!trimmed) return
    setSubmitted(true)
    onAnswer(trimmed, question.id)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((x) => !x)}
        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[question.difficulty]}`}>
                {question.difficulty}
              </span>
              {question.subtopic && (
                <span className="text-xs text-slate-500">{question.subtopic}</span>
              )}
              {question.diagram_required && (
                <span className="text-xs text-indigo-500">📐 Diagram</span>
              )}
            </div>
            <p className="text-sm text-slate-800 leading-relaxed line-clamp-2">
              {question.question_text}
            </p>
          </div>
          <span className="text-slate-400 text-sm mt-0.5">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded: full question + answer input */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed mt-4 whitespace-pre-line">
            {question.question_text}
          </p>

          {!submitted ? (
            <div className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here…"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
              />
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Check my answer
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-indigo-600 font-medium">
              ✅ Answer submitted — check the Chat tab for feedback.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
