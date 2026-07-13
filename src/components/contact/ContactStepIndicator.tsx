'use client'

interface ContactStepIndicatorProps {
  currentStep: number
  labels: string[]
}

const PRIMARY = '#73a4c7'

export default function ContactStepIndicator({
  currentStep,
  labels,
}: ContactStepIndicatorProps) {
  return (
    <nav aria-label="Contact form steps" className="mb-10">
      <ol className="flex items-start justify-center">
        {labels.map((label, index) => {
          const step = index + 1
          const isComplete = step < currentStep
          const isFuture = step > currentStep

          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center min-w-[7rem]">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor: PRIMARY,
                    backgroundColor: isFuture ? '#ffffff' : PRIMARY,
                    color: isFuture ? PRIMARY : '#ffffff',
                  }}
                  aria-current={step === currentStep ? 'step' : undefined}
                >
                  {isComplete ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                <span
                  className={[
                    'mt-2 text-center text-xs font-medium leading-snug',
                    !isFuture ? 'text-zinc-900' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>

              {index < labels.length - 1 && (
                <div
                  className="mx-3 mb-6 h-px w-20 sm:w-28"
                  style={{ backgroundColor: isComplete ? PRIMARY : '#d7e6f0' }}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
