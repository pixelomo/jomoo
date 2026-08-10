import ContactForm from '@/components/contact/ContactForm'

export default function ContactUsPage() {
  return (
    // .signup carries the page's own background and padding, so the wrapper
    // only needs to let it fill.
    <main className="flex-1">
      <ContactForm />
    </main>
  )
}
