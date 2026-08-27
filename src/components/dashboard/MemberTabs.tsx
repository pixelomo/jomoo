/* eslint-disable @next/next/no-img-element */
'use client'

import { useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import './member-portal.css'

export type MemberTabId = 'products' | 'branch' | 'contract' | 'profile'

const TAB_LABELS: Record<MemberTabId, string> = {
  products: 'ご登録製品',
  branch: '支店の登録製品',
  contract: 'ご契約情報',
  profile: 'お客様情報',
}

interface Props {
  /** Rendered inside the ご登録製品 panel, above the 保証延長 card. */
  products?: ReactNode
  /** 法人 members only — every registration filed against their branch. The
   *  tab is absent entirely for everyone else. */
  branch?: ReactNode
  contract?: ReactNode
  profile?: ReactNode
  /** Drives both the heading's count and the empty state. */
  productCount: number
}

/**
 * Wears the product page's tab bar, but these switch panels rather than jump to
 * anchors — so they are buttons in a tablist, not links, and the inactive
 * panels leave the document entirely.
 */
export default function MemberTabs({ products, branch, contract, profile, productCount }: Props) {
  const [active, setActive] = useState<MemberTabId>('products')
  const base = useId()
  const isEmpty = productCount === 0

  const tabs = (['products', 'branch', 'contract', 'profile'] as MemberTabId[])
    .filter((id) => id !== 'branch' || branch)
    .map((id) => ({ id, label: TAB_LABELS[id] }))

  const panelFor = (id: MemberTabId) =>
    id === 'branch' ? branch : id === 'contract' ? contract : profile

  return (
    <>
      <div className="member-tabs" role="tablist" aria-label="マイページ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`${base}-panel-${tab.id}`}
            className="member-tabs__tab"
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={active !== tab.id}
          className="member-panel"
        >
          {tab.id === 'products' ? (
            <>
              <section className={`member-card${isEmpty ? '' : ' member-card--list'}`}>
                {/* The heading stays whether or not anything is registered —
                    a list that arrives with no title reads as a stray block. */}
                <h2 className="member-card__title">
                  {isEmpty ? '製品がまだ登録されていません' : `ご登録製品（${productCount}件）`}
                </h2>
                {!isEmpty && <div className="member-products">{products}</div>}
                <div className="member-card__actions">
                  <Link className="member-btn" href="/contact-us?category=fault">
                    その他の製品をWEB修理依頼する
                  </Link>
                </div>
              </section>

              <section className="member-card">
                <div className="member-card__row">
                  <img
                    className="member-card__art"
                    src="/images/register.png"
                    alt=""
                    width={215}
                    height={215}
                  />
                  <div className="member-card__copy">
                    <h2 className="member-card__title member-card__title--sub">保証延長</h2>
                    <p className="member-card__body">
                      当社の定める対象製品を登録すると保証期間が3年に延長されます。引渡／購入日から6か月以内であれば、さらに安心が長く続く長期保証サービス（有料）へのお申し込みもできます。
                    </p>
                  </div>
                </div>
                <div className="member-card__actions">
                  <Link className="member-btn" href="/register">
                    製品を登録
                  </Link>
                </div>
              </section>
            </>
          ) : (
            panelFor(tab.id)
          )}
        </div>
      ))}
    </>
  )
}
