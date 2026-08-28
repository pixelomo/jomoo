import type { Metadata } from 'next'
import Link from 'next/link'
import BlogIndex from '@/components/blog/BlogIndex'
import { BLOG_POSTS_BY_DATE } from '@/lib/blog/posts'
import '@/components/blog/blog.css'

export const metadata: Metadata = {
  title: 'ブログ',
  description:
    'バスルームにまつわる知見とアイデア。JOMOO のスマートバスルーム技術、公共空間のスマート化、製品開発の裏側をお届けします。',
}

export default function BlogPage() {
  return (
    <main className="flex-1 blog">
      <div className="blog__container">
        <nav className="blog__crumbs" aria-label="パンくずリスト">
          <Link href="/">ホーム</Link>
          <span className="blog__crumbs-sep" aria-hidden="true">
            /
          </span>
          <span className="blog__crumbs-current">ブログ</span>
        </nav>

        <BlogIndex posts={BLOG_POSTS_BY_DATE} />
      </div>
    </main>
  )
}
