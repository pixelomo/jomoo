<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database

The schema lives in `src/lib/db/schema.ts` and is applied with `npm run db:push` (drizzle-kit push — there is no migrations folder). `DATABASE_URL` is not loaded automatically for a bare `drizzle-kit` run, so pass it in:

```sh
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-) npx drizzle-kit push
```

The tables `serial_numbers`, `serial_audit_logs`, `email_templates` and `dealer_branches` exist on the Railway database that `.env.local` points at. **If you are on a machine whose `DATABASE_URL` points somewhere else, run `db:push` before using the serial library or the email-template editor** — those pages query tables that will not be there.

`push` compares the whole schema and can propose destructive statements, so check what it plans before applying it to a database holding real data. Purely additive changes are easier to ship as a re-runnable script instead — `scripts/add-dealer-branches.mjs` is the pattern.

Dealer branches (`dealer_branches`, `user.member_type`, `user.branch_id`, `product_registrations.branch_id`) are applied with `node scripts/add-dealer-branches.mjs`, then `node scripts/backfill-dealer-branches.mjs --apply` gives accounts created before the feature a member type and a branch. `dealer_branches.phone` / `.email` come from `node scripts/add-dealer-contact.mjs`, and `product_registrations.installation_address_city` (市区町村) from `node scripts/add-installation-city.mjs`.

# Member types

Sign-up offers three: パートナー (`partner`), 法人 (`corporate`) and 個人
(`individual`). パートナー and 法人 fill in the same company form, but only a
パートナー is a dealer: its application waits as `user.partner_status =
'pending'` until an admin approves it on `/admin/partners` (search, status
filter, approve/reject, CSV of the filtered or ticked rows). Approval
(`lib/partners.ts`) creates the dealer branch and opens the 支店の登録製品 tab;
rejecting unlinks it. A 法人 account works exactly as a 個人 one does — no
branch, address editable. The partner columns come from
`node scripts/add-partner-members.mjs`. `scripts/backfill-dealer-branches.mjs`
predates this and still writes `corporate` — do not re-run it as it stands.

株式会社TRUST — the dealer on the ショールーム page — is the one branch that did not
arrive as a sign-up. `npx tsx scripts/seed-trust-dealer.mts` writes it from
the details printed on that page, and `--email … --password …` also gives it the
approved パートナー account that owns it.

# Product series

Series live only in Sanity: `/products/[series]` renders any **published**
`productSeries`, and the menu, footer and sitemap list published series with
「メニューに表示」 on (a dropdown under 商品情報 appears from two). The site client
reads the `published` perspective, so drafts never reach a page.

The serial library's add and import can start a series: names the CMS lacks are
confirmed by staff and written as **draft** `productSeries` / `product` documents
(`lib/catalogDrafts.ts`), with Studio links to publish them. Nothing shows on
the site until they are published.

# Test serial numbers

Until the factory's real list arrives (X40 stock: November 2026) the serial
library holds 80 test serials, batch `TEST-2026-10`, from
`node scripts/seed-test-serials.mjs` — X40-B / X40-C are J + 19 (20 characters),
every other line J + 20 (21). `--remove` deletes them and any registration that
used one; **run it before importing the real list.** The registration form only
lets a serial the library confirms continue.

# CMS pages

The top page and ブログ, 会社情報, デザイナー, グローバルプロジェクト, ショールーム,
採用情報, よくあるご質問 and アフターサービス render from Sanity: one `blogPost`
document per post, and one singleton per page (`homePage`, `companyPage`, `designerPage`,
`globalProjectsPage`, `showroomPage`, `careersPage`, `faqPage`,
`afterSalesPage` — the type name is the document id, and the Studio lists them
under ページ). The 無料修理規定 on the warranty certificate is read from
`afterSalesPage` too, so the two cannot disagree. Each `termGroups` entry is one titled
section of that policy, and its title is also the jump button above the terms
(`scripts/split-warranty-terms.mjs` made the four that exist).

On the top page only words and pictures are in the CMS — the sections, their
order and their motion stay in code. Its lineup cards are references to
`product` documents (the same 一覧カード the series page shows), and its award
row is `designerPage.awards`. The catalog/contact cards that close the top page,
会社情報 and the product pages are the `siteCta` singleton, read by
`FooterCtaSection` itself (an async server component, so a client component that
ends on it takes it as a prop).

Q&A (`/faq`) is hidden for now: `HIDDEN_ROUTES` in `components/layout/siteLinks.ts`
404s the page and drops its links and sitemap entry; remove it from that list to
bring it back.

Header and footer links are the `siteNavigation` singleton, fetched in
`(site)/layout.tsx`. `DEFAULT_NAV` in `components/layout/siteLinks.ts` is what
shipped and fills any field the document lacks — including every field when
Sanity is unreachable — so the chrome never renders empty. There is no fallback copy
in the source; a missing singleton 404s its page.
`node scripts/seed-cms-pages.mjs --apply` writes them from
`scripts/cms-pages.json` (create-only; `--replace` overwrites Studio edits).

# Admin portal accounts

`ADMIN_ACCOUNTS` entries are `username:password:role[:department]`. The role
decides what the account may do (export, delete); the optional department pins
it to one contact inbox — `business`, `aftersales` or `recruitment`, defined in
`src/types/contact.ts` — so that account's enquiry list and CSV export hold only
the categories routed there. No department means every enquiry, which is what
`ADMIN_USERNAME` / `ADMIN_PASSWORD` (the owner) gets.

A department is an address, not a label: moving one in `CONTACT_DEPARTMENTS`
moves the contact form's routing and the portal's filter together.
`npm run check:contact-routing` prints where each category resolves and fails
if one moved unintentionally; `npx tsx scripts/seed-mock-enquiries.mts` writes
one briefing enquiry per category so each desk login has something to open, and
`--remove` takes them away again.
`npx tsx scripts/send-demo-enquiries.mts` sends three realistic enquiries per
category through the live form (real mail to each desk) for client demos; it
refuses to run while the Resend sending domain is unverified, and `--remove`
deletes them — **run `--remove` before launch**.

# Cookie consent

The banner in `src/components/consent/` stores one cookie, `jomoo_consent`, holding
a version and one bit per optional category (`v2.10` — analytics yes, external
media no). `src/lib/cookieConsent.ts` is the shared model, read on the server in
`(site)/layout.tsx` so the bar never flashes, and written in the browser.

**Bump `CONSENT_VERSION` whenever the categories change**, or whenever what sits
behind them does: an older value parses as "no answer yet", so everyone is asked
again rather than being held to a choice about a different set of cookies.

Nothing optional runs without consent. YouTube embeds go through
`ConsentedVideo` and the ショールーム map through `ConsentedMap`, neither of which
requests the frame at all until 外部メディア is allowed. Google Analytics loads only when `NEXT_PUBLIC_GA_ID` is set **and**
分析Cookie is agreed to — with no id the analytics row is hidden entirely, since
a category that gates nothing should not be offered.

# Deploying

Vercel is connected to this repo, so `git push` to `main` deploys. `vercel --prod` also deploys, but it uploads the working directory rather than a commit — **commit and push before deploying**, or the next person's push will silently revert your work.
