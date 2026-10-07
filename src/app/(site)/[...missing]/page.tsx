import { notFound } from 'next/navigation'

/**
 * Any URL no other route claims. Without it Next answers with app/not-found.tsx,
 * which sits outside the (site) layout — a bare page with no menu or footer.
 * Routing it here renders (site)/not-found.tsx inside the site chrome instead,
 * still with a 404 status.
 */
export default function Missing() {
  notFound()
}
