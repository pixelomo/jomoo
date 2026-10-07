import ContactForm from '@/components/contact/ContactForm'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'お問い合わせ',
  description:
    'JOMOO JAPANへのお問い合わせ。スマートトイレX40シリーズをはじめとする製品のご相談、販売・お取引、アフターサービス、採用についてはこちらからご連絡ください。',
  path: '/contact-us',
})

export default function ContactUsPage() {
  return (
    // .signup carries the page's own background and padding, so the wrapper
    // only needs to let it fill.
    <main className="flex-1">
      <ContactForm />
    </main>
  )
}
