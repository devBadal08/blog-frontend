"use client";

import { useEffect, useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

/**
 * Convert heading text into a URL-friendly ID.
 */
function createHeadingId(text: string, index: number): string {
  let id = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!id) {
    id = `section-${index + 1}`;
  }

  return id;
}

/**
 * Extract H2 and H3 headings from blog HTML.
 *
 * This does NOT use DOMParser, so it works during
 * both Next.js server rendering and browser rendering.
 */
function extractHeadings(content: string): TocItem[] {
  if (!content) {
    return [];
  }

  const items: TocItem[] = [];

  const headingRegex = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = Number(match[1]);

    // Remove HTML tags from heading text
    const text = match[2]
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      index++;
      continue;
    }

    const id = createHeadingId(text, index);

    items.push({
      id,
      text,
      level,
    });

    index++;
  }

  return items;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  /**
   * This runs on both server and client and produces
   * exactly the same result.
   */
  const items = useMemo(() => {
    return extractHeadings(content);
  }, [content]);

  /**
   * Add matching IDs to the actual H2/H3 elements
   * rendered inside .blog-content.
   *
   * This runs only in the browser.
   */
  useEffect(() => {
    const actualHeadings = document.querySelectorAll(
      ".blog-content h2, .blog-content h3",
    );

    actualHeadings.forEach((heading, index) => {
      if (items[index]) {
        heading.id = items[index].id;
      }
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-3">
          In This Article
        </h3>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Read the complete article below to explore the topic in detail.
        </p>
      </div>
    );
  }

  return (
    <details
      open
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between text-sm font-bold text-slate-900">
        <span>Table of Contents</span>

        <span className="text-slate-400 text-lg">+</span>
      </summary>

      <div className="px-5 pb-5">
        <div className="border-t border-slate-100 pt-4">
          <ul className="space-y-2.5">
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();

                    const target = document.getElementById(item.id);

                    if (!target) {
                      return;
                    }

                    const navbar = document.querySelector("nav");

                    const navbarHeight = navbar
                      ? navbar.getBoundingClientRect().height
                      : 0;

                    const extraSpacing = 20;

                    const targetPosition =
                      target.getBoundingClientRect().top +
                      window.scrollY -
                      navbarHeight -
                      extraSpacing;

                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });

                    window.history.replaceState(null, "", `#${item.id}`);
                  }}
                  className={`
                    block text-xs leading-relaxed transition-colors
                    ${
                      item.level === 3
                        ? "pl-4 text-slate-500"
                        : "font-medium text-slate-600"
                    }
                    hover:text-purple-600
                  `}
                >
                  <span className="mr-2 text-slate-400">{index + 1}.</span>

                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
