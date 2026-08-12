import Image from "next/image";
import Link from "next/link";

interface BlogProps {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  featured_image: string | null;
  category: string | null;
  author: string | null;
  published_at: string | null;
  views: number;
}

export default function BlogCard({ post }: { post: BlogProps }) {
  const formattedDate = new Date(post.published_at || 0).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60">
      <div>
        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <Image
            src={post.featured_image || "/placeholder.jpg"}
            alt={post.title}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {post.category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 border border-slate-200/80 px-3 py-1 text-[11px] font-semibold text-slate-800 backdrop-blur-md shadow-sm">
              {post.category}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{post.views} views</span>
          </div>

          <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            <Link href={`/blog/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
            {post.short_description || "Click to read full article."}
          </p>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
            {post.author ? post.author.charAt(0).toUpperCase() : "A"}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {post.author || "Editorial Team"}
          </span>
        </div>

        <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Read &rarr;
        </span>
      </div>
    </article>
  );
}
