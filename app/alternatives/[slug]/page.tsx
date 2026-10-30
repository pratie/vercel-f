import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { Faq, PageIntro, SectionTitle } from '@/components/marketing/Blocks';
import { FOCUS, PANEL, STICKER } from '@/components/marketing/styles';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { ALTERNATIVES, getAlternative, LAST_CHECKED, SNEAKYGUY_FEATURES } from '@/lib/alternatives';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const alt = getAlternative(params.slug);
  if (!alt) return {};
  return pageMetadata({ title: alt.metaTitle, description: alt.metaDescription, path: `/alternatives/${alt.slug}` });
}

export default function AlternativePage({ params }: { params: { slug: string } }) {
  const alt = getAlternative(params.slug);
  if (!alt) notFound();
  const path = `/alternatives/${alt.slug}`;
  const others = ALTERNATIVES.filter((a) => a.slug !== alt.slug);

  return (
    <>
      <PageIntro
        title={alt.h1}
        trail={[{ href: '/alternatives', label: 'Compare' }, { href: path, label: `SneakyGuy vs ${alt.name}` }]}
        intro={alt.intro}
      >
        <p className="mt-4 text-[14px] text-[#57534e]">Last checked {LAST_CHECKED}. Spotted something out of date? <a href="mailto:support@sneakyguy.com" className="font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4">Tell us</a> and we will fix it.</p>
      </PageIntro>

      {/* The table. On phones each row stacks: the label spans, the two answers sit side by side. */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20" aria-labelledby="compare-title">
        <SectionTitle id="compare-title">SneakyGuy vs {alt.name} at a glance</SectionTitle>
        <div className={`${STICKER} mt-8 overflow-hidden`}>
          <table className="w-full text-left text-[14px] sm:text-[15px]">
            <caption className="sr-only">SneakyGuy compared with {alt.name}</caption>
            <thead className="bg-[#1c1917] text-white">
              <tr className="grid grid-cols-2 sm:table-row">
                <th scope="col" className="hidden sm:table-cell w-[24%] px-5 py-4 font-semibold"><span className="sr-only">Feature</span></th>
                <th scope="col" className="px-4 sm:px-5 py-4 font-play text-[17px] sm:text-[19px] font-bold">SneakyGuy</th>
                <th scope="col" className="px-4 sm:px-5 py-4 font-play text-[17px] sm:text-[19px] font-bold">{alt.name}</th>
              </tr>
            </thead>
            <tbody>
              {alt.rows.map((row) => (
                <tr key={row.label} className="grid grid-cols-2 sm:table-row border-t border-black/[0.08] first:border-t-0">
                  <th scope="row" className="col-span-2 px-4 sm:px-5 pt-4 pb-1 sm:py-4 align-top text-[13px] sm:text-[15px] font-semibold text-[#57534e] sm:text-[#1c1917]">
                    {row.label}
                  </th>
                  <td className="px-4 sm:px-5 pb-4 pt-1 sm:py-4 align-top leading-relaxed text-[#1c1917] sm:bg-[#fff4f0]">{row.us}</td>
                  <td className="px-4 sm:px-5 pb-4 pt-1 sm:py-4 align-top leading-relaxed text-[#44403c]">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {alt.sections.map((s) => (
        <section key={s.title} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-16">
          <SectionTitle>{s.title}</SectionTitle>
          {s.body.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 text-[17px] leading-relaxed text-[#44403c]">{p}</p>
          ))}
        </section>
      ))}

      <section className="py-16 sm:py-20 border-t-2 border-[#1c1917]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>Who should pick which</SectionTitle>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${PANEL} p-6 sm:p-8`}>
              <h3 className="font-play text-[22px] font-bold text-[#1c1917]">Pick {alt.name} if</h3>
              <ul className="mt-4 space-y-3">
                {alt.pickThem.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[#44403c]">
                    <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#78716c]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${STICKER} p-6 sm:p-8`}>
              <h3 className="font-play text-[22px] font-bold text-[#1c1917]">Pick SneakyGuy if</h3>
              <ul className="mt-4 space-y-3">
                {alt.pickUs.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[#1c1917]">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" strokeWidth={2.5} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-play text-[22px] font-bold text-[#1c1917]">Also in SneakyGuy</h3>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {SNEAKYGUY_FEATURES.map((f) => (
                <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-[#44403c]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" strokeWidth={2.5} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Faq items={alt.faq} />

      <section className="pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-play text-[22px] font-bold text-[#1c1917]">Other comparisons</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/alternatives/${o.slug}`}
                  className={`inline-flex h-10 items-center rounded-xl border-2 border-[#1c1917]/[0.12] bg-white px-4 text-[14px] font-semibold text-[#1c1917] hover:border-[#1c1917] transition-colors ${FOCUS}`}
                >
                  SneakyGuy vs {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <UrlCheckCta source={`alternative_${alt.slug}`} title="See your own leads first" body="Paste your website. See the Reddit threads where people are asking for a product like yours before you pay anything." />
    </>
  );
}
