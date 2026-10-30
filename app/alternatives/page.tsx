import Link from 'next/link';
import { PageIntro } from '@/components/marketing/Blocks';
import { FOCUS, STICKER } from '@/components/marketing/styles';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { ALTERNATIVES, LAST_CHECKED } from '@/lib/alternatives';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'SneakyGuy Alternatives and Comparisons: Bazzly, GummySearch, F5Bot, Syften | SneakyGuy',
  description:
    'How SneakyGuy compares with Bazzly, GummySearch, F5Bot and Syften for finding leads on Reddit: price, who posts, scoring, reply drafts and trials. Facts only.',
  path: '/alternatives',
});

export default function AlternativesIndex() {
  return (
    <>
      <PageIntro
        title="SneakyGuy compared"
        intro={
          <>
            How SneakyGuy stacks up against other Reddit tools, with the facts side by side and a fair word on who
            should pick which. Last checked {LAST_CHECKED}.
          </>
        }
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALTERNATIVES.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/alternatives/${a.slug}`}
                className={`${STICKER} group flex h-full flex-col p-6 sm:p-7 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1c1917] motion-reduce:transition-none ${FOCUS}`}
              >
                <span className="font-play text-[24px] sm:text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#1c1917]">
                  SneakyGuy vs {a.name}
                </span>
                <span className="mt-2 flex-1 text-[15px] leading-relaxed text-[#44403c]">{a.card}</span>
                <span className="mt-5 text-[14px] font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 group-hover:decoration-[#1c1917]">
                  Read the comparison
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <UrlCheckCta source="alternatives_index" title="See it on your own product" body="Paste your website and see the Reddit threads where people are asking for a product like yours. It takes about a minute." />
    </>
  );
}
