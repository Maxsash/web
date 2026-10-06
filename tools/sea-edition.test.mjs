import test from "node:test";
import assert from "node:assert/strict";
import { createSeaEdition, normaliseSeaSeed, sampleSea, renderSeaPlate, seedFromSettings, settingsFromSeed, describeSea, parseSeaVersion, pickVisitSea, HOME_WATER, DEFAULT_SEA_SEED_V2 } from "../lib/sea-edition.ts";
import { createHash } from "node:crypto";

test("v1 editions are canonical, reproducible, and reject malformed input",()=>{
  const edition=createSeaEdition("5EA5CAFE");
  assert.deepEqual(edition,createSeaEdition("5ea5cafe"));
  assert.equal(edition.seed,"5ea5cafe");
  assert.equal(edition.kind,"authored");
  assert.equal(edition.waves.length,6);
  assert.notDeepEqual(edition,createSeaEdition("27c4b901"));
  for(const seed of ["00000000","ffffffff"])assert.equal(createSeaEdition(seed).seed,seed);
  for(const seed of ["", "123", "123456789", "<script>", "5ea5cafe\n", " 5ea5cafe"]) {
    assert.equal(normaliseSeaSeed(seed),null);
    assert.throws(()=>createSeaEdition(seed),RangeError);
  }
});
test("analytical slopes agree with independent finite differences",()=>{
  const epsilon=1e-5;
  for(const seed of ["5ea5cafe","27c4b901","00000000"]) {
    const edition=createSeaEdition(seed);
    const bound=edition.waves.reduce((sum,w)=>sum+w.amplitude,0);
    for(let i=0;i<40;i++) {
      const x=-19+i*.973,z=11-i*.517,t=i*.271;
      const sample=sampleSea(edition,x,z,t);
      const dx=(sampleSea(edition,x+epsilon,z,t).height-sampleSea(edition,x-epsilon,z,t).height)/(2*epsilon);
      const dz=(sampleSea(edition,x,z+epsilon,t).height-sampleSea(edition,x,z-epsilon,t).height)/(2*epsilon);
      assert.ok(Math.abs(sample.dx-dx)<1e-7);
      assert.ok(Math.abs(sample.dz-dz)<1e-7);
      assert.ok(Math.abs(sample.height)<=bound);
    }
  }
});
test("the engraving is a stable t=0 artifact with no active content",()=>{
  const edition=createSeaEdition();
  const plate=renderSeaPlate(edition);
  assert.equal(plate,renderSeaPlate(createSeaEdition()));
  assert.notEqual(plate,renderSeaPlate(createSeaEdition("27c4b901")));
  assert.ok(plate.includes("NOT LIVE OBSERVATIONS"));
  assert.ok(plate.includes(edition.seed));
  assert.doesNotMatch(plate,/<script|<foreignObject|NaN|Infinity|https?:\/\/(?!www.w3.org)/);
  // This fixed digest is an intentional version-contract alarm, not a visual assertion.
  const digest=createHash("sha256").update(JSON.stringify(edition)).digest("hex");
  assert.equal(digest,"8ff7cd9c669cae591e6ae7c3ddca9c7ffff876420088dd242603b9478752ac64");
});

test("version 2 reads the seed as four settings and round-trips them",()=>{
  const settings={swell:30,heading:200,character:110,variation:7};
  const seed=seedFromSettings(settings);
  assert.equal(seed,"1ec86e07");
  assert.deepEqual(settingsFromSeed(seed),settings);
  assert.equal(seedFromSettings({swell:-5,heading:300,character:127.6,variation:0}),"00ff8000");
  const edition=createSeaEdition(seed,"2");
  assert.equal(edition.version,"2");
  assert.deepEqual(edition.settings,settings);
  assert.deepEqual(edition,createSeaEdition(seed.toUpperCase(),"2"));
  assert.equal(createSeaEdition(seed).version,"1","an omitted version is always version 1");
  assert.equal(parseSeaVersion("2"),"2");
  for(const bad of [null,undefined,"","0","3","v2"])assert.equal(parseSeaVersion(bad),null);
  assert.throws(()=>createSeaEdition("nope","2"),RangeError);
});
test("version 2 settings visibly and independently change the sea",()=>{
  const base={swell:128,heading:128,character:128,variation:5};
  const make=(patch)=>createSeaEdition(seedFromSettings({...base,...patch}),"2");
  const total=edition=>edition.waves.reduce((sum,w)=>sum+w.amplitude,0);
  assert.ok(total(make({swell:255}))>total(make({swell:0}))*2,"swell controls height");
  const mean=edition=>edition.waves.reduce((sum,w)=>sum+w.direction,0)/6;
  assert.ok(mean(make({heading:255}))-mean(make({heading:0}))>1.2,"heading turns the whole sea");
  const wavelength=edition=>edition.waves[0].wavelength;
  assert.ok(wavelength(make({character:0}))>wavelength(make({character:255}))*1.4,"character shortens the waves");
  // The fine arrangement moves only with the variation byte.
  const a=make({variation:1}),b=make({variation:2});
  assert.notDeepEqual(a.waves.map(w=>w.phase),b.waves.map(w=>w.phase));
  const c=make({swell:200}),d=make({swell:100});
  assert.deepEqual(c.waves.map(w=>w.phase),d.waves.map(w=>w.phase),"moving swell must not reshuffle crests");
  // Every reachable corner stays finite and not unreasonably steep.
  for(const swell of [0,255])for(const heading of [0,255])for(const character of [0,255]){
    const edition=make({swell,heading,character});
    const slope=edition.waves.reduce((sum,w)=>sum+w.amplitude*2*Math.PI/w.wavelength,0);
    assert.ok(slope<3,`corner ${swell}/${heading}/${character} steepness ${slope}`);
    for(const w of edition.waves){for(const v of Object.values(w))assert.ok(Number.isFinite(v));assert.ok(w.wavelength>=.45);}
  }
});
test("version 2 plates print the recipe; version 1 plates are unchanged",()=>{
  const edition=createSeaEdition("1e801407","2");
  const plate=renderSeaPlate(edition);
  assert.ok(plate.includes("SWELL 30 · HEADING 128 · CHARACTER 20 · VARIATION 7"));
  assert.ok(plate.includes("MODEL V2"));
  assert.doesNotMatch(plate,/<script|<foreignObject|NaN|Infinity/);
  assert.ok(renderSeaPlate(createSeaEdition()).includes("SEA / SHIP / MATH"));
  const words=describeSea(edition.settings);
  assert.equal(words.sentence,"Glassy · long and rolling · running ahead");
  assert.equal(describeSea({swell:255,heading:255,character:255,variation:0}).sentence,"Storm-high · short and cross-running · running hard right");
});

test("each visit gets a considered, varied version 2 sea",()=>{
  assert.equal(seedFromSettings(HOME_WATER),DEFAULT_SEA_SEED_V2,"home water is the studio's own sea");
  // A small deterministic generator keeps this reproducible.
  let state=12345;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const seeds=new Set(),swells=[];
  for(let i=0;i<400;i++){
    const seed=pickVisitSea(random);
    assert.ok(normaliseSeaSeed(seed),`a valid seed: ${seed}`);
    seeds.add(seed);
    const edition=createSeaEdition(seed,"2");
    swells.push(edition.settings.swell);
    const slope=edition.waves.reduce((sum,w)=>sum+w.amplitude*2*Math.PI/w.wavelength,0);
    assert.ok(slope<3,`${seed} steepness ${slope}`);
  }
  assert.ok(seeds.size>380,"visits must almost never repeat a sea");
  assert.ok(Math.min(...swells)<80&&Math.max(...swells)>200,"calm and rough seas both occur");
  assert.equal(pickVisitSea(()=>0),pickVisitSea(()=>0),"given the same randomness, the same sea");
  assert.match(pickVisitSea(),/^[0-9a-f]{8}$/);
});
