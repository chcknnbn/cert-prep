import type { TrueFalseQuestion } from '../../types'

interface Props {
  question: TrueFalseQuestion
  selected: boolean | null
  submitted: boolean
  onSelect: (value: boolean) => void
}

export default function TrueFalse({ question, selected, submitted, onSelect }: Props) {
  const options: { label: string; value: boolean; symbol: string }[] = [
    { label: 'TRUE', value: true, symbol: '○' },
    { label: 'FALSE', value: false, symbol: '✕' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map(({ label, value, symbol }) => {
        const isSelected = selected === value
        const isCorrect = value === question.answer
        const isWrong = submitted && isSelected && !isCorrect

        let borderColor = 'rgb(var(--space-600))'
        let bgColor = 'rgb(var(--space-800))'
        let textColor = 'rgb(var(--space-300))'

        if (submitted) {
          if (isCorrect) {
            borderColor = '#10b981'
            bgColor = 'rgba(16,185,129,0.08)'
            textColor = '#10b981'
          } else if (isWrong) {
            borderColor = '#ef4444'
            bgColor = 'rgba(239,68,68,0.08)'
            textColor = '#ef4444'
          } else {
            borderColor = 'rgb(var(--space-600))'
            bgColor = 'rgb(var(--space-800) / 0.38)'
            textColor = 'rgb(var(--space-400))'
          }
        } else if (isSelected) {
          borderColor = '#f59e0b'
          bgColor = 'rgba(245,158,11,0.08)'
          textColor = '#f59e0b'
        }

        return (
          <button
            key={label}
            onClick={() => !submitted && onSelect(value)}
            disabled={submitted}
            className="flex flex-col items-center justify-center py-8 rounded-xl border-2 transition-all duration-200"
            style={{ borderColor, background: bgColor }}
          >
            <div
              className="mono text-4xl font-bold mb-2 transition-colors"
              style={{ color: textColor }}
            >
              {symbol}
            </div>
            <div
              className="mono font-bold text-sm tracking-widest transition-colors"
              style={{ color: textColor }}
            >
              {label}
            </div>
            {submitted && isCorrect && (
              <div className="mono text-[10px] text-emerald-400 mt-1 tracking-widest">정답</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
