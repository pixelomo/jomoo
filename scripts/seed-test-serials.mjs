/**
 * Test serial numbers, until the factory's real list arrives (X40 stock is not
 * finished until November 2026).
 *
 * X40-B and X40-C get J + 19 (20 characters), the X40 shape; every other
 * product line gets J + 20 (21). All of them are imported under one batch label
 * so they can be found and removed together, and a CSV of them is written to
 * test-serials.csv for whoever is testing.
 *
 * Usage:
 *   node scripts/seed-test-serials.mjs            # add them (re-runnable)
 *   node scripts/seed-test-serials.mjs --remove   # delete them, and any test
 *                                                 # registrations that used one
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'

const url = readFileSync(new URL('../.env.local', import.meta.url), 'utf8').match(/DATABASE_URL=(.*)/)[1]
const sql = postgres(url)

export const TEST_BATCH = 'TEST-2026-10'
const OPERATOR = 'system'

/** Deterministic, so a re-run produces the same numbers and adds nothing. */
const GROUPS = [
  { series: 'smart-toilet', model: 'X40-B スマートトイレ', prefix: 'J261001X40B', length: 20, count: 20 },
  { series: 'smart-toilet', model: 'X40-C スマートトイレ', prefix: 'J261001X40C', length: 20, count: 20 },
  { series: 'smart-toilet', model: null, prefix: 'J261001ST', length: 21, count: 10 },
  { series: 'shower-set', model: null, prefix: 'J261001SH', length: 21, count: 10 },
  { series: 'washstand', model: null, prefix: 'J261001WS', length: 21, count: 10 },
  { series: 'faucets', model: null, prefix: 'J261001FC', length: 21, count: 10 },
]

const serials = GROUPS.flatMap((g) =>
  Array.from({ length: g.count }, (_, i) => ({
    serial: g.prefix + String(i + 1).padStart(g.length - g.prefix.length, '0'),
    ...g,
  }))
)

if (process.argv.includes('--remove')) {
  await sql.begin(async (tx) => {
    const regs = await tx`
      delete from product_registrations
      where serial_number in ${tx(serials.map((s) => s.serial))}
      returning id`
    const gone = await tx`delete from serial_numbers where batch = ${TEST_BATCH} returning serial_number`
    console.log(`Removed ${gone.length} test serials and ${regs.length} registration(s) that used one.`)
  })
} else {
  const rows = serials.map((s) => ({
    id: randomUUID(),
    serial_number: s.serial,
    series: s.series,
    model_name: s.model,
    batch: TEST_BATCH,
    status: 'UNUSED',
    note: 'テスト用 — 正式リスト到着時に削除',
    created_by: OPERATOR,
  }))
  const added = await sql`
    insert into serial_numbers ${sql(rows)}
    on conflict (serial_number) do nothing
    returning id, serial_number`
  if (added.length) {
    await sql`insert into serial_audit_logs ${sql(added.map((a) => ({
      id: randomUUID(),
      action: 'IMPORT',
      operator: OPERATOR,
      serial_id: a.id,
      serial_number: a.serial_number,
      details: `Test serial (${TEST_BATCH}) — remove when the real list arrives`,
    })))}`
  }
  console.log(`Added ${added.length} of ${rows.length} test serials (the rest were already there).`)

  const csv = ['製造番号,桁数,シリーズ,型番', ...serials.map((s) => `${s.serial},${s.serial.length},${s.series},${s.model ?? ''}`)].join('\n')
  writeFileSync(new URL('../test-serials.csv', import.meta.url), '﻿' + csv + '\n')
  console.log('Wrote test-serials.csv')
}

await sql.end()
