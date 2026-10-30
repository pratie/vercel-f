import { Suspense } from 'react';
import { Faq, JsonLd, PageIntro } from '@/components/marketing/Blocks';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { MoreTools, toolJsonLd } from '@/components/tools/catalog';
import { RulesChecker } from '@/components/tools/RulesChecker';
import { pageMetadata } from '@/lib/seo';

const PATH = '/tools/subreddit-rules-checker';
const DESCRIPTION =
  'Free subreddit rules checker. Enter any subreddit to see its rules, how strict it is about self-promotion, and a plain summary of what you can post.';

export const metadata = pageMetadata({
  title: 'Subreddit Rules Checker: Can You Self-Promote Here? (Free) | SneakyGuy',
  description: DESCRIPTION,
  path: PATH,
});

const FAQ = [
  {
    question: 'What do Strict, Careful and Open mean?',
    answer:
      'Strict means a rule bans self-promotion or advertising outright. Careful means promotion is allowed with conditions, such as a weekly thread, a ratio like the 10% rule, disclosure, or a karma minimum. Open means no written rule mentions promotion, though moderators can still remove anything that reads like an ad.',
  },
  {
    question: 'Can I mention my product in a Strict subreddit?',
    answer:
      'Not as a pitch. You can still answer questions well, and if someone asks what you use, say you built it and keep it short. Linking or pushing your product there is how accounts get banned.',
  },
  {
    question: 'Where do the rules come from?',
    answer:
      'Straight from Reddit: each subreddit publishes its rules, and we read them live, then cache them for 24 hours. The strictness label is our reading of those rules, so read the flagged ones yourself before you post.',
  },
  {
    question: 'Why does a subreddit say it was not found?',
    answer:
      'It is misspelt, private, banned, or does not exist. Check the name on reddit.com. Names use letters, numbers and underscores only.',
  },
  {
    question: 'Does following the rules keep my account safe?',
    answer:
      'It helps a lot, but nobody can promise it. Moderators also remove posts that feel spammy even when no rule says so. Be useful first, disclose that you built the product, and do not post the same reply in many places.',
  },
];

export default function RulesCheckerPage() {
  return (
    <>
      <PageIntro
        title="Subreddit rules checker"
        trail={[{ href: '/tools', label: 'Free tools' }, { href: PATH, label: 'Subreddit rules checker' }]}
        intro="Enter a subreddit. See its rules, how strict it is about self-promotion, and what that means for you before you post."
      >
        <div className="mt-10">
          <Suspense fallback={<div className="h-[68px] max-w-2xl rounded-2xl border-2 border-[#1c1917] shadow-[5px_5px_0_#1c1917]" />}>
            <RulesChecker />
          </Suspense>
        </div>
      </PageIntro>
      <UrlCheckCta
        variant="soft"
        source="tool_subreddit_rules_checker"
        title="Want the threads found for you every day?"
        body="SneakyGuy finds Reddit threads where people ask for a product like yours, scores them for buying intent, and drafts a reply that says you built it. You post it yourself."
      />
      <Faq items={FAQ} />
      <MoreTools current={PATH} />
      <JsonLd data={toolJsonLd('Subreddit rules checker', PATH, DESCRIPTION)} />
    </>
  );
}
