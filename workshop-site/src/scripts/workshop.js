import { personalize } from './personalize.js';

const panel = document.querySelector('.participant-panel');
if (panel) {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* In-memory controls still work when storage is unavailable. */ } };
  const selector = document.querySelector('#participant-number');
  const content = document.querySelector('.sl-markdown-content');
  const originalCode = new Map();
  const originalMarkup = new Map();
  const blocks = [...content.querySelectorAll('pre')];
  for (const pre of blocks) {
    const code = pre.querySelector('code') || pre;
    originalCode.set(code, code.textContent);
    originalMarkup.set(code, code.innerHTML);
    const frame = document.createElement('div');
    frame.className = 'prompt-frame';
    const toolbar = document.createElement('div');
    toolbar.className = 'prompt-toolbar';
    const label = document.createElement('span');
    const language = pre.dataset.language || code.className.replace('language-', '');
    label.textContent = language === 'text' ? 'PROMPT FOR BOB' : 'CODE / COMMAND';
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = 'Copy'; button.setAttribute('aria-label', 'Copy code or prompt');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = 'Copied ✓'; }
      catch { button.textContent = 'Select text to copy'; const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(code); selection.removeAllRanges(); selection.addRange(range); }
      setTimeout(() => { button.textContent = 'Copy'; }, 2200);
    });
    toolbar.append(label, button); pre.before(frame); frame.append(toolbar, pre);
  }
  // Preserve original text for reversible personalization, including changing participant numbers.
  const texts = [];
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('pre, script, style, .prompt-toolbar') && /(?:4nn|30nn|<DEV_PORT>)/.test(node.textContent)) texts.push([node, node.textContent]);
  }
  const storedNumber = read('flight400-participant', '');
  selector.value = Number.isInteger(Number(storedNumber)) && Number(storedNumber) >= 1 && Number(storedNumber) <= 50 ? String(storedNumber) : '';
  function updateNumber() {
    const number = Number(selector.value);
    for (const [code, original] of originalCode) {
      const personalized = personalize(original, number);
      if (personalized === original) code.innerHTML = originalMarkup.get(code);
      else code.textContent = personalized;
    }
    for (const [node, original] of texts) node.textContent = personalize(original, number);
    document.querySelector('#environment-label').textContent = number ? `FLGHT4${String(number).padStart(2, '0')} · Port ${3000 + number}` : 'Use the number assigned by your instructor.';
    save('flight400-participant', selector.value);
  }
  selector.addEventListener('change', updateNumber); updateNumber();

  const stages = ['setup', ...Array.from({ length: 6 }, (_, i) => `exercise-${i+1}`)];
  const savedProgress = read('flight400-progress', {});
  const progress = savedProgress && typeof savedProgress === 'object' && !Array.isArray(savedProgress) ? savedProgress : {};
  const checkbox = document.querySelector('#stage-complete');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  function updateProgress() {
    const count = stages.filter(stage => progress[stage] === true).length;
    document.querySelector('#progress-label').textContent = `${count} of 7 core stages complete`;
    document.querySelector('#progress-meter').value = count;
    const next = stages.find(stage => progress[stage] !== true);
    const resume = document.querySelector('#resume-link');
    resume.href = `${base}/${next || 'exercise-7'}/`;
    resume.textContent = count === 0 ? 'Start workshop →' : next ? 'Resume workshop →' : 'Explore the optional challenge →';
    for (const link of document.querySelectorAll('.sidebar a, .exercise-card, .setup-card')) {
      const slug = new URL(link.href).pathname.split('/').filter(Boolean).at(-1);
      link.classList.toggle('stage-done', progress[slug] === true);
    }
  }
  if (checkbox) {
    checkbox.checked = progress[panel.dataset.page] === true;
    checkbox.addEventListener('change', () => { progress[panel.dataset.page] = checkbox.checked; save('flight400-progress', progress); updateProgress(); });
  }
  updateProgress();

  for (const table of content.querySelectorAll('table')) {
    if (['Approve changes', 'Save', 'Compile'].every(word => table.textContent.includes(word))) table.classList.add('checkpoint-table');
  }

  const viewer = document.querySelector('#image-viewer');
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  for (const img of content.querySelectorAll('img')) {
    // Links retain their original behavior; standalone screenshots gain a keyboard-operable zoom control.
    if (img.closest('a')) continue;
    const button = document.createElement('button');
    button.className = 'screenshot-button'; button.type = 'button';
    button.setAttribute('aria-label', `Enlarge screenshot: ${img.alt || 'Lab screenshot'}`);
    img.before(button); button.append(img);
    button.addEventListener('click', () => {
      const enlarged = viewer.querySelector('img'); enlarged.src = img.src; enlarged.alt = img.alt;
      viewer.querySelector('p').textContent = img.alt; viewer.showModal();
    });
  }
}
