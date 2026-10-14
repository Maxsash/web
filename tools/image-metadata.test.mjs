import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngMetadata(png) {
  const found = [];
  for (let at = 8; at + 8 <= png.length;) {
    const length = png.readUInt32BE(at);
    const type = png.toString("latin1", at + 4, at + 8);
    if (["tEXt", "zTXt", "iTXt", "eXIf", "tIME"].includes(type)) found.push(type);
    at += 12 + length;
  }
  return found;
}

function jpegMetadata(jpeg) {
  const found = [];
  for (let at = 2; at + 4 <= jpeg.length && jpeg[at] === 0xff;) {
    const marker = jpeg[at + 1];
    if (marker === 0xda) break;
    if (marker === 0xe1) found.push("APP1 (Exif or XMP)");
    if (marker === 0xed) found.push("APP13 (IPTC)");
    if (marker === 0xfe) found.push("COM");
    at += 2 + jpeg.readUInt16BE(at + 2);
  }
  return found;
}

function webpMetadata(webp) {
  const found = [];
  for (let at = 12; at + 8 <= webp.length;) {
    const type = webp.toString("latin1", at, at + 4);
    if (type === "EXIF" || type === "XMP ") found.push(type.trim());
    at += 8 + webp.readUInt32LE(at + 4) + (webp.readUInt32LE(at + 4) % 2);
  }
  return found;
}

function icoMetadata(ico) {
  return Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
    const entry = 6 + index * 16;
    const image = ico
      .subarray(ico.readUInt32LE(entry + 12))
      .subarray(0, ico.readUInt32LE(entry + 8));
    return image.subarray(0, 8).equals(PNG_SIGNATURE) ? pngMetadata(image) : [];
  }).flat();
}

const readers = {
  ".png": pngMetadata,
  ".jpg": jpegMetadata,
  ".jpeg": jpegMetadata,
  ".webp": webpMetadata,
  ".ico": icoMetadata,
};

const images = (directory) =>
  readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() in readers)
    .map((entry) => join(entry.parentPath, entry.name));

test("committed images carry no metadata that could identify their author", () => {
  const files = [...images("public"), ...images("app")];
  assert.ok(files.length > 0);
  const tagged = files
    .map((file) => [file, readers[extname(file).toLowerCase()](readFileSync(file))])
    .filter(([, found]) => found.length > 0);
  assert.deepEqual(tagged, [], "strip it, for example with `magick <file> -strip <file>`");
});
