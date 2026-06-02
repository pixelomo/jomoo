# Phase 1 — Build Tracker

**Deadline: July 31, 2026**
**Stack:** Next.js 16 · Better Auth + TOTP 2FA · Railway/Drizzle · Sanity v5 · Cloudinary · Resend · next-intl (zh-CN/en)

---

## Homepage

- [x] Scroll-driven hero with canvas frame video (X40)
- [x] Product series grid section
- [x] Stats/brand band
- [x] SEO meta tags + sitemap.ts
- [ ] OG image for social sharing
- [ ] **Pending final design** — polish pass once designs delivered

---

## Navigation Bar

- [x] Logo → homepage link
- [x] Product Series dropdown (all 4 categories)
- [x] Sign In / Sign Up links (utility bar)
- [x] Locale switcher (zh-CN ↔ en)
- [x] Mobile menu
- [x] Product Registration CTA (`/register` button in header)
- [ ] **Pending final design** — visual polish pass

---

## Product Series Pages

> **Note:** Series pages currently have hardcoded model lists. Detail pages pull from Sanity via `getProductSlugs`. Needs a decision: migrate series listing to Sanity-driven, or keep hardcoded for launch?

- [x] Smart Toilet series page
- [x] Washstand (Vanity) series page
- [x] Faucets & Fixtures series page
- [x] Shower Set series page
- [ ] **Pending final design** — waiting on final hero images / copy per category
- [ ] Series page intro copy (bilingual) — needs client content
- [ ] ~~Migrate series listings to Sanity-driven~~ — decide before launch

---

## Product Detail Pages

- [x] High-resolution image carousel (`ImageCarousel.tsx`)
- [x] Specification table (dimensions, material, power, drainage method)
- [x] Feature video slot — placeholder shown when no URL; iframe embed ready
- [x] PortableText body copy from Sanity
- [x] All 4 categories wired to Sanity: smart-toilet, washstand, faucets, shower-set
- [x] Static params + SEO metadata generated per product
- [ ] **Pending final design** — structure complete, waiting on final assets
- [ ] Actual product feature videos — placeholders in place, client to supply

---

## Product Registration

- [x] 3-step form: Basic Info → Serial Number → Attachments
- [x] Zod validation on all steps
- [x] Serial number validation route (`/api/serial-validate`) — stub with mock data, swap via env var when CRM ready
- [x] Cloudinary signed upload for serial number / purchase proof photos
- [x] Registration submission → Railway DB
- [x] Registration confirmation email (Resend)
- [x] Electronic warranty card page (`/warranty/[id]`)
- [x] Printable warranty card component
- [ ] Real CRM serial validation endpoint — blocked on client supplying API/credentials
- [ ] Post-approval email trigger (review → approved → send warranty email)

---

## CMS

- [x] Sanity Studio embedded at `/studio`
- [x] Product schema — bilingual name/tagline, modelCode, specs, images, feature video URL
- [x] Products seeded in Sanity
- [ ] WYSIWYG editing for product series page intro copy
- [ ] Admin registration review workflow (approve/reject from Studio)
- [ ] Marketing / brand copy fields for homepage sections

---

## Member Portal

- [x] Dashboard — view registered products with status badges
- [x] User profile section — inline edit for name, gender, date of birth
- [x] 2FA setup / disable flow (TOTP with QR code + backup codes)
- [x] Warranty card view per registration
- [x] Delete account (with confirmation modal)
- [ ] View all electronic warranty cards in one place

---

## Security

- [x] Full-site HTTPS (Vercel)
- [x] Better Auth with TOTP 2FA (admin/backend login)
- [x] SQL injection prevention (Drizzle ORM, parameterized queries)
- [x] Security headers (CSP, HSTS, X-Frame-Options etc.)
- [x] Supabase RLS
- [x] Vercel cron to keep DB connection alive

---

## Gaps / Watch List

Items not in the original spec — flag before delivery:

- [x] **Custom 404 page** — branded, bilingual, matches site style (`not-found.tsx` at site + root level)
- [x] **UI/UX tests** — Playwright installed; tests cover nav, homepage, product pages, auth guards, registration step flow
- [ ] **i18n completeness audit** — confirm all UI strings are in both `zh-CN.json` and `en.json`
- [ ] **Mobile registration flow** — file upload on iOS/Android needs real-device test
- [ ] **Email templates** — confirmation and warranty emails are plain-text; styled HTML would improve deliverability perception
