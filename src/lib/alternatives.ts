// Content for the comparison pages under /alternatives.
//
// House rules for this file: facts only, phrased neutrally, nothing about a
// competitor we cannot back up. Where we are not sure of a detail we leave it
// out rather than guess, and every page says when it was last checked. Update
// LAST_CHECKED whenever the facts are re-verified.

export const LAST_CHECKED = 'October 2026';

export interface ComparisonRow {
  label: string;
  us: string;
  them: string;
}

export interface Alternative {
  slug: string;
  name: string;
  /** The page h1, shaped like the search people make. */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** One line for the index card. */
  card: string;
  intro: string;
  rows: ComparisonRow[];
  sections: { title: string; body: string[] }[];
  pickThem: string[];
  pickUs: string[];
  faq: { question: string; answer: string }[];
}

/** SneakyGuy facts every comparison draws on. Keep in step with pricing. */
const US = {
  price: '$29 a month (Starter, 1 project) or $59 a month (Growth, 3 projects)',
  trial: '7-day free trial, and a free URL check with no signup and no card',
  refund: 'Full refund within 7 days of your first payment',
};

export const SNEAKYGUY_FEATURES = [
  'Every new thread scored 20 to 100 for buying intent, best first',
  'A reply drafted for each lead that says you built the product',
  'Autopilot: scans and drafts on a schedule, ready when you open the app',
  'Filters, sorting and CSV export for your leads',
  'SEO opportunities: the Reddit threads that rank on Google for your keywords',
  'Brand signals: threads that mention you or the competitors you track',
  'Reply results: see how the replies you posted are doing',
];

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'bazzly',
    name: 'Bazzly',
    h1: 'Bazzly alternative',
    metaTitle: 'Bazzly Alternative: SneakyGuy vs Bazzly (2026 Comparison) | SneakyGuy',
    metaDescription:
      'Looking for a Bazzly alternative? Compare SneakyGuy and Bazzly on price, cost per comment, who posts, niches, trials and refunds. From $29 a month, you post from your own account.',
    card: 'Bazzly posts for you from accounts it runs, from $199 a month. SneakyGuy finds the threads and drafts the reply, and you post it, from $29.',
    intro:
      'Bazzly and SneakyGuy both find Reddit threads where people ask for a product like yours. The difference is who posts the reply. Bazzly can post it from accounts it runs and boost it with upvotes. SneakyGuy drafts it and you post it yourself, from your own account, for a fraction of the price.',
    rows: [
      { label: 'Price', us: US.price, them: '$199 a month per project' },
      { label: 'What the plan includes', us: 'Unlimited reply drafts', them: '170 credits a month' },
      {
        label: 'Cost of one comment',
        us: 'Nothing extra. You post it yourself',
        them: '10 credits, about $11.70 each if you spend every credit on comments',
      },
      {
        label: 'Who posts',
        us: 'You, from your own Reddit account',
        them: 'Bazzly’s warmed accounts, or your own account through a Chrome extension capped at 3 posts a day',
      },
      { label: 'Upvotes', us: 'Never bought or sold', them: 'Sold at 0.2 credits each' },
      {
        label: 'Niches',
        us: 'Any niche, since you post from your own account',
        them: 'Some niches restricted, such as gambling and crypto tokens',
      },
      { label: 'Trying it', us: US.trial, them: 'Card required to start the trial' },
      { label: 'Refunds', us: US.refund, them: 'No refunds on subscriptions' },
    ],
    sections: [
      {
        title: 'What a comment costs',
        body: [
          'Bazzly’s plan is $199 a month for 170 credits. A comment from one of its accounts costs 10 credits, so if you spent every credit on comments you would get 17 a month, about $11.70 each. Upvotes and other actions come out of the same credits.',
          'SneakyGuy does not charge per comment. Starter is $29 a month and Growth is $59, with unlimited reply drafts. You spend your own time posting instead of credits.',
        ],
      },
      {
        title: 'Who posts the reply',
        body: [
          'Bazzly can post for you from warmed accounts it runs, which is the whole appeal if you never want to open Reddit. For your own account it offers a Chrome extension, capped at 3 posts a day.',
          'SneakyGuy never posts for you and never buys votes. You read the draft, edit it, and post it from your own account, which builds your own reputation in the communities you care about. Reddit’s content policy forbids vote manipulation, so we stay out of it.',
        ],
      },
      {
        title: 'Restricted niches',
        body: [
          'Bazzly restricts some niches, such as gambling and crypto tokens. Because SneakyGuy users post from their own accounts, we do not restrict niches. Each subreddit’s own rules still apply, and our free subreddit rules checker shows them before you post.',
        ],
      },
    ],
    pickThem: [
      'You want comments posted for you without touching Reddit yourself',
      '$199 a month per project fits your budget',
      'Your niche is not on their restricted list',
    ],
    pickUs: [
      'You are happy to post replies yourself, from your own account',
      'You want to spend $29 to $59 a month, not $199',
      'You are in a niche other tools restrict',
      'You want a free check first and a refund window after you pay',
    ],
    faq: [
      {
        question: 'Is SneakyGuy a good Bazzly alternative?',
        answer:
          'If you are willing to post replies yourself, yes. SneakyGuy finds the same kind of threads, scores them for buying intent and drafts the reply, from $29 a month. If you want someone else to post for you, Bazzly does that and SneakyGuy does not.',
      },
      {
        question: 'How much does a Bazzly comment cost?',
        answer:
          'Bazzly charges $199 a month for 170 credits, and a comment from its accounts costs 10 credits. Spent only on comments, that is 17 comments, or about $11.70 each. Check their pricing page for the current numbers.',
      },
      {
        question: 'Can SneakyGuy post comments for me?',
        answer:
          'No. SneakyGuy drafts the reply and you post it from your own account. We never post for you, run accounts for you, or buy upvotes.',
      },
      {
        question: 'Does SneakyGuy work for gambling, crypto or other restricted niches?',
        answer:
          'Yes. You post from your own account, so we do not restrict niches. Follow each subreddit’s rules, which our free rules checker shows you.',
      },
      {
        question: 'Can I try SneakyGuy before paying?',
        answer:
          'Yes. Paste your site for a free check with no signup and no card, and see real threads for your product. Paid plans start with a 7-day trial, and you get a full refund within 7 days of your first payment.',
      },
    ],
  },
  {
    slug: 'gummysearch',
    name: 'GummySearch',
    h1: 'GummySearch alternative',
    metaTitle: 'GummySearch Alternative for Finding Reddit Leads (2026) | SneakyGuy',
    metaDescription:
      'GummySearch announced in 2025 that it was shutting down. Compare it with SneakyGuy, which finds Reddit threads where people ask for a product like yours and drafts the reply. From $29 a month.',
    card: 'GummySearch was built for Reddit audience research and announced its shutdown in 2025. SneakyGuy is built for finding leads and replying.',
    intro:
      'GummySearch was a popular Reddit audience research tool: find the subreddits your audience uses, browse their pain points and requests, and track keywords. It announced in 2025 that it was shutting down. If you used it to find threads worth replying to, that is the job SneakyGuy is built for.',
    rows: [
      { label: 'Status', us: 'Active', them: 'Announced its shutdown in 2025' },
      {
        label: 'Built for',
        us: 'Finding threads where people ask for a product like yours, and replying',
        them: 'Audience research: subreddits, themes, pain points and requests',
      },
      {
        label: 'Finding subreddits',
        us: 'Picked for your project from your website, plus a free subreddit finder',
        them: 'Audience and subreddit discovery',
      },
      { label: 'Buying-intent score', us: 'Every thread scored 20 to 100', them: 'Themes such as solution requests' },
      { label: 'Reply drafts', us: 'Drafted for each lead, saying you built it', them: 'Not the focus' },
      { label: 'Price', us: US.price, them: 'No longer sold' },
    ],
    sections: [
      {
        title: 'Research tool or lead tool',
        body: [
          'GummySearch was strongest at research: understanding a community, what it complains about and what it asks for. Many people also used it to spot threads to reply to.',
          'SneakyGuy skips the research step. You paste your site, and it watches Reddit for threads where someone is asking for a product like yours, scores each one for buying intent, and drafts a reply that discloses you built it. You post it yourself.',
        ],
      },
      {
        title: 'Moving over',
        body: [
          'Bring your keywords and subreddits. SneakyGuy suggests both from your website, and you can edit them. To find new communities, our free subreddit finder works without an account.',
        ],
      },
    ],
    pickThem: [
      'GummySearch is no longer an option for new customers, so check their site for its current status',
    ],
    pickUs: [
      'You used GummySearch to find threads worth replying to',
      'You want each thread scored for buying intent and a reply drafted',
      'You want the Reddit threads that rank on Google for your keywords',
    ],
    faq: [
      {
        question: 'Is GummySearch shutting down?',
        answer:
          'GummySearch announced in 2025 that it was shutting down. Check their website for the latest on access for existing customers.',
      },
      {
        question: 'What is the best GummySearch alternative?',
        answer:
          'It depends on what you used it for. For audience research, look for a dedicated research tool. For finding Reddit threads where people want a product like yours and replying to them, SneakyGuy is built for exactly that.',
      },
      {
        question: 'Does SneakyGuy find subreddits like GummySearch did?',
        answer:
          'Yes, for your product. It picks subreddits from your website when you create a project, and the free subreddit finder suggests communities for any product with member counts and activity.',
      },
      {
        question: 'How much does SneakyGuy cost?',
        answer: 'Starter is $29 a month for 1 project and Growth is $59 a month for 3. Both start with a 7-day trial and a 7-day refund window.',
      },
    ],
  },
  {
    slug: 'f5bot',
    name: 'F5Bot',
    h1: 'F5Bot alternative',
    metaTitle: 'F5Bot Alternative: Reddit Alerts With Scoring and Replies | SneakyGuy',
    metaDescription:
      'F5Bot sends free email alerts when your keywords appear on Reddit. Compare it with SneakyGuy, which scores each thread for buying intent and drafts the reply. From $29 a month.',
    card: 'F5Bot is a free keyword alert by email. SneakyGuy scores every thread for buying intent and drafts the reply.',
    intro:
      'F5Bot is a free service that emails you when your keywords appear on Reddit, Hacker News and Lobsters. It is simple and it works. SneakyGuy is for when keyword alerts turn into too many emails to read: it scores every thread for buying intent and drafts a reply for the ones worth answering.',
    rows: [
      { label: 'Price', us: US.price, them: 'Free' },
      { label: 'Sources', us: 'Reddit', them: 'Reddit, Hacker News and Lobsters' },
      { label: 'How you get results', us: 'A dashboard of leads, best first', them: 'Email alerts' },
      { label: 'Matching', us: 'Keywords, then a buying-intent score from 20 to 100', them: 'Keyword matches' },
      { label: 'Reply drafts', us: 'Drafted for each lead', them: 'No' },
      { label: 'Filters, sorting, CSV export', us: 'Yes', them: 'No' },
      { label: 'Threads that rank on Google', us: 'Yes, as SEO opportunities', them: 'No' },
    ],
    sections: [
      {
        title: 'Alerts versus leads',
        body: [
          'F5Bot tells you a keyword appeared. That is useful, and free, but every match lands in your inbox with the same weight, whether it is a buyer asking for a tool or a passing mention.',
          'SneakyGuy reads each matching thread and scores it for buying intent, so someone asking "what should I use for invoicing?" sits at the top and noise sinks. Each lead comes with a reply drafted that says you built the product.',
        ],
      },
    ],
    pickThem: [
      'You want free alerts and are happy to sort them yourself',
      'You also want Hacker News and Lobsters mentions',
      'You track a handful of low-volume keywords',
    ],
    pickUs: [
      'Your alerts have become too many to read',
      'You want the best threads first, scored for buying intent',
      'You want a reply drafted for each lead',
    ],
    faq: [
      {
        question: 'Is F5Bot really free?',
        answer: 'Yes. F5Bot is a free keyword alert service for Reddit, Hacker News and Lobsters.',
      },
      {
        question: 'Why pay for SneakyGuy if F5Bot is free?',
        answer:
          'For the time it saves. F5Bot sends every keyword match; SneakyGuy scores each thread for buying intent, puts the best first, and drafts the reply. If a few alerts a day are enough for you, F5Bot is a fine choice.',
      },
      {
        question: 'Can I use both?',
        answer: 'Yes. Plenty of people keep F5Bot for Hacker News mentions and use SneakyGuy for Reddit leads.',
      },
      {
        question: 'Can I try SneakyGuy for free?',
        answer: 'Yes. The URL check is free with no signup and no card, and paid plans start with a 7-day trial.',
      },
    ],
  },
  {
    slug: 'syften',
    name: 'Syften',
    h1: 'Syften alternative',
    metaTitle: 'Syften Alternative for Reddit Lead Generation | SneakyGuy',
    metaDescription:
      'Syften monitors keywords across Reddit and other online communities. Compare it with SneakyGuy, which focuses on Reddit, scores each thread for buying intent and drafts the reply.',
    card: 'Syften monitors keywords across many communities. SneakyGuy focuses on Reddit leads, scored and with a reply drafted.',
    intro:
      'Syften is a paid keyword monitoring tool that watches Reddit, Hacker News and a range of other online communities, and sends matches to your inbox, Slack or other tools. SneakyGuy covers Reddit only, and goes further there: every thread is scored for buying intent and comes with a reply drafted.',
    rows: [
      { label: 'Price', us: US.price, them: 'Paid plans, see their pricing page' },
      { label: 'Sources', us: 'Reddit', them: 'Reddit, Hacker News and other communities' },
      { label: 'How you get results', us: 'A dashboard of leads, best first', them: 'Alerts by email, Slack and other integrations' },
      { label: 'Matching', us: 'Keywords, then a buying-intent score from 20 to 100', them: 'Keyword and filter matching' },
      { label: 'Reply drafts', us: 'Drafted for each lead', them: 'Not the focus' },
      { label: 'Threads that rank on Google', us: 'Yes, as SEO opportunities', them: 'Not the focus' },
    ],
    sections: [
      {
        title: 'Breadth or depth',
        body: [
          'Syften’s strength is breadth: one set of keywords watched across many communities, with alerts wherever your team works. If your buyers are spread across several platforms, that matters.',
          'SneakyGuy goes deep on Reddit. It scores each thread for buying intent, drafts a reply that says you built the product, and lists the Reddit threads that rank on Google for your keywords, so a reply keeps getting read.',
        ],
      },
    ],
    pickThem: [
      'You need mentions from many communities beyond Reddit',
      'You want alerts piped into Slack or other tools',
    ],
    pickUs: [
      'Reddit is where your buyers ask for recommendations',
      'You want threads scored for buying intent, best first',
      'You want a reply drafted for each lead',
    ],
    faq: [
      {
        question: 'What does Syften do?',
        answer:
          'Syften monitors keywords across Reddit, Hacker News and other online communities and sends you the matches. Check their site for the current list of sources and plans.',
      },
      {
        question: 'Is SneakyGuy only for Reddit?',
        answer: 'Yes. SneakyGuy is a Reddit tool, and that focus is why it can score threads and draft replies for Reddit specifically.',
      },
      {
        question: 'How much does SneakyGuy cost?',
        answer: 'Starter is $29 a month for 1 project and Growth is $59 a month for 3. Both start with a 7-day trial and a 7-day refund window.',
      },
    ],
  },
];

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((a) => a.slug === slug);
}
