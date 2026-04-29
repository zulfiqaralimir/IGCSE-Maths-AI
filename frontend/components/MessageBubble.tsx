import type { Message, SimilarQuestion } from '@/lib/types'
import AudioButton from './AudioButton'
import DiagramCard from './DiagramCard'
import SimilarQuestions from './SimilarQuestions'
import StepBreakdown from './StepBreakdown'

const TOOL_LABEL: Record<string, string> = {
  generate_diagram:     '📐 Diagram',
  get_similar_questions:'🔍 Similar',
  evaluate_answer:      '✅ Evaluate',
  explain:              '💡 Explain',
}

interface Props {
  message: Message
  onSelectSimilar: (q: SimilarQuestion) => void
}

export default function MessageBubble({ message, onSelectSimilar }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  const { data } = message
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        {/* Tool badge */}
        {data?.tool_used && (
          <p className="text-xs text-slate-400 mb-1 ml-1">
            {TOOL_LABEL[data.tool_used] ?? data.tool_used}
          </p>
        )}

        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {message.content}
          </p>

          {/* Step breakdown */}
          {data?.steps && data.steps.length > 0 && (
            <StepBreakdown steps={data.steps} />
          )}

          {/* Marks badge (evaluation) */}
          {data?.marks != null && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
              <span className="text-indigo-700 font-bold text-sm">{data.marks} marks</span>
            </div>
          )}

          {/* Diagram */}
          {data?.diagram_url && <DiagramCard url={data.diagram_url} />}

          {/* Voice — on-demand, non-blocking */}
          <AudioButton text={message.content} />
        </div>

        {/* Similar questions */}
        {data?.similar_questions && data.similar_questions.length > 0 && (
          <SimilarQuestions questions={data.similar_questions} onSelect={onSelectSimilar} />
        )}
      </div>
    </div>
  )
}
