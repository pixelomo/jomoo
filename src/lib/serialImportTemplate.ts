import { toCsv } from '@/lib/csv'
import { SERIAL_STATUSES } from '@/lib/serialStatus'
import { SERIAL_SERIES } from '@/lib/serialValidation'

/**
 * The blank form the factory fills in before sending a delivery note back.
 *
 * Generated rather than kept as a file in /public so the series keys and
 * statuses in the guidance cannot drift away from the ones the parser and the
 * library actually use.
 *
 * Every guidance line starts with "#", which the parser skips, so the template
 * imports cleanly as zero rows if it comes back untouched. Those lines must
 * stay free of commas: a cell containing one would be quoted on the way out,
 * and the "#" would no longer be the first character of the line.
 */
export function serialImportTemplateCsv(): string {
  return toCsv(
    ['serial_number', 'series', 'model_name', 'status', 'note'],
    [
      ['# 1行に1件ずつ製造番号を入力してください'],
      ['# serial_number は必須です。英数字であれば桁数や先頭の文字は問いません'],
      ['# 製品ごとに桁数が異なっていても 1つのファイルにまとめて取り込めます'],
      ['# ここに取り込まれた番号が 製品登録時に照合される正規の番号になります'],
      [`# series は任意です。使えるキー：${SERIAL_SERIES.join(' / ')}`],
      [`# status に使える値：${SERIAL_STATUSES.join(' / ')}（空欄は UNUSED）`],
      ['# バッチ名はアップロードしたファイル名がそのまま使われます'],
      ['# 日本語のヘッダー（製造番号 / シリーズ / 型番 / ステータス / 備考）も使えます'],
      ['# 「#」で始まる行とヘッダー行は読み込まれません。下の3行は記入例です'],
      ['#J2339391200000HE1110', 'smart-toilet', 'JP6350', 'UNUSED', '記入例：20桁'],
      ['#J1070043600001EMP116', 'faucets', '760001-TH-1CAB', 'UNUSED', '記入例：英字を含む番号'],
      ['#J223764110000014F113', '', '', '', '記入例：series を空欄にした場合'],
    ]
  )
}
