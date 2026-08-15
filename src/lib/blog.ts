
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'app/blog/posts');

export type Post = {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    content: string;
    readingTime?: string;
    featuredImage?: string;
    tags?: string[];
};

export function getPostSlugs() {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }
    return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []) {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Post not found: ${fullPath}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const items: any = {};

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
        if (field === 'slug') {
            items[field] = realSlug;
        }
        if (field === 'content') {
            items[field] = content;
        }

        if (typeof data[field] !== 'undefined') {
            items[field] = data[field];
        }
    });

    return items as Post;
}

export type Heading = {
    id: string;
    text: string;
    level: 2 | 3;
};

/** Stable id for a heading. The MDX renderer and the table of contents both
 * call this, so an anchor can never drift from the heading it points at. */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[`*_~]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Pull the h2/h3 outline out of raw markdown for the sidebar contents.
 * Fenced code blocks are stripped first so a commented "## " inside a snippet
 * doesn't show up as a section. */
export function extractHeadings(content: string): Heading[] {
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');
    const headings: Heading[] = [];
    const seen = new Map<string, number>();

    // exec loop rather than matchAll: this project compiles to an ES5 target,
    // where iterating a RegExp match iterator is a type error.
    const pattern = /^(#{2,3})\s+(.+?)\s*$/gm;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(withoutCode)) !== null) {
        const level = match[1].length as 2 | 3;
        const text = match[2].replace(/[*_`]/g, '').trim();
        const base = slugify(text);
        // Two sections can legitimately share a title; keep every anchor unique.
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        headings.push({ id: count > 0 ? `${base}-${count + 1}` : base, text, level });
    }

    return headings;
}

export function getAllPosts(fields: string[] = []) {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug, fields))
        // sort posts by date in descending order
        .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return posts;
}
