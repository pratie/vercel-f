import { Faq, SectionTitle } from '@/components/marketing/Blocks';
import { AffiliateForm } from '@/components/marketing/AffiliateForm';
import { STICKER } from '@/components/marketing/styles';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'SneakyGuy Affiliate Program: 30% Recurring Commission | SneakyGuy',
  description:
    'Earn 30% of every payment for 12 months when you refer customers to SneakyGuy, the Reddit lead finder for founders. Apply in a minute. We review applications within 2 days.',
  path: '/affiliates',
});

const STEPS = [
  { title: 'Apply', body: 'Tell us who you are and where you’ll share SneakyGuy. We review applications within 2 days.' },
  { title: 'Share your link', body: 'Once approved you get your own referral link. Share it with founders who sell online.' },
  { title: 'Earn for a year', body: 'You get 30% of every payment each customer you refer makes, for their first 12 months.' },
];

const FAQ = [
  {
    question: 'How much can I earn?',
    answer:
      '30% of every payment for 12 months per customer. A customer on Growth at $59 a month earns you $17.70 a month, or $212.40 over the year. A Starter customer at $29 earns you $8.70 a month.',
  },
  {
    question: 'Who is a good fit?',
    answer:
      'People whose audience sells something online: newsletters, YouTube channels, communities and blogs for founders, indie hackers, marketers and agencies.',
  },
  {
    question: 'Can I promote SneakyGuy on Reddit?',
    answer:
      'Only the way we ask our customers to: be useful, follow each subreddit’s rules, and say you are an affiliate. No spam and no fake reviews.',
  },
  {
    question: 'When and how do I get paid?',
    answer: 'We agree payout details with you when we approve your application.',
  },
  {
    question: 'Do I need to be a customer?',
    answer: 'No, though people who use SneakyGuy tend to explain it best.',
  },
];

export default function AffiliatesPage() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-start">
        <div>
          <h1 className="font-play text-[40px] sm:text-[64px] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#1c1917]">
            Earn 30% for a year
          </h1>
          <p className="mt-5 max-w-[34rem] text-[17px] sm:text-[19px] leading-relaxed text-[#44403c]">
            Refer founders to SneakyGuy and get 30% of every payment they make for their first 12 months. Recurring, not
            a one-off bounty.
          </p>
          <ol className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="font-play shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1c1917] bg-[#ff4500] text-[14px] font-bold text-[#1c1917] tabular-nums"
                >
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-play text-[20px] font-bold leading-tight text-[#1c1917]">{s.title}</h2>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#44403c]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:sticky lg:top-24">
          <AffiliateForm />
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t-2 border-[#1c1917]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
          <div>
            <SectionTitle>What you’d be recommending</SectionTitle>
            <p className="mt-4 text-[17px] leading-relaxed text-[#44403c]">
              SneakyGuy finds the Reddit threads where people ask for a product like yours, scores them for buying intent,
              and drafts a reply that says you built it. The founder posts it from their own account. Plans are $29 and $59
              a month, with a 7-day trial and a 7-day refund.
            </p>
          </div>
          <div className={`${STICKER} p-6 sm:p-8`}>
            <p className="text-[15px] font-semibold text-[#57534e]">One Growth customer you refer</p>
            <p className="mt-2 font-play text-[44px] sm:text-[56px] font-extrabold leading-none tracking-[-0.03em] text-[#1c1917] tabular-nums">
              $212.40
            </p>
            <p className="mt-2 text-[15px] text-[#44403c]">30% of $59 a month, for 12 months</p>
          </div>
        </div>
      </section>

      <Faq items={FAQ} />
    </>
  );
}
