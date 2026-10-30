import { Faq, JsonLd, PageIntro } from '@/components/marketing/Blocks';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { MoreTools, toolJsonLd } from '@/components/tools/catalog';
import { SubredditFinder } from '@/components/tools/SubredditFinder';
import { pageMetadata } from '@/lib/seo';

const PATH = '/tools/subreddit-finder';
const DESCRIPTION =
  'Free subreddit finder. Paste your website or describe your product and get the subreddits where your buyers post, with member counts, posts a day and why each one fits.';

export const metadata = pageMetadata({
  title: 'Subreddit Finder: Find Subreddits for Your Product (Free) | SneakyGuy',
  description: DESCRIPTION,
  path: PATH,
});

const FAQ = [
  {
    question: 'How does the subreddit finder pick subreddits?',
    answer:
      'It reads your website, or your description, works out who buys your product, and suggests the communities where those people ask questions. Then it checks every suggestion on Reddit and drops anything that does not exist, is private or is NSFW.',
  },
  {
    question: 'What does "posts a day" mean?',
    answer:
      'How many new posts the subreddit got per day, measured from its 50 most recent posts. A big subreddit with few posts a day is quiet, and replies there get seen by fewer people.',
  },
  {
    question: 'Is a bigger subreddit always better?',
    answer:
      'No. A 20k member subreddit where people ask for tool recommendations is usually worth more than a 5M member general one. Look at the reason we give for each subreddit, then check its rules before you post.',
  },
  {
    question: 'Can I promote my product in these subreddits?',
    answer:
      'It depends on each subreddit. Many ban self-promotion outright, others allow it in a weekly thread or with disclosure. Use the subreddit rules checker on any result before you post.',
  },
  {
    question: 'Is it really free?',
    answer: 'Yes. No signup and no card. Results are cached for 24 hours, and there is a fair use limit per hour.',
  },
];

export default function SubredditFinderPage() {
  return (
    <>
      <PageIntro
        title="Subreddit finder"
        trail={[{ href: '/tools', label: 'Free tools' }, { href: PATH, label: 'Subreddit finder' }]}
        intro="Paste your website or describe your product. Get the subreddits where your buyers post, with how big and how busy each one is, and why it fits."
      >
        <div className="mt-10">
          <SubredditFinder />
        </div>
      </PageIntro>
      <UrlCheckCta
        variant="soft"
        source="tool_subreddit_finder"
        body="SneakyGuy watches these subreddits for people asking for a product like yours, scores every thread for buying intent, and drafts a reply that says you built it."
      />
      <Faq items={FAQ} />
      <MoreTools current={PATH} />
      <JsonLd data={toolJsonLd('Subreddit finder', PATH, DESCRIPTION)} />
    </>
  );
}
