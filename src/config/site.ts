export interface AppFacts {
  name: string;
  definition: string;
  platforms: readonly string[];
  price: string;
  appStoreUrl: string;
  developer: string;
  developerUrl: string;
  supportAddress: string;
  supportEmailUrl: string;
  socialImage: string;
  lastReviewed: string;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  indexing?: 'index,follow' | 'noindex,follow';
  breadcrumbs?: readonly Breadcrumb[];
  lastReviewed?: string;
  structuredData?: readonly Record<string, unknown>[];
}

export const appFacts: AppFacts = {
  name: 'House Manager',
  definition:
    'A home management app for iPhone, iPad, and Mac that keeps maintenance, inventory, warranties, and projects in one place.',
  platforms: ['iPhone', 'iPad', 'Mac'],
  price: 'Free',
  appStoreUrl:
    'https://apps.apple.com/us/app/house-manager-planner/id6569254568',
  developer: 'Shayes Apps LLC',
  developerUrl: 'https://www.shayesapps.com',
  supportAddress: 'support@shayesapps.com',
  supportEmailUrl: 'mailto:support@shayesapps.com?subject=House%20Manager',
  socialImage: '/assets/house-manager-social-card.png',
  lastReviewed: '2026-08-26',
};

export const siteUrl = 'https://house-app.com';

export const navigation = [
  { label: 'Maintenance', path: '/home-maintenance-app/' },
  { label: 'Inventory', path: '/home-inventory-app/' },
  { label: 'Projects', path: '/home-project-planner/' },
  { label: 'Features', path: '/features/' },
] as const;

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export const breadcrumbSchema = (breadcrumbs: readonly Breadcrumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: appFacts.name,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: appFacts.platforms.join(', '),
  description: appFacts.definition,
  url: siteUrl,
  downloadUrl: appFacts.appStoreUrl,
  author: {
    '@type': 'Organization',
    name: appFacts.developer,
    url: appFacts.developerUrl,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
} as const;
