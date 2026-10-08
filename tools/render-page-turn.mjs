/** Write every page-turn variation to tools/.out/page-turn-N.wav so they can be heard in any player.
 * node tools/render-page-turn.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { PAGE_TURNS, synthesizePageTurn } from "../lib/page-turn.ts";

const SAMPLE_RATE = 44100;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, i) => data.writeInt16LE(Math.round(sample * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

mkdirSync("tools/.out", { recursive: true });
PAGE_TURNS.forEach((variant, index) => {
  writeFileSync(
    `tools/.out/page-turn-${index + 1}.wav`,
    wav(synthesizePageTurn(SAMPLE_RATE, variant)),
  );
  console.log(`Wrote tools/.out/page-turn-${index + 1}.wav`);
});
