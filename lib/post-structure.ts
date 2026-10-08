import type { Block, Inline } from "./markdown.ts";

export type PostSection = { title: Inline[]; marginNote: Inline[] | null; blocks: Block[] };

export type PostStructure = {
  opening: Block | null;
  intro: Block[];
  sections: PostSection[];
  editorNotes: Block[];
};

const EDITOR_NOTES = /^notes for the editor/i;

const plain = (nodes: Inline[]): string =>
  nodes
    .map((node) =>
      node.type === "text" || node.type === "code" ? node.text : plain(node.children),
    )
    .join("");

export function structurePost(blocks: Block[]): PostStructure {
  const sections: PostSection[] = [];
  const editorNotes: Block[] = [];
  const lead: Block[] = [];
  let current: PostSection | null = null;
  let inNotes = false;
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      inNotes = EDITOR_NOTES.test(plain(block.children));
      if (!inNotes)
        sections.push((current = { title: block.children, marginNote: null, blocks: [] }));
    } else if (inNotes) {
      editorNotes.push(block);
    } else if (current) {
      if (block.type === "quote" && !current.blocks.length && !current.marginNote)
        current.marginNote = block.children;
      else current.blocks.push(block);
    } else {
      lead.push(block);
    }
  }
  const opening = lead.find((block) => block.type === "paragraph") ?? null;
  const intro = lead.filter((block) => block !== opening);
  while (sections.at(-1)?.blocks.at(-1)?.type === "rule") sections.at(-1)!.blocks.pop();
  return { opening, intro, sections, editorNotes: editorNotes.filter((b) => b.type !== "rule") };
}
