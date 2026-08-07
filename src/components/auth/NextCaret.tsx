/** The chevron on 次へ. An SVG rather than a › glyph, which renders at a
 *  different weight and baseline in every font it lands in. */
export default function NextCaret() {
  return (
    <svg
      className="signup__next-caret"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
