import { PageIntro } from '@/components/marketing/Blocks';
import { UrlCheckCta } from '@/components/marketing/UrlCheckCta';
import { ToolCards } from '@/components/tools/catalog';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Free Reddit Marketing Tools | SneakyGuy',
  description:
    'Free Reddit tools, no signup: find the subreddits where your buyers post, check a subreddit’s self-promotion rules, and see which Reddit threads rank on Google.',
  path: '/tools',
});

export default function ToolsIndex() {
  return (
    <>
      <PageIntro
        title="Free Reddit tools"
        intro="Three tools for finding your buyers on Reddit without getting removed. No signup, no card."
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <ToolCards />
      </section>
      <UrlCheckCta source="tools_index" />
    </>
  );
}
