/* eslint-disable @next/next/no-img-element */
'use client'

import { PROVINCES } from '@/data/provinces'
import './warranty-document.css'

interface Props {
  modelName: string
  serialNumber: string
  /** ISO date; the printed form calls this 引き渡し日. */
  installationDate: string
  customerName: string
  addressState: string
  addressDetail: string
  phoneNumber: string | null
  dealerName: string | null
}

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return y && m && d ? `${y}年${m}月${d}日` : iso
}

/** Registrations store the romanised value ('tokyo'); the document shows 東京都. */
const prefectureLabel = (value: string) =>
  PROVINCES.find((p) => p.value === value)?.label ?? value

export default function WarrantyDocument(props: Props) {
  const address = [prefectureLabel(props.addressState), props.addressDetail]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className="warranty-intro">
        <h1 className="warranty-intro__title">保証書について</h1>
        <p className="warranty-intro__lead">
          JOMOO製品の保証書や無料修理規定（保証規定）について
          <br />
          説明しておりますので、下記内容をご覧ください。
        </p>
      </div>

      <article className="warranty-doc">
        <img className="warranty-doc__logo" src="/logo-black.svg" alt="JOMOO" />

        <h2 className="warranty-doc__title">保証証</h2>

        <p className="warranty-doc__body">
          JOMOOスマートトイレの本体保証期間は、お引き渡し日から2年間です。
          <br />
          保証期間内に製品に不具合が生じた場合は、本保証書をご提示のうえ、販売店またはJOMOOサービスホットラインまで修理をご依頼ください。
        </p>

        <p className="warranty-doc__body warranty-doc__body--strong">
          下記の表の内容をすべてご記入ください。製造番号、設置日、お客様および販売店の情報が記入されていない場合、本保証書は無効となります。
        </p>

        <div className="warranty-doc__serial">
          <img
            className="warranty-doc__diagram"
            src="/images/warranty-serial-diagram.png"
            alt="製造番号ラベルの貼付位置"
          />
          <p className="warranty-doc__note">
            ※製造番号：この番号は、図に示す製品の位置および外装箱に貼付されています。図の例では製造番号は
            J00000000000000000です。製品上の製造番号ラベルを剥がしたり廃棄したりしないでください。剥がされた場合、製品保証を受けられなくなります。
          </p>
        </div>

        <table className="warranty-doc__table">
          <tbody>
            <tr>
              <th scope="col" style={{ width: '22%' }}>型番</th>
              <th scope="col">機能部製造番号</th>
              <th scope="col" style={{ width: '28%' }}>引き渡し日</th>
            </tr>
            <tr>
              <td>{props.modelName}</td>
              <td>{props.serialNumber}</td>
              <td>{formatDate(props.installationDate)}</td>
            </tr>
          </tbody>
        </table>

        <table className="warranty-doc__table">
          <tbody>
            <tr>
              <th scope="rowgroup" rowSpan={3} style={{ width: '22%', background: '#e4e4e7' }}>
                お客様
              </th>
              <th scope="row" style={{ width: '18%' }}>お名前</th>
              <td>{props.customerName}</td>
            </tr>
            <tr>
              <th scope="row">ご住所</th>
              <td>{address}</td>
            </tr>
            <tr>
              <th scope="row">電話番号</th>
              <td>{props.phoneNumber ?? ''}</td>
            </tr>
            <tr>
              <th scope="row" style={{ background: '#e4e4e7' }}>販売店</th>
              <td colSpan={2}>
                {props.dealerName ?? ''}
                <span className="warranty-doc__dealer-phone">電話番号00（0000）0000</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="warranty-doc__hotline">
          <h2>JOMOOサービスホットライン</h2>
          <p>
            修理のご予約、製品に関するお問い合わせ、販売に関するご相談など、JOMOOに関するあらゆるご用件を承ります。
            <br />
            受付時間：8：00 AM -18：00 PM 、365日
            <br />
            ホットライン番号：12*********
          </p>
        </div>
      </article>

      <div className="warranty-actions">
        <button type="button" className="member-btn" onClick={() => window.print()}>
          保証書を印刷
        </button>
      </div>
    </>
  )
}
