import DesignerHero from './DesignerHero'
import DesignerIntro from './DesignerIntro'
import DesignerProfile from './DesignerProfile'
import AwardsCarousel from './AwardsCarousel'
import './designer.css'

/**
 * デザイナー. Opens on the sketch hero, states the collaboration in one
 * centred paragraph, then gives each designer a full band of their own —
 * alternating side and tone, each with their name set oversized behind the
 * portrait — and closes on the award logos.
 */
export default function DesignerPage() {
  return (
    <main className="dz">
      <DesignerHero />
      <DesignerIntro />

      <DesignerProfile
        tone="grey"
        side="left"
        watermark="JOHAN DUCK"
        name="ヨハン・デュック"
        role="デザインディレクター（ID & UX）"
        photo="/images/designer/duck.webp"
        body="数々の受賞歴を持つJOMOOのデザインディレクター。20年以上にわたり、サムスンやファーウェイ、シーメンスなど世界的ブランドの製品開発に携わってきました。ユーザー視点を重視したデザインを強みとし、多国籍チームを率いながら革新的な価値創造を推進しています。"
      />

      <DesignerProfile
        tone="dark"
        side="right"
        watermark="MATTHIAS LEHNER"
        name="マティアス・レーナー"
        role="シニアインダストリアルデザイナー"
        photo="/images/designer/matthias.webp"
        body="JOMOOミュンヘンデザインチームの主要メンバー。家具やインテリアデザイン分野で培った豊富な経験を活かし、洗面化粧台やセラミック製品のデザイン開発を担当しています。欧州各国での活動を通して磨いた感性と専門性が、JOMOOの製品を支えています。"
      />

      <DesignerProfile
        tone="white"
        side="left"
        watermark="DANIEL GEMECKE"
        name="ダニエル・ジェメッケ"
        role="インダストリアルデザイナー"
        photo="/images/designer/gemecke.webp"
        body="JOMOOミュンヘンデザインチームの主要メンバーとして、洗面化粧台や水栓金具、セラミック製品のデザインを担当しています。ドイツと中国で培った知見を活かし、機能性とデザイン性を両立した製品開発に取り組み、グローバルな視点で新たな価値を創出しています。"
      />

      <AwardsCarousel />
    </main>
  )
}
