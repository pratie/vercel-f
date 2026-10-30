import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FOCUS, LINK, STICKER } from './styles';

export interface FaqItem {
  question: string;
  answer: string;
}

/** Structured data, rendered into the server HTML for crawlers. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function Breadcrumbs({ trail }: { trail: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[14px] text-[#57534e]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-[#a8a29e]">/</span>}
            {i === trail.length - 1 ? (
              <span aria-current="page" className="font-medium text-[#1c1917]">{item.label}</span>
            ) : (
              <Link href={item.href} className={`hover:text-[#1c1917] rounded ${FOCUS}`}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            item: `https://www.sneakyguy.com${item.href}`,
          })),
        }}
      />
    </nav>
  );
}

/** Page top: breadcrumbs, the one h1, a short intro. Left aligned. */
export function PageIntro({
  title,
  intro,
  trail,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  trail?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
      {trail && <Breadcrumbs trail={trail} />}
      <h1 className="mt-6 max-w-3xl font-play text-[40px] sm:text-[64px] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#1c1917]">
        {title}
      </h1>
      <div className="mt-5 max-w-[38rem] text-[17px] sm:text-[19px] leading-relaxed text-[#44403c]">{intro}</div>
      {children}
    </section>
  );
}

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-play text-[28px] sm:text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#1c1917] scroll-mt-24">
      {children}
    </h2>
  );
}

/**
 * Questions and answers, server rendered with <details> so the answers are in
 * the HTML for crawlers and open without JavaScript. Emits FAQPage data.
 */
export function Faq({ items, title = 'Questions' }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="py-16 sm:py-24 border-t-2 border-[#1c1917]/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <SectionTitle>{title}</SectionTitle>
          <p className="mt-3 text-[16px] text-[#44403c]">
            Anything else?{' '}
            <a href="mailto:support@sneakyguy.com" className={LINK}>Email us</a>.
          </p>
        </div>
        <div className={`${STICKER} px-6`}>
          {items.map((item) => (
            <details key={item.question} className="group border-b-2 border-[#1c1917]/10 last:border-0">
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left rounded-lg [&::-webkit-details-marker]:hidden ${FOCUS}`}
              >
                <span className="text-[16px] font-semibold text-[#1c1917]">{item.question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#1c1917] bg-white text-[#1c1917] transition-[transform,background-color] duration-200 motion-reduce:transition-none group-open:rotate-45 group-open:bg-[#1c1917] group-open:text-white"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-[#44403c]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </section>
  );
}
