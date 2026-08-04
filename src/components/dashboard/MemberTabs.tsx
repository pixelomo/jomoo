/* eslint-disable @next/next/no-img-element */
'use client'

import { useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import './member-portal.css'

export type MemberTabId = 'products' | 'contract' | 'profile'

const TABS: { id: MemberTabId; label: string }[] = [
  { id: 'products', label: 'ご登録製品' },
  { id: 'contract', label: 'ご契約情報' },
  { id: 'profile', label: 'お客様情報' },
]

interface Props {
  /** Rendered inside the ご登録製品 panel, above the 保証延長 card. */
  products?: ReactNode
  contract?: ReactNode
  profile?: ReactNode
  /** True when the member has nothing registered yet. */
  isEmpty: boolean
}

/**
 * Wears the product page's tab bar, but these switch panels rather than jump to
 * anchors — so they are buttons in a tablist, not links, and the inactive
 * panels leave the document entirely.
 */
export default function MemberTabs({ products, contract, profile, isEmpty }: Props) {
  const [active, setActive] = useState<MemberTabId>('products')
  const base = useId()

  const panelFor = (id: MemberTabId) =>
    id === 'products' ? products : id === 'contract' ? contract : profile

  return (
    <>
      <div className="member-tabs" role="tablist" aria-label="マイページ">
        {TABS.map((tab) => (
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

      {TABS.map((tab) => (
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
              <section className="member-card">
                {isEmpty ? (
                  <h2 className="member-card__title">製品がまだ登録されていません</h2>
                ) : (
                  <div className="member-panel__legacy">{products}</div>
                )}
                <div className="member-card__actions">
                  <a className="member-btn" href="#">
                    その他の製品をWEB修理依頼する
                  </a>
                </div>
              </section>

              <section className="member-card">
                <div className="member-card__row">
                  <div className="member-card__copy">
                    <h2 className="member-card__title member-card__title--sub">保証延長</h2>
                    <p className="member-card__body">
                      当社の定める対象製品を登録すると保証期間が3年に延長されます。引渡／購入日から6か月以内であれば、さらに安心が長く続く長期保証サービス（有料）へのお申し込みもできます。
                    </p>
                  </div>
                  <img
                    className="member-card__art"
                    src="/images/register.png"
                    alt=""
                    width={215}
                    height={215}
                  />
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
