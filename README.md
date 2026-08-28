# House Manager website

The public marketing site for [House Manager](https://house-app.com), built as a statically rendered Astro site and deployed to GitHub Pages.

## Local development

```sh
npm install
npm run dev
```

The production verification path is:

```sh
npm run test:ci
```

That command type-checks the Astro project, creates the production build, and validates metadata, canonicals, H1 usage, JSON-LD, internal links, assets, sitemap membership, invite indexing, required Apple files, and named crawler policies.

Run `npm run lighthouse` after a production build to check the homepage and three topical landing pages against the performance, accessibility, and SEO targets in `.lighthouserc.json`.

## Product facts

Visible product facts, metadata, and structured data use `src/config/site.ts` as their shared source. Update price wording or platform availability only after checking the US App Store listing. Change `lastReviewed` only when the factual product information has been reviewed.

## Production contracts

- `public/CNAME` preserves the `house-app.com` custom domain.
- `public/.well-known/` preserves Apple association and verification files.
- `public/assets/House_Manager_Press_Kit.zip` preserves the existing press-kit URL.
- `/invite/` and `/invite-beta/` remain redirect pages and are excluded from indexing and the sitemap.
- `public/robots.txt` contains the selected search-crawler and training-crawler policy. Review that list quarterly against vendor documentation.

## Launch operations

Deployment is automatic from `main` through Astro's official GitHub Pages action. Pull requests run the same type-check, production build, and SEO validation without deploying.

Search Console launch work remains a manual account-level step:

1. Confirm or create the `house-app.com` domain property with DNS verification.
2. Submit `https://house-app.com/sitemap-index.xml`.
3. Request indexing for `/`, `/home-maintenance-app/`, `/home-inventory-app/`, and `/home-project-planner/`.
4. Inspect representative URLs and validate the homepage structured data with Google's Rich Results Test.
5. Record the prior 28-day baseline, then review indexed pages, crawl errors, non-branded impressions/clicks, Core Web Vitals, available generative-search reporting, and total App Store downloads at weeks 2, 4, 8, and 12.

App Store Connect download totals are an aggregate KPI; the site intentionally includes no analytics or outbound-click tracking, so they should not be presented as website-attributed downloads.
