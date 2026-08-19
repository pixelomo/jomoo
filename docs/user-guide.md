# JOMOO Japan — System Guide (Phase 1)

**Status:** Phase 1, delivered. Live at `https://jomoo-ashy.vercel.app` pending the domain cutover to the client's own domain.
**Last updated:** 17 August 2026
**Language of the site:** Japanese only. There is no language switcher and no locale routing — all customer-facing text lives in one translation file.

---

## ⚠️ Instructions for the agent producing the final documents

*This section is working instruction, not client content. Delete it from anything delivered.*

### Split into three documents, not one

The material below serves three audiences who need almost nothing from each other. A single document forces a bathroom retailer's customer-service staff to scroll past database schemas.

| # | Document | Audience | Source sections | Format |
|---|---|---|---|---|
| 1 | **Member Guide** | Japanese end customers; front-line customer service answering their questions | Part A | Short doc or slides, heavy on screenshots. ~8–10 pages. |
| 2 | **Staff Operations Manual** | JOMOO staff running the admin portal and the product catalogue day to day | Parts B and C | Document. The main deliverable — task-based, step-by-step. |
| 3 | **Technical Handover** | JOMOO's development team, if they take the system over | Part D + Appendices | Document. Assumes a developer reader. |

Optionally a fourth: a **10–15 slide delivery deck** summarising what was built, for the handover meeting. Draw from the System Overview and the summary tables. Do not make the deck the only deliverable — it cannot carry step-by-step instructions.

### Language

Confirm with the client before producing final copy. Suggested default:

- **Member Guide → Japanese.** The readers are Japanese customers.
- **Staff Operations Manual → Japanese and Simplified Chinese.** Operations staff are likely to be in Japan; oversight is likely to be in China.
- **Technical Handover → English or Simplified Chinese.** Developer audience; all code, comments and variable names are in English, so an English document matches what they will actually read.

### How to write it

- **Task-based, not feature-based.** Head sections with what the reader wants to do ("Issue a warranty by hand", "Import serial numbers from the factory"), not with the name of the screen.
- **Screenshots are essential** for documents 1 and 2 and are not yet taken. Every screen named below needs one. Flag this to the client — someone with an admin login must capture them, ideally with realistic data.
- **Do not invent behaviour.** Where this guide says something is not yet built or not yet switched on, say so plainly in the final document. A delivery manual that overstates the system creates support calls.
- **Keep the "Not in Phase 1" section.** Chinese delivery practice expects scope to be stated explicitly. It protects both sides.

---

## System overview

Four surfaces, one system:

| Surface | Address | Who uses it | Sign-in |
|---|---|---|---|
| **Public website** | `/` | Anyone | None |
| **Member portal** | `/dashboard` | Registered customers | Email + password |
| **Admin portal** | `/admin` | JOMOO staff | Separate username + password |
| **Content studio (Sanity)** | `/studio` | Whoever maintains product pages | Sanity account |

The admin portal is deliberately **not linked from anywhere on the public site**. Staff reach it by typing the address.

What the system does, in one line each:

- Presents the product catalogue (four series, individual product pages with specifications, images and 3D/video).
- Takes enquiries through a contact form and routes each to the right department.
- Registers customers as JOMOO Club members.
- Lets members register a product they have bought, against its serial number.
- Issues an electronic warranty card automatically when the serial number checks out.
- Gives staff an admin portal to see and manage all of the above, plus a serial number library with a full audit trail.

---

# Part A — Guide for customers (member-facing)

## A1. Browsing products

No account needed.

- Four series: **スマートトイレ** (smart toilets), **洗面台** (washstands), **水栓** (faucets), **シャワー** (shower sets).
- Each series page lists its products; each product page carries the hero image, feature cards, a full specification table, and where available a video or interactive 3D view.
- All of this content is edited in the Sanity studio (Part C) — it is not hard-coded.

## A2. Making an enquiry

**Where:** お問い合わせ (`/contact-us`)

1. Choose the enquiry type. This decides which department receives it.
2. Fill in name, company (optional), email, and phone (optional).
3. Write the enquiry.
4. Optionally tick ショールーム予約 to request a showroom visit, then give a preferred date and time.
5. Submit. A confirmation screen appears.

**What happens next:** the enquiry is emailed to the department that owns that category, and an automatic acknowledgement goes to the customer. Every enquiry is also **stored in the system**, so nothing is lost if an email fails — staff can see and download them all in the admin portal.

**The six categories and where they go:**

| Category | Routed to |
|---|---|
| 業務提携・アライアンスについて | Partnerships |
| 製品・サービスに関するお問い合わせ | Product & service |
| 資料請求・お見積り | Materials & quotations |
| ご利用中のお客様サポート | Customer support |
| 不具合・障害報告 | Faults |
| 採用に関するお問い合わせ | Recruitment |

The destination address for each is configurable without changing the site (see Part D).

## A3. Creating an account (会員登録)

**Where:** 新規会員登録 (`/sign-up`)

Three steps, shown by a progress indicator across the top.

**Step 1 — 会員種別選択.** Choose 法人のお客様 (corporate) or 個人のお客様 (individual). This changes which fields appear next.

**Step 2 — 会員情報登録.** Email, name and furigana, phone, address, password.
- Corporate members also give a company name and its furigana.
- Individual members are additionally asked for gender and date of birth (both optional).
- Password rules: at least 8 characters, and a mix of upper case, lower case, and numbers or symbols.

**Step 3 — 登録完了.** The account is created when 次へ is pressed on step 2 — there is no separate confirmation screen to press again. The member is signed in immediately and can go straight to their page.

> **Note for staff:** email address confirmation is built but **switched off** for Phase 1, at the client's request, so a member is never blocked from using the site while waiting for an email. It can be switched back on with an environment setting and a redeploy (Part D). While it is off, a typo'd email address will still create a usable account — but that member will never receive their warranty card, so it is worth checking addresses when supporting a customer.

## A4. Signing in and out

**Where:** ログイン (`/sign-in`)

Email address and password. On success the member lands on their page (`/dashboard`).

- **Forgotten password:** a reset link is emailed. The link is valid for one hour.
- **Signing out:** from the member page.
- **Two-factor authentication (TOTP):** built and working, but **switched off** for Phase 1. When enabled, sign-in gains a second screen asking for a six-digit code from an authenticator app.

## A5. Registering a product (製品登録)

**Where:** 製品を登録 (`/register`) — sign-in required.

Three steps.

**Step 1 — basic information.** Choose the product model, then give the installation date, the installation address, a contact name, and optionally the purchase date and the dealer's name.

**Step 2 — serial number (製造番号).** Type the number from the product label and press 製造番号を照合する to check it.
- A serial is the letter **J** followed by digits — 19 for most products, 20 for shower sets.
- The field cleans input as it is typed: spaces and dashes are removed, full-width digits from a Japanese keyboard are converted, and characters that could never be part of a serial simply cannot be entered.
- **A serial number can only be registered once, by anyone.** If it has already been used, registration stops with a clear message.

**Step 3 — photographs.** Upload a photo of the warranty document and a photo of the serial number plate. Up to 10 MB each; JPEG, PNG or HEIC.

**What happens on submit:**

| If the serial number… | Status | Result |
|---|---|---|
| passes the check | 登録済み（保証付き） | **Electronic warranty card issued immediately**, and emailed |
| does not pass | 審査中 | Held for staff review, flagged in the admin portal, and an acknowledgement emailed |

### A5b. Photo-first registration (optional variant)

**Where:** `/register?auto=true`

An alternative version of step 2 aimed at phones: photograph the serial plate first, and the system reads the number off the image so the member only has to check it rather than type twenty digits. The number always stays editable, alternative readings are offered, and the same check decides the outcome — the photograph never grants a warranty on its own.

> **Not active yet.** This requires a paid text-recognition add-on that is not currently subscribed. Until it is, the screen falls back to typing the number by hand. The normal `/register` flow is unaffected and remains the default.

## A6. The electronic warranty card (電子保証カード)

**Where:** `/warranty/<registration id>` — reached from the member page.

Shows the product, serial number, customer, installation address and expiry date, formatted to be printed or saved as a PDF. Below it sit the full 無料修理規定 (warranty terms) and the JOMOO Club section. Only the card itself prints; the terms and club sections are hidden from the printout.

**Warranty length:** two years from the installation date.

## A7. The member page (マイページ)

**Where:** `/dashboard`

Three tabs:

**ご登録製品** — every product the member has registered, each row showing model, installation date, serial number, status, and photographs. From here they can view the warranty card, or edit or delete a registration while it is still 審査中 or 要修正. Below the list sits the 保証延長 panel and a button to register another product.

**ご契約情報** — the warranties currently held, with model, serial number and expiry date, and a link to each card.

**お客様情報** — the member's own details, with 編集する leading to the full 登録情報変更 form (`/account`) where they can change their details or their password. The email address is shown read-only, because it is the sign-in identity.

---

# Part B — Guide for staff (admin portal)

## B1. Signing in and what you are allowed to do

**Where:** `/admin` — not linked from the public site.

Username and password, separate from customer accounts. The signed-in user and their role are shown at the bottom of the sidebar (or in the top bar on a phone).

### Roles

Three roles, controlling the two actions that cannot be undone from inside the portal.

| Role | View & edit | Download CSV | Delete |
|---|---|---|---|
| **Operator** | ✅ | ❌ | ❌ |
| **Manager** | ✅ | ✅ | ❌ |
| **Owner** | ✅ | ✅ | ✅ |

Buttons the role cannot use are hidden or disabled, **and** the action is refused by the server — so the restriction cannot be worked around. If a button seems to be missing, check the role shown in the sidebar before reporting a fault.

The portal works on a phone or tablet: the sidebar becomes a scrolling top bar, and wide tables scroll sideways within their panel.

## B2. Dashboard

Member count, warranties issued, registrations without a warranty, and the most recent registrations. The starting point for the day.

## B3. Users (会員)

- Search members by name or email.
- Open a member to see their details and every product they have registered.
- Edit a member's name, email, gender or date of birth.
- **Delete a member** (Owner only). This also removes their registrations and warranties. Any serial numbers they had registered are released back to **Unused**, so the product can be registered again by its next owner.
- **Download CSV** (Manager and above) — the full member list with profile fields and registration counts.

## B4. Registrations (製品登録)

Every product registration, filterable by With Warranty / No Warranty. Open one to see the full submission including the uploaded photographs, the serial number, and whether it passed the check.

Registrations that failed the serial check are flagged for review — these are the ones needing a decision.

## B5. Serial numbers (製造番号ライブラリ)

The factory's list of issued serial numbers. Four tabs.

### Library

Every serial in the system. Search by number, model, batch or note. Filter by status; each filter shows its count.

**The four statuses:**

| Status | Meaning |
|---|---|
| **Unused** | Issued by the factory, not yet registered by anyone |
| **Bound** | Registered to a member |
| **Revoked** | Withdrawn — scrapped, recalled, or issued in error |
| **Abnormal** | Flagged for investigation — duplicate, suspected forgery, bad batch |

**Importing from the factory.** Press **Import**. The file window opens straight away and the file is imported as soon as it is chosen.
- Accepts a plain list of serial numbers, one per line, **or** a CSV. If the CSV's first row names its columns (`serial_number`, `series`, `model_name`, `status`, `note`) those are used; otherwise the first column is taken as the serial number.
- The batch label is taken from the file name — so name the file after the delivery note.
- **Re-importing the same file is safe.** Serials already in the library are reported as skipped and are never overwritten, so a registration already attached to one cannot be lost.
- A summary reports how many were added, how many were already there, and lists any rejected rows with their line numbers and the reason.

**Adding one by hand.** **+ Add serial**, for numbers that arrive by phone rather than by file.

**Working on many at once.** Tick the rows, then set a status for all of them, or delete them (Owner only). Up to 500 at a time.

**Editing one.** Open a serial to change its series, model, batch, note or status. Moving a serial off **Bound** also releases it from its registration, so it can be registered again — the registration itself is not touched.

### Usage details

Only the serials that have actually been registered, joined to the member, the registration, the installation date and the warranty expiry. This is the screen to use when a customer telephones about a specific product.

### Audit log

Who did what, and when. Every import, addition, edit, status change, deletion, binding and export, with the operator's name, the timestamp, and what changed. Filterable by action and by operator, searchable, and downloadable as CSV.

**The log is read-only by design** — there is no way to edit or delete an entry from the portal. A record that staff can tidy up is not evidence. Deletion entries deliberately survive the serial they describe, so "who deleted it" always has an answer.

> **Important:** until serial numbers are imported, the system accepts any correctly-formatted number. Importing the factory's list is what turns the check into a real one.

## B6. Warranties

Every warranty issued, with member, product, serial number and expiry date.

## B7. Enquiries (お問い合わせ)

Every contact form submission, with category, sender, message and whether the notification email was delivered. Downloadable as CSV (Manager and above).

Because enquiries are stored as well as emailed, a failed email does not lose the enquiry — the row will show as not delivered, and staff can follow up.

## B8. Emails (自動送信メール)

Controls every automatic email the system sends.

**For each email you can:**
- **Switch it on or off.** Off means customers stop receiving it.
- **Copy operational staff.** Add one or more addresses to be copied on every send.
- **Edit the wording** — press **Edit template**.

**The template editor** shows the editor on the left and a **live preview on the right**, updating as you type, so wording is never saved unseen. The right pane switches between the rendered email and its HTML source.

- **Subject**, **greeting** and **body** are editable. One paragraph per line.
- **Tags** such as `{{name}}` or `{{modelName}}` are replaced with real values when the email is sent. The available tags are listed under the body — click one to copy it. A tag that does not exist is rejected on save, so a typo cannot silently delete a sentence.
- The header, footer and layout are fixed, so a mistake in the wording cannot break the rest of the email.
- **Reset to default** restores the wording the site was delivered with.

Some notifications cover more than one email — 製品登録 covers the acknowledgement, the correction request, and both review outcomes. These appear as tabs inside the editor.

Every email carries the JOMOO wordmark and the copyright line in its footer. The year updates itself.

### The emails the system sends

| Email | When | Switchable |
|---|---|---|
| 会員登録完了メール | An account is created | ✅ |
| パスワード再設定メール | A password reset is requested | ✅ |
| 製品登録受付メール | A registration needs review | ✅ |
| 電子保証カード発行メール | A warranty is issued | ✅ |
| お問い合わせ自動返信 | Someone uses the contact form | ✅ |
| お問い合わせ通知（担当部署） | Contact form — internal copy | ✅ |
| メールアドレス確認メール | Sign-up, while verification is on | Always sent |

---

# Part C — Product content (Sanity CMS)

## C1. What lives where

- **Sanity** holds everything about a *product*: names, model codes, images, feature cards, specification tables, videos, 3D models.
- **The system's own database** holds everything about *people*: members, registrations, warranties, serial numbers, enquiries.

Editing a product page never touches customer data, and vice versa.

## C2. Signing in

**Where:** `/studio`

Sign in with a Sanity account. Access is managed at [sanity.io](https://sanity.io) by whoever administers the project — adding a colleague is done there, not in the site.

## C3. What can be edited

Two document types:

**Product series** — the four category pages.

**Product** — an individual product, organised in tabs:

| Tab | Contains |
|---|---|
| Identity | Model code, series, name, URL slug, tagline |
| Hero | Eyebrow, title, catchphrase, main image |
| Content | Feature cards (title, body, image), standard feature groups, long description |
| Specs | Specification image, and specification tables grouped by section |
| Media | Video, 3D model, gallery |
| Settings | Publishing options |

**Changes appear on the website after publishing.** Draft edits are visible only inside the studio.

> **Take care with the URL slug.** It forms the product's web address. Changing it on a published product breaks any existing links to that page.

---

# Part D — Technical handover

For a development team taking the system over.

## D1. Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2.6**, App Router, React 19, TypeScript |
| Database | **PostgreSQL**, hosted on Railway |
| Database access | **Drizzle ORM** — schema in `src/lib/db/schema.ts` |
| Authentication (members) | **Better Auth** — email/password, optional TOTP |
| Authentication (admin) | Custom — signed JWT in an httpOnly cookie, `src/lib/admin-auth.ts` |
| Content | **Sanity** — studio embedded at `/studio` |
| Image hosting | **Cloudinary** — signed direct-from-browser uploads |
| Email | **Resend** |
| Hosting | **Vercel** — connected to the Git repository |
| Translations | **next-intl**, single Japanese catalogue |
| Testing | **Playwright** |

Styling is a mix of Tailwind CSS v4 utility classes and hand-written stylesheets alongside the components that use them (`member-portal.css`, `jomoo-homepage.css`, `warranty-document.css`, `admin-chrome.css`).

## D2. Repository layout

```
src/
  app/
    (site)/            public site, member portal, auth pages
    admin/             admin portal (login + protected group)
    api/               route handlers
    studio/            embedded Sanity studio
  components/          grouped by area: home, product, dashboard,
                       registration, admin, auth, warranty, ui
  lib/                 db, auth, admin-auth, serial*, email*, resend,
                       cloudinary, sanity, notifications, csv, appUrl
  messages/ja.json     every piece of Japanese UI text
  sanity/schemaTypes/  product and productSeries schemas
docs/                  this guide
```

## D3. Database

Thirteen tables. Better Auth owns `user`, `session`, `account`, `verification`, `two_factor`. The application owns:

| Table | Holds |
|---|---|
| `product_registrations` | Every registration, its status and photographs |
| `warranty_records` | One per registration that earned a warranty |
| `ownership_transfers` | History of changes to a registration's owner details |
| `contact_submissions` | Every contact form enquiry |
| `notification_settings` | Which automatic emails are on, and CC addresses |
| `email_templates` | Admin-edited email wording (absent row = shipped default) |
| `serial_numbers` | The serial number library |
| `serial_audit_logs` | The audit trail — deliberately not foreign-keyed, so entries survive deletion |

**Applying schema changes:**

```sh
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-) npx drizzle-kit push
```

There is no migrations folder — `drizzle-kit push` compares the whole schema against the database. **It can propose destructive statements, so review what it plans before running it against real data.**

## D4. Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Signs member sessions **and** admin tokens |
| `NEXT_PUBLIC_APP_URL` | The site's own origin. **Every link and image in every email is built from this** — it must be updated at the domain cutover |
| `NEXT_PUBLIC_SITE_URL` | Base URL used by the sitemap. Currently unset, so the sitemap publishes a per-deployment hostname — **set this at the cutover** |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | The owner admin account |
| `ADMIN_ACCOUNTS` | Additional staff: `username:password:role`, comma or newline separated. An unknown role is dropped, never defaulted |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email sending |
| `CONTACT_TO_EMAIL`, `CONTACT_TO_<CATEGORY>` | Override the department address for a contact category without a deploy |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `SANITY_API_TOKEN` | Content |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` / `_API_SECRET` | Image uploads |
| `SERIAL_VALIDATION_ENDPOINT` / `_API_KEY` | Optional external serial database (see D7) |
| `NEXT_PUBLIC_AUTH_TWO_FACTOR` | `true` switches TOTP on |
| `NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION` | `true` requires email confirmation before first sign-in |
| `CRON_SECRET` | Protects the scheduled keep-alive route |

## D5. Running and deploying

```sh
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm test           # Playwright
```

**Deployment:** Vercel is connected to the repository, so **pushing to `main` deploys**. `vercel --prod` also deploys, but it uploads the working directory rather than a commit — always commit and push, or the next person's push will silently revert the work.

A daily cron (`/api/cron/keep-alive`, 09:00) keeps the Railway database from idling.

## D6. Things to know before changing anything

- **The serial number check is the only thing that grants a warranty.** The browser sends a `serialNumberValid` flag for its own display; the server ignores it and re-checks. Never trust it.
- **A serial can only be registered once**, enforced by a unique index in the database, not only by the application check — two simultaneous submissions cannot both win.
- **Email failures are never swallowed.** Better Auth's own send route answers 200 even when delivery fails, so the application sends verification mail itself and reports real failures.
- **Audit writes never throw.** A failed audit write is logged loudly but does not roll back the action it describes.
- **Email templates fall back to code.** An absent database row means "use the shipped wording", so improvements to defaults reach anything nobody has edited.

## D7. Not in Phase 1

State these plainly in the delivered document.

| Item | Status |
|---|---|
| **Real serial number validation** | Serials are checked for *format only*. The factory has not supplied a database of issued numbers. Two routes are ready: import the numbers into the serial library, or set `SERIAL_VALIDATION_ENDPOINT` to check against a factory API. Until one is done, any correctly-formatted number is accepted and issued a warranty. |
| **Photo-assisted serial entry** | Built at `/register?auto=true`, but the text-recognition add-on is not subscribed. Falls back to typing. |
| **Two-factor authentication** | Built and working, switched off at the client's request. |
| **Email address confirmation** | Built and working, switched off at the client's request. |
| **Extended warranty (3 years)** | The warranty terms describe a 3-year extension for club members registering within 3 months. The system currently issues the **2-year base warranty**; the extension is not automated. |
| **Revoked / Abnormal serials at registration** | A serial marked Revoked or Abnormal is not currently refused at registration — this is a deliberate policy decision left to the client. |
| **Custom domain** | Site runs on its Vercel address. DNS records for the cutover have been supplied separately. |
| **Sending domain** | Email currently sends from the agency's domain. Moving it to JOMOO's own domain requires SPF, DKIM and DMARC records — supplied separately. |
| **Ownership transfer** | The table exists; there is no screen to use it. |

---

## Appendix 1 — Status reference

**Registration status**

| Status | Japanese | Meaning |
|---|---|---|
| `PENDING` | 審査中 | Submitted, awaiting staff review |
| `RETURNED` | 要修正 | Sent back to the member for correction |
| `REGISTERED_NO_WARRANTY` | 登録済み | Accepted, outside the warranty window |
| `REGISTERED_WITH_WARRANTY` | 登録済み（保証付き） | Accepted, warranty card issued |

**Serial number status:** Unused · Bound · Revoked · Abnormal (see B5)

**Audit actions:** Import · Create · Update · Delete · Bind · Unbind · Export

## Appendix 2 — Serial number format

`J` followed by digits. The digit count varies by series:

| Series | Digits after J |
|---|---|
| smart-toilet | 19 |
| shower-set | 20 |
| washstand | 19 |
| faucets | 19 |

Stored uppercase with spaces and dashes removed, so the same number typed differently still matches. Full-width digits from a Japanese keyboard are converted automatically.
