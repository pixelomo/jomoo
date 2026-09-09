import type { Metadata } from 'next'
import DesignerPage from '@/components/designer/DesignerPage'

export const metadata: Metadata = {
  title: 'デザイナー',
  description:
    'JOMOOは世界を代表するデザインパートナーとの協業により、新たな価値を創造しています。ヨハン・デュック、マティアス・レーナー、ダニエル・ジェメッケ — 国際的なデザイン賞に評価されたJOMOOのデザインチームを紹介します。',
}

export default function Designer() {
  return <DesignerPage />
}
