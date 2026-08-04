/**
 * CSV for spreadsheet download.
 *
 * Excel on Japanese Windows opens a UTF-8 file as Shift-JIS unless it finds a
 * byte order mark, which turns every Japanese name into mojibake — so the BOM
 * is not optional here.
 */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = value instanceof Date ? value.toISOString() : String(value)
  // A leading =, +, - or @ makes a spreadsheet treat the cell as a formula.
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))]
  return '﻿' + lines.join('\r\n') + '\r\n'
}

export function csvResponse(filename: string, body: string): Response {
  const stamped = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${stamped}"`,
      'Cache-Control': 'no-store',
    },
  })
}
