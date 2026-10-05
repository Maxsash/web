import test from "node:test";
import assert from "node:assert/strict";
import { createSeaEdition, normaliseSeaSeed, sampleSea, renderSeaPlate } from "../lib/sea-edition.ts";
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
