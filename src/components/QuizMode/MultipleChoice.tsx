import type { MultipleChoiceQuestion } from '../../types'

interface Props {
  question: MultipleChoiceQuestion
  selected: number | null
  submitted: boolean
  onSelect: (index: number) => void
}

export default function MultipleChoice({ question, selected, submitted, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {question.options.map((option, i) => {
        const isSelected = selected === i
        const isCorrect = i === question.answer
        const isWrong = submitted && isSelected && !isCorrect

        let className = 'option-btn w-full text-left flex items-start gap-4 p-4 rounded-lg border '

        if (submitted) {
          className += ' answered'
          if (isCorrect) className += ' correct'
          else if (isWrong) className += ' wrong'
          else className += ' border-space-700 bg-space-800/50 opacity-50'
        } else {
          className += isSelected
            ? ' border-amber-500/60 bg-amber-500/5 selected'
            : ' border-space-600 bg-space-800'
        }

        return (
          <button
            key={i}
            className={className}
            onClick={() => !submitted && onSelect(i)}
            disabled={submitted}
          >
            <span
              className="mono text-xs font-bold mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border"
              style={{
                borderColor: submitted
                  ? isCorrect
                    ? '#10b981'
                    : isWrong
                    ? '#ef4444'
                    : 'rgb(var(--space-600))'
                  : isSelected
                  ? '#f59e0b'
                  : 'rgb(var(--space-600))',
                color: submitted
                  ? isCorrect
                    ? '#10b981'
                    : isWrong
                    ? '#ef4444'
                    : 'rgb(var(--space-400))'
                  : isSelected
                  ? '#f59e0b'
                  : 'rgb(var(--space-400))',
              }}
            >
              {submitted && isCorrect ? '✓' : submitted && isWrong ? '✗' : String.fromCharCode(65 + i)}
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{
                color: submitted
                  ? isCorrect
                    ? '#10b981'
                    : isWrong
                    ? '#ef4444'
                    : 'rgb(var(--space-400))'
                  : isSelected
                  ? '#fbbf24'
                  : 'rgb(var(--space-100))',
              }}
            >
              {option}
            </span>
          </button>
        )
      })}
    </div>
  )
}
