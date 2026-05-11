interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <nav aria-label="Registration steps" className="mb-8">
      <ol className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                    isComplete
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : isActive
                        ? 'border-zinc-900 text-zinc-900 bg-white'
                        : 'border-zinc-200 text-zinc-400 bg-white',
                  ].join(' ')}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={[
                    'mt-1.5 text-xs font-medium hidden sm:block',
                    isActive ? 'text-zinc-900' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {labels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={[
                    'flex-1 h-px mx-2 mb-5',
                    isComplete ? 'bg-zinc-900' : 'bg-zinc-200',
                  ].join(' ')}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
