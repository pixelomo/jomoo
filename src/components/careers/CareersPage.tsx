import CareersHero from './CareersHero'
import CareersIntro from './CareersIntro'
import CareersBand from './CareersBand'
import './careers.css'

/**
 * 採用情報. Opens on the composed hero, states the invitation in three centred
 * lines, then gives each of the four themes a band of its own — the photograph
 * alternating edge, the wash under the first and third.
 */
export default function CareersPage() {
  return (
    <main className="cr">
      <CareersHero />
      <CareersIntro />

      <CareersBand
        side="right"
        wash
        title="当社の採用理念"
        body="私たちは、一人ひとりの個性と可能性を大切にしています。多様な価値観を尊重しながら、互いに認め合い成長できる環境づくりを推進。スキルだけでなく、挑戦する意欲と共感を持つ仲間を求めています。"
        photo="/images/career/philosophy.webp"
        alt="会議室でノートパソコンを囲んで話し合う四人の社員"
      />

      <CareersBand
        side="left"
        title="働きやすい職場環境"
        body="JOMOOは、チームワークとコミュニケーションを大切にする職場です。多様な人材がそれぞれの力を発揮できる環境を整え、誰もが安心して挑戦し、活躍できる企業文化を育んでいます。"
        photo="/images/career/workplace.webp"
        alt="ショールームのラウンジで打ち合わせをする五人の社員"
      />

      <CareersBand
        side="right"
        wash
        title="成長を支える制度"
        body="社員一人ひとりの成長を後押しするため、研修やキャリア開発の機会を充実させています。新たなスキルの習得やキャリアアップを目指しながら、自分らしい成長を実現できる環境です。"
        photo="/images/career/growth.webp"
        alt="ノートを開いて研修に取り組む二人の社員"
      />

      <CareersBand
        side="left"
        title="社員の健康と福利厚生"
        body="社員の心身の健康と働きやすさを大切にしています。充実した福利厚生や働きやすい制度を整え、仕事とプライベートの両立を支援。安心して長く活躍できる環境づくりに取り組んでいます。"
        photo="/images/career/wellbeing.webp"
        alt="オフィスの前で鞄を持って立つ社員"
      />
    </main>
  )
}
