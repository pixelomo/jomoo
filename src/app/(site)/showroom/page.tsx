import type { Metadata } from 'next'
import ShowroomPage from '@/components/showroom/ShowroomPage'

export const metadata: Metadata = {
  title: 'ショールーム',
  description:
    'JOMOOショールーム（運営：株式会社TRUST）。〒206-0042 東京都多摩市山王下1-12-12 福満ビル 101。スマートトイレ、洗面化粧台、水栓金具、シャワーセットを実際にご覧いただけます。ご来場は事前予約を承っています。',
}

export default function Showroom() {
  return <ShowroomPage />
}
