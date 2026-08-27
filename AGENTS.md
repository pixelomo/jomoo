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

Dealer branches (`dealer_branches`, `user.member_type`, `user.branch_id`, `product_registrations.branch_id`) are applied with `node scripts/add-dealer-branches.mjs`, then `node scripts/backfill-dealer-branches.mjs --apply` gives accounts created before the feature a member type and a branch.

# Cookie consent

The banner in `src/components/consent/` stores one cookie, `jomoo_consent`, holding
a version and one bit per optional category (`v1.10` — analytics yes, external
media no). `src/lib/cookieConsent.ts` is the shared model, read on the server in
`(site)/layout.tsx` so the bar never flashes, and written in the browser.

**Bump `CONSENT_VERSION` whenever the categories change**, or whenever what sits
behind them does: an older value parses as "no answer yet", so everyone is asked
again rather than being held to a choice about a different set of cookies.

Nothing optional runs without consent. YouTube embeds go through
`ConsentedVideo`, which does not request the frame at all until 外部メディア is
allowed. Google Analytics loads only when `NEXT_PUBLIC_GA_ID` is set **and**
分析Cookie is agreed to — with no id the analytics row is hidden entirely, since
a category that gates nothing should not be offered.

# Deploying

Vercel is connected to this repo, so `git push` to `main` deploys. `vercel --prod` also deploys, but it uploads the working directory rather than a commit — **commit and push before deploying**, or the next person's push will silently revert your work.
