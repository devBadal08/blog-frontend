import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ViewTracker from "./ViewTracker";
import TableOfContents from "./TableOfContents";

interface BlogGalleryImage {
  image: string;
  description: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  content: string;
  featured_image: string | null;
  gallery_images: BlogGalleryImage[];
  category: string | null;
  author: string | null;
  status: "draft" | "published";
  published_at: string | null;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `http://192.168.1.15:8000/api/blogs/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      console.error(`Blog API returned ${res.status} for slug: ${slug}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

async function getRelatedBlogs(currentSlug: string): Promise<BlogPost[]> {
  try {
    const res = await fetch("http://192.168.1.15:8000/api/blogs", {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const response = await res.json();
    const blogs: BlogPost[] = response.data ?? [];

    return blogs
      .filter(
        (blog) => blog.status === "published" && blog.slug !== currentSlug,
      )
      .slice(0, 3);
  } catch (error) {
    console.error("Error fetching related blogs:", error);
    return [];
  }
}

// Helper function to find Previous and Next published posts
async function getAdjacentBlogs(currentSlug: string): Promise<{
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}> {
  try {
    const res = await fetch("http://192.168.1.15:8000/api/blogs", {
      cache: "no-store",
    });

    if (!res.ok) return { previousPost: null, nextPost: null };

    const response = await res.json();
    const blogs: BlogPost[] = (response.data ?? [])
      .filter((blog: BlogPost) => blog.status === "published")
      .sort(
        (a: BlogPost, b: BlogPost) =>
          new Date(a.published_at || 0).getTime() -
          new Date(b.published_at || 0).getTime(),
      );

    const currentIndex = blogs.findIndex((blog) => blog.slug === currentSlug);

    if (currentIndex === -1) return { previousPost: null, nextPost: null };

    return {
      previousPost: currentIndex > 0 ? blogs[currentIndex - 1] : null,
      nextPost:
        currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null,
    };
  } catch (error) {
    console.error("Error fetching adjacent blogs:", error);
    return { previousPost: null, nextPost: null };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Blog Not Found" };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.short_description || undefined,
    keywords: post.meta_keywords
      ? post.meta_keywords.split(",").map((k) => k.trim())
      : undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.short_description || undefined,
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getBlogPost(slug);

  if (!post || post.status !== "published") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Blog could not be loaded
          </h1>

          <p className="mt-2 text-slate-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  const relatedBlogs = await getRelatedBlogs(slug);
  const { previousPost, nextPost } = await getAdjacentBlogs(slug);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const tags = post.meta_keywords
    ? post.meta_keywords.split(",").map((tag) => tag.trim())
    : [];

  return (
    <main className="min-h-screen bg-[#fafafa] text-slate-900 antialiased selection:bg-purple-600 selection:text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors"
          >
            &larr; Back to Articles
          </Link>
          {post.category && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600 uppercase tracking-wider border border-purple-100">
              {post.category}
            </span>
          )}
        </div>
      </nav>

      <ViewTracker slug={slug} />

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT CONTENT COLUMN (8 Cols) */}
          <article className="lg:col-span-8 space-y-8">
            {/* Header / Meta */}
            <header className="space-y-4">
              <div className="flex items-center justify-between">
                {post.category && (
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
                    {post.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                {post.title}
              </h1>

              {post.short_description && (
                <p className="text-lg text-slate-600 leading-relaxed">
                  {post.short_description}
                </p>
              )}

              {/* Author Avatar Row */}
              <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                <div className="h-9 w-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {post.author ? post.author.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <span className="font-bold text-slate-800">
                    By {post.author || "Editorial Team"}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    {formattedDate && <span>{formattedDate}</span>}
                    <span>•</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Hero Banner */}
            {post.featured_image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/60 shadow-sm">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  priority
                  className="object-contain transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
            )}

            {/* Mobile Table of Contents */}
            <div className="lg:hidden">
              <TableOfContents content={post.content} />
            </div>

            {/* Main Content Body */}
            <div
              className="blog-content prose prose-lg max-w-none text-slate-700
              prose-headings:font-bold
              prose-headings:text-slate-900
              prose-headings:tracking-tight
              prose-h2:text-2xl
              prose-h2:mt-10
              prose-h2:mb-4
              prose-h2:scroll-mt-32
              prose-h3:scroll-mt-32
              prose-p:leading-relaxed
              prose-p:mb-6
              prose-a:text-purple-600
              prose-a:font-semibold
              hover:prose-a:underline
              prose-blockquote:not-italic
              prose-blockquote:border-l-4
              prose-blockquote:border-purple-600
              prose-blockquote:bg-purple-50/50
              prose-blockquote:py-4
              prose-blockquote:px-6
              prose-blockquote:rounded-r-2xl
              prose-blockquote:text-slate-800
              prose-blockquote:my-8
              prose-img:rounded-2xl
              prose-img:border
              prose-img:border-slate-200"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 pt-6 border-t border-slate-200 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-2">
                  Tags:
                </span>
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Profile Card */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
                {post.author ? post.author.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  Written by {post.author || "Editorial Team"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Passionate writer and technology enthusiast covering digital
                  trends, modern architecture, and design insights.
                </p>
              </div>
            </div>

            {/* PREVIOUS / NEXT POST NAVIGATION COMPONENT */}
            {(previousPost || nextPost) && (
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200/80">
                {/* Previous Post */}
                {previousPost ? (
                  <Link
                    href={`/blog/${previousPost.slug}`}
                    className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md"
                  >
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100 shrink-0">
                      <Image
                        src={previousPost.featured_image || "/placeholder.jpg"}
                        alt={previousPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
                        &larr; Previous Post
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {previousPost.title}
                      </h4>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {/* Next Post */}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group flex items-center justify-end gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-right shadow-sm transition-all duration-300 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="inline-flex items-center justify-end gap-1 text-[11px] font-bold text-purple-600">
                        Next Post &rarr;
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {nextPost.title}
                      </h4>
                    </div>
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100 shrink-0">
                      <Image
                        src={nextPost.featured_image || "/placeholder.jpg"}
                        alt={nextPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>
            )}

            {/* Gallery Grid Section */}
            {post.gallery_images?.length > 0 && (
              <section className="pt-8 border-t border-slate-200 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.gallery_images.map((gallery, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <Image
                          src={gallery.image}
                          alt={gallery.description || `Gallery ${index + 1}`}
                          fill
                          className="object-contain transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      {gallery.description && (
                        <p className="p-3 text-xs text-slate-600 border-t border-slate-100">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* RIGHT SIDEBAR COLUMN (4 Cols - Sticky) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Widget 1: Table of Contents */}
              <div className="hidden lg:block">
                <TableOfContents content={post.content} />
              </div>

              {/* Widget 2: You Might Also Like */}
              {relatedBlogs.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-3">
                    You Might Also Like
                  </h3>

                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog.id}
                        href={`/blog/${relatedBlog.slug}`}
                        className="flex gap-3 items-center group"
                      >
                        {/* Image */}
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={
                              relatedBlog.featured_image || "/placeholder.jpg"
                            }
                            alt={relatedBlog.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {relatedBlog.title}
                          </h4>

                          <p className="text-[10px] text-slate-400">
                            {relatedBlog.category || "Article"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
