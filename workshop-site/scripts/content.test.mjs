import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { personalize } from '../src/scripts/personalize.js';

test('personalization covers library, path and port variants and preserves unrelated values', () => {
  const original = 'FLGHT4nn FLIGHT4nn Flight4nn flght4nn flight4nn 30nn <DEV_PORT> FLGHT400 50000';
  assert.equal(personalize(original, 3), 'FLGHT403 FLIGHT403 Flight403 flght403 flight403 3003 3003 FLGHT400 50000');
  assert.equal(personalize(original, 50), 'FLGHT450 FLIGHT450 Flight450 flght450 flight450 3050 3050 FLGHT400 50000');
  for (const invalid of [0, 51, NaN, 1.5]) assert.equal(personalize(original, invalid), original);
});
test('every source section remains complete and in order in its generated page', async () => {
  const original = await readFile('../flight400-demo-main/README.md', 'utf8');
  const manifest = JSON.parse(await readFile('.content-manifest.json', 'utf8'));
  const sections = [...original.matchAll(/^## (.+)$/gm)];
  assert.equal(manifest.length, sections.length);
  for (let i = 0; i < sections.length; i++) {
    const source = original.slice(sections[i].index + sections[i][0].length, sections[i+1]?.index ?? original.length);
    const generated = await readFile(`src/content/docs/${manifest[i].slug}.md`, 'utf8');
    const normalize = s => s.replace(/(?:https:\/\/github.com\/pedro-moreira-ibm\/bob-ppi-workshop\/blob\/main\/flight400-demo-main\/)?ssh_private_key.pem/g, 'KEY')
      .replace(/(?:\.\/|(?:\/[^\s"()]*?)?\/lab\/)?pics\//g, 'pics/')
      .replace(/(?:\.\/|(?:\/[^\s"()]*?)?\/lab\/)SAMPLE-SKILL.md/g, 'SAMPLE-SKILL.md').trim();
    assert.equal(normalize(generated.replace(/^---\n[\s\S]*?\n---\n/, '')), normalize(source), manifest[i].slug);
  }
});
test('private key is excluded from published assets', async () => {
  await assert.rejects(access('public/lab/ssh_private_key.pem'));
});
