
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

export function getAllPosts(fields: string[] = []) {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug, fields))
        // sort posts by date in descending order
        .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return posts;
}
