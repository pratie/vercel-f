import Link from 'next/link';
import { ListChecks, Search, Users } from 'lucide-react';
import { FOCUS, STICKER } from '@/components/marketing/styles';

export const TOOLS = [
  {
    href: '/tools/subreddit-finder',
    name: 'Subreddit finder',
    blurb: 'Paste your site or describe your product. Get the subreddits where your buyers post, with size and activity.',
    Icon: Users,
  },
  {
    href: '/tools/subreddit-rules-checker',
    name: 'Subreddit rules checker',
    blurb: 'Enter a subreddit. See its rules and how strict it is about self-promotion before you post.',
    Icon: ListChecks,
  },
  {
    href: '/tools/reddit-threads-on-google',
    name: 'Reddit threads on Google',
    blurb: 'Enter a keyword. See which Reddit threads Google ranks for it, and which ones still take replies.',
    Icon: Search,
  },
];

export function ToolCards({ exclude }: { exclude?: string }) {
  const list = TOOLS.filter((t) => t.href !== exclude);
  return (
    <ul className={`grid grid-cols-1 gap-6 ${list.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {list.map(({ href, name, blurb, Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className={`${STICKER} group flex h-full flex-col p-6 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1c1917] motion-reduce:transition-none ${FOCUS}`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#1c1917] bg-[#ff4500] text-[#1c1917]" aria-hidden="true">
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="mt-5 font-play text-[22px] font-bold leading-tight text-[#1c1917]">{name}</span>
            <span className="mt-2 flex-1 text-[15px] leading-relaxed text-[#44403c]">{blurb}</span>
            <span className="mt-5 text-[14px] font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 group-hover:decoration-[#1c1917]">
              Use it free
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MoreTools({ current }: { current: string }) {
  return (
    <section className="py-16 sm:py-20 border-t-2 border-[#1c1917]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-play text-[26px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-[#1c1917] mb-8">More free Reddit tools</h2>
        <ToolCards exclude={current} />
      </div>
    </section>
  );
}

export function toolJsonLd(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `https://www.sneakyguy.com${path}`,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'SneakyGuy', url: 'https://www.sneakyguy.com' },
  };
}
