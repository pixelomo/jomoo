import type { Metadata } from 'next'
import FaqList from '@/components/faq/FaqList'

export const metadata: Metadata = {
  title: 'よくあるご質問',
  description:
    'JOMOO製品のよくあるご質問。スマートトイレ、水栓金具、シャワー、洗面化粧台、キッチンシンクなどの仕様・水圧条件・お手入れ方法についてご案内します。',
}

export default function FaqPage() {
  return <FaqList />
}
