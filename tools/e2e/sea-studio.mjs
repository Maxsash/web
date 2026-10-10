import { delay } from "../lib/browser.mjs";

const layout = `(()=>{
  const studio=document.getElementById('sea-studio'),figure=studio.querySelector('figure'),svg=figure.querySelector('svg');
  const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  const matrix=svg.getScreenCTM(),view=svg.viewBox.baseVal;
  const origin=new DOMPoint(view.x,view.y).matrixTransform(matrix),end=new DOMPoint(view.x+view.width,view.y+view.height).matrixTransform(matrix);
  return {intro:box(studio.querySelector('h2').parentElement),figure:box(figure),form:box(studio.querySelector('form')),
    art:{left:origin.x,top:origin.y,right:end.x,bottom:end.y,height:end.y-origin.y},
    overflow:document.documentElement.scrollWidth>innerWidth+1,seed:figure.querySelector('code').textContent,
    drawing:svg.querySelector('polyline').getAttribute('points').slice(0,120)};
})()`;

const focusState = `(()=>{
  const e=document.activeElement,r=e.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  const f=document.querySelector('#sea-studio figure').getBoundingClientRect();
  return {top:r.top,bottom:r.bottom,viewportHeight:innerHeight,visible:r.top>=-1&&r.bottom<=innerHeight+1,uncovered:top===e||e.contains(top),
    previewVisible:f.top>=0&&f.bottom<=innerHeight,leftOfPreview:r.right<f.left};
})()`;

export async function runSeaStudioLayout(ctx) {
  const { evaluate, load, pressKey, results, send, snapshot } = ctx;
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  for (const [width, height, theme = "day"] of [
    [568, 320],
    [667, 375],
    [740, 360],
    [844, 390],
    [932, 430],
    [844, 390, "night"],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await load("/?seed=70806d5e&version=2");
    await evaluate(
      `document.documentElement.dataset.studioTheme=${JSON.stringify(theme)};window.dispatchEvent(new Event('studio-theme'))`,
    );
    await evaluate("document.getElementById('sea-studio').scrollIntoView({behavior:'instant'})");
    await delay(150);
    const initial = await evaluate(layout);
    results.push({
      name: "landscape-studio-intro-beside-larger-complete-drawing",
      width,
      height,
      theme,
      ...initial,
      pass:
        initial.intro.right < initial.figure.left &&
        Math.abs(initial.intro.top - initial.figure.top) < 1 &&
        initial.art.height >= height * 0.5 &&
        initial.art.left >= 0 &&
        initial.art.right <= width &&
        initial.art.top >= 0 &&
        initial.art.bottom <= height &&
        !initial.overflow,
    });
    await snapshot(`studio-landscape-${width}-${theme}-intro`);
    await send("Page.bringToFront");
    const sliderCount = await evaluate(
      "document.querySelectorAll('#sea-studio input[type=range]').length",
    );
    for (let index = 0; index < sliderCount; index++) {
      await evaluate(
        `document.querySelectorAll('#sea-studio input[type=range]')[${index}].focus()`,
      );
      await pressKey("ArrowRight");
      await delay(180);
      const focused = await evaluate(focusState);
      results.push({
        name: "landscape-studio-slider-visible-beside-live-preview",
        width,
        theme,
        index,
        ...focused,
        pass:
          focused.visible && focused.uncovered && focused.previewVisible && focused.leftOfPreview,
      });
    }
    const edited = await evaluate(layout);
    results.push({
      name: "landscape-studio-settings-change-drawing",
      width,
      theme,
      pass: edited.seed !== initial.seed && edited.drawing !== initial.drawing,
    });
    await snapshot(`studio-landscape-${width}-${theme}-editing`);
    await evaluate("document.querySelector('#sea-studio input[type=text]').focus()");
    await pressKey("Tab");
    const keepFocus = await evaluate(focusState);
    results.push({
      name: "landscape-studio-keep-action-visible-beside-preview",
      width,
      theme,
      ...keepFocus,
      pass: keepFocus.visible && keepFocus.uncovered && keepFocus.leftOfPreview,
    });
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate("document.querySelector('#sea-studio input[type=range]').focus()");
  await delay(180);
  const portrait = await evaluate(layout);
  const portraitFocus = await evaluate(focusState);
  results.push({
    name: "studio-rotation-restores-portrait-preview-and-clear-focus",
    ...portrait,
    pass:
      portrait.figure.bottom <= portrait.form.top + 1 &&
      portrait.art.height <= 844 * 0.32 + 1 &&
      portraitFocus.visible &&
      portraitFocus.uncovered &&
      !portrait.overflow,
  });
  await snapshot("studio-rotated-portrait");
  await evaluate(
    "document.documentElement.dataset.studioTheme='day';window.dispatchEvent(new Event('studio-theme'))",
  );
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
}
