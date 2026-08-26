import { toCsv } from '@/lib/csv'
import { SERIAL_STATUSES } from '@/lib/serialStatus'
import { KNOWN_SERIAL_DIGITS, SERIAL_DIGITS_BY_SERIES } from '@/lib/serialValidation'

/**
 * The blank form the factory fills in before sending a delivery note back.
 *
 * Generated rather than kept as a file in /public so the digit counts, series
 * keys and statuses in the guidance cannot drift away from the ones
 * parseSerialImport actually enforces.
 *
 * Every guidance line starts with "#", which the parser skips, so the template
 * imports cleanly as zero rows if it comes back untouched. Those lines must
 * stay free of commas: a cell containing one would be quoted on the way out,
 * and the "#" would no longer be the first character of the line.
 */
export function serialImportTemplateCsv(): string {
  const digits = KNOWN_SERIAL_DIGITS.join('桁または') + '桁'
  const seriesKeys = Object.keys(SERIAL_DIGITS_BY_SERIES)
  const example = (series: string, n: number) =>
    'J' + '0'.repeat(SERIAL_DIGITS_BY_SERIES[series] - 1) + n

  return toCsv(
    ['serial_number', 'series', 'model_name', 'status', 'note'],
    [
      ['# 1行に1件ずつ製造番号を入力してください'],
      [`# serial_number は必須です。J に続けて ${digits}（製品により異なります）`],
      ['# 桁数の異なる製品の製造番号を1つのファイルにまとめて取り込めます'],
      ['# series は任意です。空欄なら桁数から自動判別し 判別できない場合は空欄のまま取り込みます'],
      [`# series に使えるキー：${seriesKeys.join(' / ')}`],
      [`# status に使える値：${SERIAL_STATUSES.join(' / ')}（空欄は UNUSED）`],
      ['# バッチ名はアップロードしたファイル名がそのまま使われます'],
      ['# 日本語のヘッダー（製造番号 / シリーズ / 型番 / ステータス / 備考）も使えます'],
      ['# 「#」で始まる行とヘッダー行は読み込まれません。下の3行は記入例です'],
      [`#${example('smart-toilet', 1)}`, 'smart-toilet', 'X40', 'UNUSED', '記入例：スマートトイレ'],
      [`#${example('shower-set', 2)}`, 'shower-set', 'S200', 'UNUSED', '記入例：シャワーセット'],
      [`#${example('smart-toilet', 3)}`, '', '', '', '記入例：series を空欄にした場合'],
    ]
  )
}
