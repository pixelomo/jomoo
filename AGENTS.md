<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database

The schema lives in `src/lib/db/schema.ts` and is applied with `npm run db:push` (drizzle-kit push — there is no migrations folder). `DATABASE_URL` is not loaded automatically for a bare `drizzle-kit` run, so pass it in:

```sh
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-) npx drizzle-kit push
```

The tables `serial_numbers`, `serial_audit_logs` and `email_templates` exist on the Railway database that `.env.local` points at. **If you are on a machine whose `DATABASE_URL` points somewhere else, run `db:push` before using the serial library or the email-template editor** — those pages query tables that will not be there.

`push` compares the whole schema and can propose destructive statements, so check what it plans before applying it to a database holding real data.

# Deploying

Vercel is connected to this repo, so `git push` to `main` deploys. `vercel --prod` also deploys, but it uploads the working directory rather than a commit — **commit and push before deploying**, or the next person's push will silently revert your work.
