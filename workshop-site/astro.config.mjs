import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://pedro-moreira-ibm.github.io',
  base: process.env.SITE_BASE || '/',
  integrations: [starlight({
    title: 'IBM Bob · Flight400',
    description: 'A hands-on journey through IBM i application modernization with IBM Bob.',
    favicon: '/favicon.svg',
    customCss: ['./src/styles/workshop.css'],
    expressiveCode: false,
    components: {
      MarkdownContent: './src/components/WorkshopContent.astro',
      Sidebar: './src/components/Sidebar.astro',
      PageSidebar: './src/components/PageSidebar.astro',
    },
    sidebar: [
      { label: 'Workshop overview', slug: '' },
      { label: 'Start here', items: [{ label: 'Environment setup', slug: 'setup' }] },
      { label: 'Core exercises', items: [
        { label: '01 · Understand the application', slug: 'exercise-1' },
        { label: '02 · Modernize RPG', slug: 'exercise-2' },
        { label: '03 · Expand a business field', slug: 'exercise-3' },
        { label: '04 · Optimize SQL', slug: 'exercise-4' },
        { label: '05 · Explore your system', slug: 'exercise-5' },
        { label: '06 · Build RPGUnit tests', slug: 'exercise-6' },
      ] },
      { label: 'Optional exercise', items: [
        { label: '07 · Build a React interface', slug: 'exercise-7', badge: 'Optional' },
      ] },
      { label: 'Workshop summary', slug: 'summary' },
      { label: 'Useful Documentation', items: [
        { label: 'Bob IDE', link: 'https://bob.ibm.com/docs/ide', attrs: { target: '_blank', rel: 'noopener noreferrer' } },
        { label: 'Bob Shell', link: 'https://bob.ibm.com/docs/shell', attrs: { target: '_blank', rel: 'noopener noreferrer' } },
        { label: 'IBM i Cheat Sheet', link: '/docs/ibmi-premium-package-cheat-sheet.pdf', attrs: { target: '_blank', rel: 'noopener noreferrer' } },
      ] },
    ],
  })],
});
