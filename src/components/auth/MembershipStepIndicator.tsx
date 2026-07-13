interface MembershipStepIndicatorProps {
  currentStep: number
  labels: string[]
}

const PRIMARY = '#73a4c7'

export default function MembershipStepIndicator({
  currentStep,
  labels,
}: MembershipStepIndicatorProps) {
  return (
    <nav aria-label="Membership registration steps" className="mb-10">
      <ol className="flex items-start justify-center">
        {labels.map((label, index) => {
          const step = index + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep
          const isFuture = step > currentStep

          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center min-w-[6.5rem]">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor: PRIMARY,
                    backgroundColor: isFuture ? '#ffffff' : PRIMARY,
                    color: isFuture ? PRIMARY : '#ffffff',
                  }}
                  aria-current={isActive ? 'step' : undefined}
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
                    isActive || isComplete ? 'text-zinc-900' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>

              {index < labels.length - 1 && (
                <div
                  className="mx-3 mb-6 h-px w-16 sm:w-24"
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
