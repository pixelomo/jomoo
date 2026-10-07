import type { Metadata } from 'next'
import Link from 'next/link'
import BlogIndex from '@/components/blog/BlogIndex'
import { getPosts } from '@/lib/blog/posts'
import { pageMetadata } from '@/lib/seo'
import '@/components/blog/blog.css'

export const metadata: Metadata = pageMetadata({
  title: 'ブログ',
  description:
    'バスルームにまつわる知見とアイデア。JOMOO のスマートバスルーム技術、公共空間のスマート化、製品開発の裏側をお届けします。',
  path: '/blog',
})

export default async function BlogPage() {
  const posts = await getPosts()

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

        <BlogIndex posts={posts} />
      </div>
    </main>
  )
}
