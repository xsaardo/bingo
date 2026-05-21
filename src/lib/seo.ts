// ABOUTME: Site-wide SEO constants and JSON-LD structured-data builders.
// ABOUTME: Used by route components to render <svelte:head> meta consistently.

export const SITE_URL = 'https://gobingoals.app';
export const SITE_NAME = 'Bingoals';
export const DEFAULT_TITLE = 'Bingoals — Turn your goals into a bingo board';
export const DEFAULT_DESCRIPTION =
  'Bingoals turns your yearly goals into a bingo board. Set 25 goals, mark them off as you finish, share your progress, and aim for bingo. Free and no sign-up required.';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export function canonical(pathname: string): string {
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return `${SITE_URL}${path}`;
}

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Visual 5x5 bingo goal board',
      'Track progress with notes and milestones',
      'Shareable public links',
      'Free to use, no sign-up required'
    ]
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}
