import { Fragment } from 'react'

interface MembershipStepIndicatorProps {
  currentStep: number
  labels: string[]
  activeStatus: string
  completeStatus: string
}

function Check() {
  return (
    <svg
      className="account-steps__check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function MembershipStepIndicator({
  currentStep,
  labels,
  activeStatus,
  completeStatus,
}: MembershipStepIndicatorProps) {
  return (
    <nav aria-label="JOMOOクラブ会員登録の手順">
      <ol className="account-steps">
        {labels.map((label, index) => {
          const step = index + 1
          // The last step is the completion screen — reaching it means every
          // step is done, itself included.
          const isLast = step === labels.length
          const isComplete = step < currentStep || (isLast && currentStep === step)
          const isActive = step === currentStep && !isComplete

          const status = isComplete ? completeStatus : isActive ? activeStatus : null

          return (
            <Fragment key={label}>
              {index > 0 && (
                <div
                  className={[
                    'account-steps__line',
                    step <= currentStep ? 'account-steps__line--complete' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              )}
              <li className="account-steps__cell">
                <div
                  className={[
                    'account-steps__dot',
                    isComplete ? 'account-steps__dot--complete' : '',
                    !isComplete && !isActive ? 'account-steps__dot--upcoming' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check /> : step}
                </div>
                <span className="account-steps__label">{label}</span>
                {status && (
                  <span
                    className={[
                      'account-steps__status',
                      isActive ? 'account-steps__status--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {status}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
