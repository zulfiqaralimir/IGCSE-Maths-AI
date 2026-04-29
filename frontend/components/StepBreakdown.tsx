interface Props {
  steps: string[]
}

export default function StepBreakdown({ steps }: Props) {
  if (!steps.length) return null
  return (
    <div className="mt-3 space-y-2">
      {steps.map((step, i) => {
        const isFinal = step.toLowerCase().startsWith('final answer')
        return (
          <div
            key={i}
            className={`px-4 py-2.5 rounded-lg border text-sm ${
              isFinal
                ? 'bg-green-50 border-green-200 text-green-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {step}
          </div>
        )
      })}
    </div>
  )
}
