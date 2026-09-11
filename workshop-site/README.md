# Flight400 visual workshop guide

An optional Astro Starlight presentation of the existing workshop. The original `../flight400-demo-main/` files are the authoritative source and are never modified by this project.

## Preview locally

Use Node.js **22.12 or newer** (Node 24 LTS is suitable).

```bash
cd workshop-site
npm ci
npm run dev
```

Open the local URL printed by Astro, normally `http://localhost:4321`.

For the full production experience, including search:

```bash
npm run build
npm run preview
```

## Content and behavior

- `npm run sync` generates the workshop pages from the original README and publishes the sample skill as a directly linked download for Exercise 7. It runs before both development and production builds. Restart the development server after changing the original Markdown.
- `scripts/sync-content.mjs` applies presentation-only corrections, numbering, terminology, and participant-aware wording while generating the website. The source lab is never edited.
- Original files remain in their existing locations. Generated pages and copied assets are ignored by Git; update `scripts/sync-content.mjs` to change the website presentation without changing the original lab.
- Participant selection fills in explicit `4nn`, `30nn`, and `<DEV_PORT>` placeholders in page text and copyable code. Literal examples such as `FLGHT400`, and user/host placeholders, remain as authored. Selecting “Choose number” restores the placeholders.
- Completion tracking and participant selection use browser local storage. Exercises 1–6 make up the six core exercises. Exercise 7 is tracked separately. There is no account, server, or instructor dashboard.
- Screenshot zoom supports keyboard activation and Escape to close. Search is generated at build time. Pages remain readable without JavaScript; personalization, copy controls, zoom, and progress require it.
- The original private-key link points to its existing GitHub location. Credential files are never copied into the published site.
- The IBM i and Premium Package for i cheat sheet is a site-only PDF under `public/docs/` and opens from Useful Documentation.
- Typography uses IBM Plex from Google Fonts, with local system-font fallbacks.

## Verify

```bash
npm run build
npm test
npx playwright install chromium
npx playwright test
```

The tests cover source section preservation, placeholder substitution, exclusion of credentials, local links, screenshots, copy behavior, persisted progress, search, and mobile overflow.

## Optional GitHub Pages publishing

Nothing is published automatically. To use the supplied deployment template later:

1. Copy `github-pages.yml.example` to `.github/workflows/workshop-pages.yml` at the repository root and commit the site files and workflow.
2. In GitHub repository Settings → Pages, select **GitHub Actions** as the source.
3. Manually run **Publish workshop guide** in the Actions tab.

The expected project URL is `https://pedro-moreira-ibm.github.io/bob-ppi-workshop/`. The template builds with `SITE_BASE=/bob-ppi-workshop`, so navigation, search, and assets work under that prefix. GitHub allows one Pages site per repository; check for an existing site before enabling this deployment.

To verify that configuration locally:

```bash
SITE_BASE=/bob-ppi-workshop npm run build
npm run preview
```

Then open `http://localhost:4321/bob-ppi-workshop/`.

Framework references: [Starlight](https://starlight.astro.build/), [Astro deployment to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
