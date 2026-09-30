import { Fragment } from 'react'

/** Lines of copy from the Studio, with a <br> between each and nowhere else. */
export default function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}
