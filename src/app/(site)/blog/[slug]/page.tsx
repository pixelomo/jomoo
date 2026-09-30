import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { BlogGrid } from '@/components/blog/BlogIndex'
import {
  formatBlogDate,
  getNeighbours,
  getPost,
  getPosts,
  getRelated,
  type BlogImage,
} from '@/lib/blog/posts'
import { imgUrl } from '@/lib/sanity'
import '@/components/blog/blog.css'

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
      type: 'article',
      publishedTime: post.date,
    },
  }
}

function Arrow({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg
      className={`blog-post__arrow blog-post__arrow--${direction}`}
      viewBox="0 0 16 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d={direction === 'prev' ? 'M5 1L1 5l4 4' : 'M11 1l4 4-4 4'} strokeLinecap="round" />
      <path d="M1 5h14" strokeLinecap="round" />
    </svg>
  )
}

function Figure({ value }: { value: BlogImage }) {
  if (!value.asset) return null
  // Landscape pictures run full-bleed in a fixed band, as they do on the
  // global site. A picture that is square or taller loses most of itself to
  // that crop, so it keeps its own proportions and stands taller instead.
  const portrait = value.height >= value.width
  return (
    <figure className={`blog-post__figure${portrait ? ' blog-post__figure--portrait' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgUrl(value, 1800)}
        width={value.width}
        height={value.height}
        alt={value.alt ?? ''}
        loading="lazy"
      />
      {value.caption && <figcaption className="blog-post__caption">{value.caption}</figcaption>}
    </figure>
  )
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="blog-post__text">{children}</p>,
    h2: ({ children }) => <h2 className="blog-post__h2">{children}</h2>,
    blockquote: ({ children }) => <blockquote className="blog-post__quote">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="blog-post__list">{children}</ul>,
  },
  types: {
    image: Figure,
  },
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [{ prev, next }, related] = await Promise.all([getNeighbours(slug), getRelated(slug)])

  return (
    <main className="flex-1 blog-post">
      <div className="blog-post__head">
        <nav className="blog__crumbs" aria-label="パンくずリスト">
          <Link href="/">ホーム</Link>
          <span className="blog__crumbs-sep" aria-hidden="true">
            /
          </span>
          <Link href="/blog">ブログ</Link>
          <span className="blog__crumbs-sep" aria-hidden="true">
            /
          </span>
          <span className="blog__crumbs-current">{post.title}</span>
        </nav>

        <h1 className="blog-post__title">{post.title}</h1>

        <div className="blog-post__meta">
          <div className="blog-post__byline">
            {/* Author hidden for now — the bylines carried over from the global
                site's CMS are inconsistent. post.author still holds the value. */}
            <span>{formatBlogDate(post.date)}</span>
          </div>
        </div>

        <div className="blog-post__rule" />
      </div>

      <article className="blog-post__body">
        <p className="blog-post__lede">{post.excerpt}</p>
        <PortableText
          value={post.body as Parameters<typeof PortableText>[0]['value']}
          components={components}
        />
      </article>

      <div className="blog-post__foot">
        <div className="blog-post__foot-prev">
          {prev ? (
            <Link href={`/blog/${prev.slug}`}>
              <Arrow direction="prev" />
              <span>
                <span className="blog-post__foot-label">前の記事</span>
                <br />
                {prev.title}
              </span>
            </Link>
          ) : (
            <span aria-disabled="true">
              <span className="blog-post__foot-label">前の記事</span>
              <br />
              なし
            </span>
          )}
        </div>

        <Link href="/blog" className="blog-post__foot-return">
          一覧に戻る
        </Link>

        <div className="blog-post__foot-next">
          {next ? (
            <Link href={`/blog/${next.slug}`}>
              <span>
                <span className="blog-post__foot-label">次の記事</span>
                <br />
                {next.title}
              </span>
              <Arrow direction="next" />
            </Link>
          ) : (
            <span aria-disabled="true">
              <span className="blog-post__foot-label">次の記事</span>
              <br />
              なし
            </span>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="blog-post__related">
          <div className="blog-post__related-inner">
            <h2 className="blog-post__related-title">関連記事</h2>
            <BlogGrid posts={related} />
          </div>
        </section>
      )}
    </main>
  )
}
