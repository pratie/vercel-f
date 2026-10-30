import { Faq, JsonLd, PageIntro } from '@/components/marketing/Blocks';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { MoreTools, toolJsonLd } from '@/components/tools/catalog';
import { GoogleThreads } from '@/components/tools/GoogleThreads';
import { pageMetadata } from '@/lib/seo';

const PATH = '/tools/reddit-threads-on-google';
const DESCRIPTION =
  'Free tool: enter a keyword and see the Reddit threads ranking on Google for it, with their position, subreddit, comment count and whether they still take replies.';

export const metadata = pageMetadata({
  title: 'Reddit Threads on Google: See Which Threads Rank for a Keyword (Free) | SneakyGuy',
  description: DESCRIPTION,
  path: PATH,
});

const FAQ = [
  {
    question: 'Why do Reddit threads on Google matter?',
    answer:
      'Google shows Reddit threads for a huge number of buying searches, like "best crm for freelancers". Everyone who searches that keyword can read the thread, for months or years. A helpful reply there keeps getting read long after you post it.',
  },
  {
    question: 'How do you find the threads?',
    answer:
      'We search Google for your keyword plus "reddit", keep the results that are Reddit threads, then read each thread on Reddit for its comment count and whether it is archived or locked.',
  },
  {
    question: 'What does archived or locked mean?',
    answer:
      'Reddit archives most threads after six months, and moderators can lock any thread. Neither takes new comments, so we show them at lower contrast. Threads marked open for replies are the ones you can act on.',
  },
  {
    question: 'Why are my positions different from what I see on Google?',
    answer:
      'Google results change by location, device and day. Treat the position as a guide to which threads get seen, not an exact rank.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes. No signup and no card. Results are cached for 24 hours, and there is a fair use limit per hour.',
  },
];

export default function GoogleThreadsPage() {
  return (
    <>
      <PageIntro
        title="Reddit threads on Google"
        trail={[{ href: '/tools', label: 'Free tools' }, { href: PATH, label: 'Reddit threads on Google' }]}
        intro="Enter a keyword your buyers search. See which Reddit threads Google ranks for it, how busy each one is, and which still take replies."
      >
        <div className="mt-10">
          <GoogleThreads />
        </div>
      </PageIntro>
      <UrlCheckCta
        variant="soft"
        source="tool_reddit_threads_on_google"
        body="SneakyGuy checks Google for your project’s keywords, lists the Reddit threads that rank, and drafts a reply for any of them that says you built it. It also finds new threads where people ask for a product like yours."
      />
      <Faq items={FAQ} />
      <MoreTools current={PATH} />
      <JsonLd data={toolJsonLd('Reddit threads on Google', PATH, DESCRIPTION)} />
    </>
  );
}
