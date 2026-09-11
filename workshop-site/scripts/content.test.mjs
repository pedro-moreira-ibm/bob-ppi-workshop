import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { personalize } from '../src/scripts/personalize.js';

test('personalization covers library, path and port variants and preserves unrelated values', () => {
  const original = 'FLGHT4nn FLIGHT4nn Flight4nn flght4nn flight4nn FRS4nn 30nn <DEV_PORT> FLGHT400 50000';
  assert.equal(personalize(original, 3), 'FLGHT403 FLIGHT403 Flight403 flght403 flight403 FRS403 3003 3003 FLGHT400 50000');
  assert.equal(personalize(original, 50), 'FLGHT450 FLIGHT450 Flight450 flght450 flight450 FRS450 3050 3050 FLGHT400 50000');
  for (const invalid of [0, 51, NaN, 1.5]) assert.equal(personalize(original, invalid), original);
});
test('every source section maps to a generated page', async () => {
  const original = await readFile('../flight400-demo-main/README.md', 'utf8');
  const manifest = JSON.parse(await readFile('.content-manifest.json', 'utf8'));
  const sections = [...original.matchAll(/^## (.+)$/gm)];
  assert.equal(manifest.length, sections.length);
  for (let i = 0; i < sections.length; i++) {
    const source = original.slice(sections[i].index + sections[i][0].length, sections[i+1]?.index ?? original.length);
    const generated = await readFile(`src/content/docs/${manifest[i].slug}.md`, 'utf8');
    assert.equal(manifest[i].heading, sections[i][1]);
    assert.equal(manifest[i].sourceCharacters, source.length);
    assert.match(generated, /^---\ntitle:/);
  }
});
test('generated workshop applies the presentation-only content rules', async () => {
  const pages = Object.fromEntries(await Promise.all(
    ['index', 'setup', ...Array.from({ length: 7 }, (_, i) => `exercise-${i + 1}`), 'summary'].map(async slug => [slug, await readFile(`src/content/docs/${slug}.md`, 'utf8')])
  ));
  const workshop = Object.values(pages).join('\n');
  assert.match(pages.index, /Modernize IBM i applications with IBM Bob/);
  assert.doesNotMatch(pages.index, /Keep these within reach|View original lab|optional challenge|IBM i real environment/);
  assert.doesNotMatch(workshop, /Bob chat UI|replacing `nn`|replace the 'nn'/i);
  assert.match(pages['exercise-4'], /### 4\.1\.[\s\S]*### 4\.2\.[\s\S]*### 4\.3\./);
  assert.match(pages['exercise-5'], /### 5\.1\./);
  assert.match(pages['exercise-6'], /### 6\.1\.[\s\S]*### 6\.2\.[\s\S]*### 6\.3\.[\s\S]*### 6\.4\./);
  assert.match(pages['exercise-7'], /### 7\.1\.[\s\S]*### 7\.2\.[\s\S]*### 7\.3\./);
  assert.doesNotMatch(pages['exercise-7'], /💡|For example, `FLGHT401`/);
  assert.match(pages.summary, /summary-celebration[\s\S]*What you accomplished/);
  assert.doesNotMatch(pages.summary, /\*\*Next steps:\*\*/);
});
test('private key is excluded from published assets', async () => {
  await assert.rejects(access('public/lab/ssh_private_key.pem'));
});
test('only the directly linked sample skill remains from the former resources section', async () => {
  await access('public/lab/SAMPLE-SKILL.md');
  await assert.rejects(access('src/content/docs/reference.md'));
  await assert.rejects(access('src/content/docs/sample-skill.md'));
  await assert.rejects(access('public/lab/FLIGHT400-GUIDE.md'));
  await assert.rejects(access('public/lab/FLGHT400-architecture.drawio'));
});
test('IBM i cheat sheet is included as a published site document', async () => {
  await access('public/docs/ibmi-premium-package-cheat-sheet.pdf');
});
