import MembershipStepIndicator from '@/components/auth/MembershipStepIndicator'

interface ContactStepIndicatorProps {
  currentStep: number
  labels: string[]
}

/**
 * The 会員登録 indicator with the enquiry form's status wording.
 *
 * A wrapper rather than a second implementation: the two forms are the same
 * design, and the last copy of this drifted into its own colours and sizes the
 * moment sign-up was redrawn.
 */
export default function ContactStepIndicator({
  currentStep,
  labels,
}: ContactStepIndicatorProps) {
  return (
    <MembershipStepIndicator
      currentStep={currentStep}
      labels={labels}
      activeStatus="入力中"
      completeStatus="完了"
    />
  )
}
