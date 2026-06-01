/**
 * Patches x40-b and x40-c Sanity documents:
 * replaces all `en` fields with Japanese translations.
 * Run: node scripts/patch-x40-ja.mjs
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '9f4e5pxd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Japanese captions for feature images (keyed by Chinese caption so we can match)
const JA_CAPTION_BY_ZH = {
  '38dB超净音':             '38dB 超静音フラッシュ',
  '功能展示':               '機能紹介',
  'UV喷杆除菌':             'UV除菌ロッド',
  '停电冲厕':               '停電時フラッシュ',
  '光感夜灯':               'モーションセンサー夜間ライト',
  '助便强洗':               '整腸洗浄',
  '可拆卸抗菌喷嘴':         '取り外し可能な抗菌ノズル',
  '喷嘴自动自洁':           '自動ノズル自浄',
  '四季温感':               '四季温感',
  '轻柔妇洗':               'やさしいビデ洗浄',
  '宽幅强洗':               'ワイド臀部洗浄',
  '座圈抗菌 · 喷杆抗菌':   '抗菌便座リング・抗菌ノズルロッド',
  '座圈加热（5档）':        '便座加熱（5段階）',
  '旋转魔力泡（混气技术）': '気泡ミックス洗浄',
  '超净音旋风冲刷':         '超静音旋風フラッシュ',
  '无棱内壁':               'リムレスボウル',
  '离座自动冲（大/小）':    '離席自動フラッシュ（大/小）',
  '移动按摩洗':             '振動マッサージ洗浄',
  '缓降盖板':               'ソフトクローズふた',
  '脚感冲水':               'フットセンサーフラッシュ',
  '脚感翻盖翻圈':           'フットセンサーふた・便座コントロール',
  '洁净臀洗':               '臀部洗浄',
  '自动开盖':               '自動ふた開閉',
  '喷嘴顶针自动除垢':       '自動ピン除垢',
  '釉面抗菌':               '抗菌釉薬',
  '铂金除臭':               '白金脱臭',
}

const PATCHES = {
  'product-x40-b': {
    'name.en': 'X40-B スマートトイレ',
    'tagline.en': 'セルフクリーニングロボットアーム・UV除菌・四季温感・フットセンサーふた',
    features: [
      {
        'title.en': 'セルフクリーニングロボットアーム',
        'description.en': '内蔵ロボットアームがノズル周辺を自動清掃—手を触れずに衛生を保ちます。',
      },
      {
        'title.en': 'UV除菌ロッド',
        'description.en': '紫外線ランプがノズルロッドを除菌し、細菌やウイルスを効果的に排除します。',
      },
      {
        'title.en': '白金脱臭',
        'description.en': '白金触媒脱臭剤が使用中の空気を継続的に浄化します。',
      },
      {
        'title.en': 'フットセンサーふた・便座コントロール',
        'description.en': 'センサー部分に足で触れるだけでふたや便座を開閉—手を使わずに操作できます。',
      },
      {
        'title.en': '四季温感',
        'description.en': '周囲の気温に応じて便座温度を自動調整し、一年中快適にお使いいただけます。',
      },
      {
        'title.en': '気泡ミックス洗浄',
        'description.en': '水と空気が混合して細かい泡を形成し、やさしくしっかりと洗浄します。',
      },
    ],
    specs: [
      { 'label.en': '設置距離（標準）' },
      { 'label.en': '設置距離（延長）' },
      { 'label.en': '停電時フラッシュ' },
      { 'label.en': '防水等級' },
    ],
  },
  'product-x40-c': {
    'name.en': 'X40-C スマートトイレ',
    'tagline.en': '白金脱臭・気泡ミックス洗浄・抗菌釉薬・超静音フラッシュ',
    features: [
      {
        'title.en': '白金脱臭',
        'description.en': '白金触媒脱臭剤が使用中の空気を継続的に浄化します。',
      },
      {
        'title.en': '気泡ミックス洗浄',
        'description.en': '水と空気が混合して細かい泡を形成し、やさしくしっかりと洗浄します。',
      },
      {
        'title.en': '抗菌釉薬',
        'description.en': '陶磁器釉薬に抗菌成分を配合し、細菌の繁殖を抑えてお手入れを簡単にします。',
      },
      {
        'title.en': '超静音旋風フラッシュ',
        'description.en': '38dBの超低騒音フラッシュ—いつでも周りへの配慮を忘れません。',
      },
      {
        'title.en': '離席自動フラッシュ',
        'description.en': '離席時に大・小フラッシュを自動選択—楽に節水できます。',
      },
      {
        'title.en': 'フットセンサーフラッシュ',
        'description.en': '本体底部のセンサーに足で触れるだけでフラッシュ—完全ハンズフリーです。',
      },
    ],
    specs: [
      { 'label.en': '設置距離（標準）' },
      { 'label.en': '停電時フラッシュ' },
      { 'label.en': '防水等級' },
    ],
  },
}

async function patchDoc(docId, patch, currentDoc) {
  const tx = client.transaction()

  // Top-level string fields (name.en, tagline.en)
  const topPatch = {}
  for (const [path, val] of Object.entries(patch)) {
    if (path === 'features' || path === 'specs') continue
    topPatch[path] = val
  }
  if (Object.keys(topPatch).length) {
    tx.patch(docId, p => p.set(topPatch))
  }

  // features array — patch by position
  if (patch.features && currentDoc.features) {
    for (let i = 0; i < patch.features.length; i++) {
      const fp = patch.features[i]
      const key = currentDoc.features[i]?._key
      if (!key) continue
      for (const [subPath, val] of Object.entries(fp)) {
        tx.patch(docId, p => p.set({ [`features[_key=="${key}"].${subPath}`]: val }))
      }
    }
  }

  // specs array — patch by position
  if (patch.specs && currentDoc.specs) {
    for (let i = 0; i < patch.specs.length; i++) {
      const sp = patch.specs[i]
      const key = currentDoc.specs[i]?._key
      if (!key) continue
      for (const [subPath, val] of Object.entries(sp)) {
        tx.patch(docId, p => p.set({ [`specs[_key=="${key}"].${subPath}`]: val }))
      }
    }
  }

  // featureImages captions — match by zhCN caption
  if (currentDoc.featureImages) {
    for (const fi of currentDoc.featureImages) {
      const zhCaption = fi.caption?.zhCN
      const jaCaption = zhCaption ? JA_CAPTION_BY_ZH[zhCaption] : null
      if (fi._key && jaCaption) {
        tx.patch(docId, p => p.set({ [`featureImages[_key=="${fi._key}"].caption.en`]: jaCaption }))
      }
    }
  }

  await tx.commit()
  console.log(`✓ Patched ${docId}`)
}

async function run() {
  for (const [docId, patch] of Object.entries(PATCHES)) {
    console.log(`\nFetching ${docId}…`)
    const doc = await client.getDocument(docId)
    if (!doc) { console.warn(`  ! ${docId} not found — skipping`); continue }
    await patchDoc(docId, patch, doc)
  }
  console.log('\nDone.')
}

run().catch(err => { console.error(err); process.exit(1) })
