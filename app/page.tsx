import Image from "next/image";
import Link from "next/link";
import BlogCard from "./components/BlogCard";

export interface BlogGalleryImage {
  image: string;
  description: string | null;
}

export interface BlogPost {
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

async function getBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch("http://192.168.1.15:8000/api/blogs", {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("API Error:", res.status);
      return [];
    }

    const response = await res.json();
    const blogs: BlogPost[] = response.data ?? [];

    return blogs
      .filter((post) => post.status === "published")
      .sort(
        (a, b) =>
          new Date(b.published_at || 0).getTime() -
          new Date(a.published_at || 0).getTime(),
      );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function Home() {
  const posts = await getBlogs();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-b from-blue-100/70 via-indigo-50/40 to-transparent blur-3xl" />

      {/* Hero Header */}
      <header className="relative border-b border-slate-200/80 py-12 sm:py-16 px-6 sm:px-12 lg:px-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* left: Hero Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Journal & Insights
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Thoughts that inspire,
              <span className="block text-slate-400">stories that matter.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Explore ideas, insights and perspectives on technology, lifestyle,
              business, digital marketing and more.
            </p>
          </div>

          {/* right: Hero Image */}
          <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[430px]">
            <Image
              src="/blog.png"
              alt="Journal and Insights"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-12 space-y-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-slate-300 bg-white/60">
            <h3 className="text-xl font-semibold text-slate-700">
              No Articles Published
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Check back soon or publish articles directly from your backend
              admin dashboard.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Hero Article */}
            {featuredPost && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Top Story</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60">
                  {/* Featured Image Column */}
                  <div className="relative lg:col-span-7 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={featuredPost.featured_image || "/placeholder.jpg"}
                      alt={featuredPost.title}
                      fill
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      priority
                    />
                    {featuredPost.category && (
                      <span className="absolute top-4 left-4 rounded-full bg-white/90 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-blue-600 backdrop-blur-md shadow-sm">
                        {featuredPost.category}
                      </span>
                    )}
                  </div>

                  {/* Featured Content Column */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>
                          {new Date(
                            featuredPost.published_at || 0,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{featuredPost.views} views</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        <Link href={`/blog/${featuredPost.slug}`}>
                          <span className="absolute inset-0" />
                          {featuredPost.title}
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                        {featuredPost.short_description ||
                          "Read the complete story and deep dive into the implementation details inside."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200/60 text-xs">
                          {featuredPost.author
                            ? featuredPost.author.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {featuredPost.author || "Editorial Team"}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Article &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Grid of Remaining Articles */}
            {remainingPosts.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Recent Publications</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingPosts.map((post) => (
                    <BlogCard key={post.id || post.slug} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
