import { delay } from "../lib/browser.mjs";

export async function runContentChecks(ctx) {
  const { articlePaths, evaluate, load, results } = ctx;
  await load("/");
  const homepage = await evaluate(
    `(()=>{const anchors=['services','work','about','contact','sea-studio','notebook','elsewhere'].map(id=>({id,targets:document.querySelectorAll('[id="'+id+'"]').length,links:document.querySelectorAll('a[href="#'+id+'"]').length}));return {order:[...document.querySelectorAll('main > section[id]')].map(s=>s.id).join(),anchors,robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(',')};})()`,
  );
  const linkedSections = ["services", "work", "about", "contact"];
  results.push({
    name: "public-homepage-content",
    ...homepage,
    pass:
      homepage.order === "services,work,about,contact,sea-studio,notebook,elsewhere" &&
      homepage.anchors.every(
        (a) => a.targets === 1 && (!linkedSections.includes(a.id) || a.links > 0),
      ) &&
      !/\bnoindex\b/i.test(homepage.robots),
  });
  const writing = await evaluate(
    'document.querySelector(\'nav[aria-label="Studio"] a[href="/blog"]\')?.textContent',
  );
  const notebookLinks = await evaluate("document.querySelectorAll('a[href=\"/blog\"]').length");
  results.push({ name: "notebook-direct-link", pass: writing === "Notebook" });
  // One nav link, one section link, nothing duplicated under Elsewhere.
  results.push({
    name: "notebook-not-repeated",
    notebookLinks,
    pass:
      notebookLinks === 2 &&
      (await evaluate("!document.querySelector('#elsewhere a[href=\"/blog\"]')")),
  });
  // The sea studio: four real controls, a live plate, and every way to keep the result.
  const studio = await evaluate(`(async()=>{
 const root=document.getElementById('sea-studio');const sliders=[...root.querySelectorAll('input[type=range]')];
 const plateOf=()=>root.querySelector('svg')?.innerHTML.length+':'+root.querySelector('svg')?.querySelector('polyline')?.getAttribute('points').slice(0,80);
 const seedOf=()=>root.querySelector('figcaption code')?.textContent;
 const before=plateOf(),seedBefore=seedOf();
 const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));};
 set(sliders[0],240);await new Promise(r=>setTimeout(r,300));
 const after=plateOf(),seedAfter=seedOf();
 [...root.querySelectorAll('button')].find(b=>b.textContent==='Glass').click();await new Promise(r=>setTimeout(r,300));
 const glass=seedOf();
 const links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));
 return {sliders:sliders.length,labelled:sliders.every(s=>document.querySelector('label[for="'+s.id+'"]')),before,after,seedBefore,seedAfter,glass,links,
  sail:links.some(h=>/^\\/\\?seed=[0-9a-f]{8}&version=2$/.test(h)),print:links.some(h=>/^\\/plate\\?seed=[0-9a-f]{8}&version=2&print=1$/.test(h)),save:links.some(h=>/download=1/.test(h))};
})()`);
  results.push({
    name: "sea-studio-controls-and-keepsakes",
    ...studio,
    pass:
      studio.sliders === 4 &&
      studio.labelled &&
      studio.before !== studio.after &&
      studio.seedBefore !== studio.seedAfter &&
      studio.glass === "1e801407" &&
      studio.sail &&
      studio.print &&
      studio.save,
  });
  // The workbench: live commit log, or an honest fallback. Never raw errors, and only GitHub links.
  const workbench = await evaluate(
    `(()=>{const section=document.getElementById('activity-title').closest('section');const entries=[...section.querySelectorAll('ol a')];const links=[...section.querySelectorAll('a')];return {entries:entries.length,short:entries.filter(a=>a.getBoundingClientRect().height<43).length,hosts:[...new Set(links.map(a=>new URL(a.href).host))],repoLink:!!section.querySelector('a[href="https://github.com/maxsash/web"]'),text:section.innerText.slice(0,200),counts:/\bcommits? in the last\b/.test(section.innerText)};})()`,
  );
  results.push({
    name: "workbench-commit-log-or-fallback",
    ...workbench,
    pass:
      workbench.repoLink &&
      workbench.hosts.length === 1 &&
      workbench.hosts[0] === "github.com" &&
      ((workbench.entries > 0 &&
        workbench.entries <= 3 &&
        workbench.short === 0 &&
        !workbench.counts) ||
        /unavailable|Nothing logged/.test(workbench.text)),
  });
  const projectContent = await evaluate(
    "(()=>{const w=document.getElementById('work');return {titles:[...w.querySelectorAll('article')].map(e=>e.getAttribute('aria-label')),links:[...w.querySelectorAll('a')].map(a=>a.getAttribute('href'))};})()",
  );
  results.push({
    name: "real-projects-and-case-studies",
    ...projectContent,
    pass:
      projectContent.titles.join("|") === "Velora Rights|Household Hub|Wedding Photo Platform" &&
      [
        "https://velorarights.com",
        "https://ctrl-alt-yash.github.io/portfolio/case-study/velora-rights.html",
        "https://tenant-management-2my6.vercel.app/",
        "https://wedding-demo-teal.vercel.app/",
        "https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html",
        "https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html",
      ].every((url) => projectContent.links.includes(url)) &&
      !projectContent.links.includes("#"),
  });
  results.push({
    name: "approved-work-spreads",
    pass: await evaluate(
      "(()=>{const w=document.getElementById('work'),images=[...w.querySelectorAll('img')];return images.length===3&&images.every(i=>i.getAttribute('src').includes('%2Fimages%2Fwork%2F'))&&images[0].alt.includes('Velora Rights')&&images[1].alt.includes('light theme')&&!!w.querySelector('h2#work-heading')&&w.querySelectorAll('h3').length===3&&!w.textContent.includes('awaiting selection');})()",
    ),
  });
  results.push({
    name: "approved-elsewhere-and-contact",
    pass: await evaluate(
      "(()=>{const e=document.getElementById('elsewhere'),c=document.getElementById('contact');return e.querySelectorAll('ul a').length===3&&e.querySelector('h2#elsewhere-heading')!==null&&c.querySelector('h2#contact-heading')!==null&&c.querySelector('a[href=\"mailto:yash@maxsash.com\"]')!==null&&document.querySelectorAll('main h1').length===1&&document.querySelectorAll('footer').length===1&&!document.querySelector('main footer')&&document.querySelectorAll('main').length===1;})()",
    ),
  });
  await evaluate("document.getElementById('about').scrollIntoView({behavior:'instant'})");
  const engraved =
    "(()=>{const p=document.querySelector('#about [data-engraved]');return !!p&&p.querySelectorAll('[data-engraving] path').length===72&&p.querySelector('img').alt==='Portrait of Yash Shrivastava';})()";
  for (let i = 0; i < 80 && !(await evaluate(engraved)); i++) await delay(50);
  results.push({ name: "about-portrait-engraved-in-waves", pass: await evaluate(engraved) });
  results.push({
    name: "portfolio-replaces-placeholder-destinations",
    pass: await evaluate(
      "!!document.querySelector('#elsewhere a[href=\"https://ctrl-alt-yash.github.io/portfolio/\"]') && !document.querySelector('#elsewhere a[href=\"/resume.pdf\"]') && !document.querySelector('#elsewhere a[href=\"https://www.maxsash.com\"]')",
    ),
  });

  await evaluate('document.querySelector(\'nav[aria-label="Studio"] a[href="/blog"]\').click()');
  for (let i = 0; i < 100; i++) {
    if (
      await evaluate(
        "location.pathname==='/blog' && Boolean(document.querySelector('h1')) && !document.querySelector('canvas[data-ocean]')",
      )
    )
      break;
    await delay(50);
  }
  results.push({
    name: "notebook-one-click-navigation",
    pass: await evaluate(
      "location.pathname==='/blog' && !document.querySelector('canvas[data-ocean]')",
    ),
  });
  await load("/");
  results.push({
    name: "desktop-remains-continuous",
    pass: await evaluate(
      "!document.querySelector('[data-observatory]').dataset.staged && getComputedStyle(document.querySelector('[data-stage-controls]')).display==='none'",
    ),
  });
  await load("/blog");
  const notebook = await evaluate(
    `(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),articles:[...new Set([...document.querySelectorAll('a[href^="/blog/"]')].map(e=>e.getAttribute('href')))]}))()`,
  );
  results.push({
    name: "public-blog-index",
    ...notebook,
    pass:
      /\bnoindex\b/i.test(notebook.robots) &&
      articlePaths.every((path) => notebook.articles.includes(path)),
  });
  for (const path of articlePaths) {
    await load(path);
    const article = await evaluate(
      `(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),heading:document.querySelector('h1')?.textContent,blogLinks:document.querySelectorAll('a[href="/blog"]').length}))()`,
    );
    results.push({
      name: "public-blog-article",
      path,
      ...article,
      pass:
        /\bnoindex\b/i.test(article.robots) &&
        Boolean(article.heading?.trim()) &&
        article.blogLinks > 0,
    });
  }
}
