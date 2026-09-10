import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, '../flight400-demo-main');
const destination = path.join(root, 'src/content/docs');
const base = (process.env.SITE_BASE || '/').replace(/\/$/, '');
const github = 'https://github.com/pedro-moreira-ibm/bob-ppi-workshop/blob/main/flight400-demo-main';
await mkdir(destination, { recursive: true });
await mkdir(path.join(root, 'public/lab'), { recursive: true });
await writeFile(path.join(root, 'public/preview-config.json'), JSON.stringify({ base }));
// Explicit allowlist: credentials and unrelated repository files never enter the site.
await cp(path.join(source, 'pics'), path.join(root, 'public/lab/pics'), { recursive: true });
for (const file of ['SAMPLE-SKILL.md', 'FLIGHT400-GUIDE.md', 'FLGHT400-architecture.drawio']) {
  await cp(path.join(source, file), path.join(root, 'public/lab', file));
}
function links(text) {
  return text.replace(/(src="|\]\()(?:\.\/)?pics\//g, `$1${base}/lab/pics/`)
    .replace(/\]\(\.\/SAMPLE-SKILL\.md\)/g, `](${base}/lab/SAMPLE-SKILL.md)`)
    .replace(/\]\(ssh_private_key\.pem\)/g, `](${github}/ssh_private_key.pem)`);
}
async function page(slug, title, body, extra = '') {
  await writeFile(path.join(destination, `${slug}.md`), `---\ntitle: ${JSON.stringify(title)}\n${extra}---\n\n${links(body)}`);
}
const readme = await readFile(path.join(source, 'README.md'), 'utf8');
const sections = [...readme.matchAll(/^## (.+)$/gm)];
const manifest = [];
for (let i = 0; i < sections.length; i++) {
  const heading = sections[i][1];
  const slug = heading.startsWith('Environment') ? 'setup' : heading.startsWith('Summary') ? 'summary' : `exercise-${heading.match(/Exercise (\d)/)?.[1]}`;
  if (slug.includes('undefined')) throw new Error(`Unrecognized section: ${heading}`);
  const body = readme.slice(sections[i].index + sections[i][0].length, sections[i+1]?.index ?? readme.length);
  await page(slug, heading, body);
  manifest.push({ slug, heading, sourceCharacters: body.length });
}
for (const [slug, file, title] of [
  ['reference', 'FLIGHT400-GUIDE.md', 'Flight400 application reference'],
  ['sample-skill', 'SAMPLE-SKILL.md', 'React on IBM i · Sample skill'],
]) {
  let body = await readFile(path.join(source, file), 'utf8');
  // Keep skill YAML as visible source instead of interpreting it as page metadata.
  if (body.startsWith('---')) body = body.replace(/^---\n([\s\S]*?)\n---/, '```yaml\n$1\n```');
  await page(slug, title, body);
}
const cards = [
  ['01','Understand the application','Explore architecture, relationships, and business rules.','exercise-1','Explore'],
  ['02','Modernize RPG','Move from fixed-format code to free-format ILE RPG.','exercise-2','Transform'],
  ['03','Expand a business field','Trace and update the database, RPG, and 5250 screen.','exercise-3','Build'],
  ['04','Optimize SQL','Investigate a query with the guided Index Advisor workflow.','exercise-4','Optimize'],
  ['05','Explore your system','Investigate jobs, CPU usage, and program history.','exercise-5','Discover'],
  ['06','Build confidence with tests','Create a test plan, implement RPGUnit suites, and run them.','exercise-6','Validate'],
  ['07','Reimagine the interface','Generate a React Carbon app from a green screen.','exercise-7','Optional'],
];
await page('index', 'From legacy code to new possibilities.', `
<div class="overview-hero">
<span class="eyebrow">IBM BOB · PREMIUM PACKAGE FOR i</span>
<p class="hero-lead">Your IBM i modernization journey starts here.</p>
<p>Get hands-on with Flight400. Understand an existing application, evolve its code, and explore what comes next—with Bob alongside you.</p>
<div class="hero-actions"><a class="primary-action" href="${base}/setup/">Begin the workshop <span>↗</span></a><a href="${github}/README.md">View original lab ↗</a></div>
<div class="hero-facts"><span><strong>06</strong> core exercises</span><span><strong>01</strong> optional challenge</span><span><strong>IBM i</strong> real environment</span></div>
</div>

## Your flight plan

Start with environment setup, then follow the exercises at your own pace or with your instructor.

<a class="setup-card" href="${base}/setup/"><span class="stage-number">00</span><span><strong>Prepare your environment</strong><br />Install the extensions, connect to IBM i, and select your assigned library.</span><span aria-hidden="true">→</span></a>

<div class="exercise-grid">
${cards.map(([n,title,description,slug,tag])=>`<a class="exercise-card" href="${base}/${slug}/"><div class="card-top"><span class="stage-number">${n}</span><span class="card-tag">${tag}</span></div><strong>${title}</strong><p>${description}</p><span class="card-link">Open exercise <span aria-hidden="true">↗</span></span></a>`).join('\n')}
</div>

## Keep these within reach

<div class="resource-links"><a href="${base}/reference/">Application reference <span>Menus, function keys, and troubleshooting →</span></a><a href="${base}/sample-skill/">Sample skill <span>React and Vite on IBM i PASE →</span></a><a href="${base}/lab/FLGHT400-architecture.drawio" download>Architecture diagram <span>Download the editable Draw.io file →</span></a><a href="${base}/summary/">Workshop summary <span>Review what you have learned →</span></a></div>
`, 'tableOfContents: false\n');
await writeFile(path.join(root, '.content-manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
console.log(`Generated ${manifest.length + 3} pages from original Markdown. Original files unchanged.`);
