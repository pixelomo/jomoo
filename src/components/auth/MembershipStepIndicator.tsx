interface MembershipStepIndicatorProps {
  currentStep: number
  labels: string[]
}

export default function MembershipStepIndicator({
  currentStep,
  labels,
}: MembershipStepIndicatorProps) {
  return (
    <nav aria-label="Membership registration steps" className="account-steps">
      <ol className="account-steps__list">
        {labels.map((label, index) => {
          const step = index + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep
          const state = isComplete ? 'is-complete' : isActive ? 'is-active' : 'is-future'

          return (
            <li key={label} className="account-steps__item">
              <div className="account-steps__marker">
                <span
                  className={`account-steps__dot ${state}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                <span className={`account-steps__label ${state}`}>{label}</span>
              </div>

              {index < labels.length - 1 && (
                <span className={`account-steps__line ${state}`} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
