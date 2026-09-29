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
      ['# serial_number は必須です。X40 は J＋19桁（計20文字）・その他の製品は J＋20桁（計21文字）です'],
      ['# 製品ごとに桁数が異なっていても 1つのファイルにまとめて取り込めます'],
      ['# ここに取り込まれた番号が 製品登録時に照合される正規の番号になります'],
      [`# series は任意です。使えるキー：${SERIAL_SERIES.join(' / ')}`],
      [`# status に使える値：${SERIAL_STATUSES.join(' / ')}（空欄は UNUSED）`],
      ['# バッチ名はアップロードしたファイル名がそのまま使われます'],
      ['# 日本語のヘッダー（製造番号 / シリーズ / 型番 / ステータス / 備考）も使えます'],
      ['# 「#」で始まる行とヘッダー行は読み込まれません。下の3行は記入例です'],
      ['#J2339391200000HE1110', 'smart-toilet', 'X40', 'UNUSED', '記入例：X40（J＋19桁）'],
      ['#J12345678901234567890', 'faucets', '760001-TH-1CAB', 'UNUSED', '記入例：X40以外（J＋20桁）'],
      ['#J223764110000014F113', '', '', '', '記入例：series を空欄にした場合'],
    ]
  )
}

/**
 * A filled-in list to test an import with, covering several products at once.
 *
 * Every serial in it contains the word SAMPLE, and the whole file imports under
 * one batch (taken from the file name), so the test data can be found two ways
 * and removed in one pass — search SAMPLE, or filter by the batch, select all,
 * delete. Nothing here can collide with a real serial.
 *
 * The point it exists to prove is that one file can hold every product in a
 * delivery: four series, both real lengths — the X40 is J + 19 (20 characters),
 * every other product J + 20 (21) — some rows naming their series and some not.
 * Those are the only two lengths; do not add others to "show there is no
 * limit", which is how made-up 19- and 22-character rows got in here before.
 */
export function serialImportSampleCsv(): string {
  /** An exact length: 20 for the X40, 21 for everything else. */
  const serial = (index: number, length: number) => {
    const tail = String(index).padStart(3, '0')
    return 'J' + '0'.repeat(length - 1 - 'SAMPLE'.length - tail.length) + 'SAMPLE' + tail
  }

  const rows: (string | undefined)[][] = [
    ['# テスト用のサンプルデータです。取り込み動作の確認にお使いください'],
    ['# すべての番号に SAMPLE が含まれます。検索窓に SAMPLE と入力すれば一覧できます'],
    ['# 取り込み後はバッチ名（このファイル名）で絞り込み まとめて削除できます'],
    ['# X40 は J＋19桁（計20文字）・その他の製品は J＋20桁（計21文字）。4つのシリーズを1つのファイルに含めています'],
    [serial(1, 20), 'smart-toilet', 'X40', 'UNUSED', 'X40：J＋19桁'],
    [serial(2, 20), 'smart-toilet', 'X40', 'UNUSED', 'X40：J＋19桁'],
    [serial(3, 20), 'smart-toilet', 'X40', 'UNUSED', 'X40：J＋19桁'],
    [serial(4, 21), 'smart-toilet', 'JP6350', 'UNUSED', 'X40以外のトイレ：J＋20桁'],
    [serial(5, 21), 'smart-toilet', 'JP6350', 'UNUSED', 'X40以外のトイレ：J＋20桁'],
    [serial(6, 21), 'faucets', '760001-TH-1CAB', 'UNUSED', '水栓：J＋20桁'],
    [serial(7, 21), 'faucets', '760001-TH-1CAB', 'UNUSED', '水栓：J＋20桁'],
    [serial(8, 21), 'washstand', 'A207-015B-1', 'UNUSED', '洗面台：J＋20桁'],
    [serial(9, 21), 'shower-set', '', 'UNUSED', 'シャワー：J＋20桁 — 型番の記入は任意です'],
    [serial(10, 21), '', '', '', 'シリーズ・ステータスを空欄にした行'],
    [serial(11, 20), 'smart-toilet', 'X40', 'REVOKED', '登録を拒否される番号の例'],
    [serial(12, 21), 'smart-toilet', 'JP6350', 'ABNORMAL', '要確認として扱われる番号の例'],
  ]

  return toCsv(['serial_number', 'series', 'model_name', 'status', 'note'], rows)
}
