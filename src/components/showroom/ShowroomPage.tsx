import ShowroomHero from './ShowroomHero'
import ShowroomInfo from './ShowroomInfo'
import './showroom.css'

/**
 * ショールーム. Opens on the render of the showroom itself, then gives the
 * details in one table on white — who runs it, where it is, when it is open —
 * with the map and the way through to a booking under it.
 */
export default function ShowroomPage() {
  return (
    <main className="sh">
      <ShowroomHero />
      <ShowroomInfo />
    </main>
  )
}
