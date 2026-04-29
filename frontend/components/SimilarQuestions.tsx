import type { SimilarQuestion } from '@/lib/types'

const BADGE: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

interface Props {
  questions: SimilarQuestion[]
  onSelect: (q: SimilarQuestion) => void
}

export default function SimilarQuestions({ questions, onSelect }: Props) {
  if (!questions.length) return null
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        Try these
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q)}
            className="min-w-[200px] max-w-[240px] text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors shrink-0"
          >
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[q.difficulty]}`}>
              {q.difficulty}
            </span>
            {q.subtopic && (
              <p className="text-xs text-slate-500 mt-1">{q.subtopic}</p>
            )}
            <p className="text-sm text-slate-700 mt-1 line-clamp-3">{q.question_text}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
