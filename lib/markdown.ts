export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: 2 | 3; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "code"; language: string; text: string }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "table"; head: Inline[][]; rows: Inline[][][] }
  | { type: "quote"; children: Inline[] }
  | { type: "rule" };

const INLINE =
  /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|<(https?:\/\/[^>\s]+)>|\*\*(.+?)\*\*|(?<![\w])_(.+?)_(?![\w])/;
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/)|#)/;

export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  let rest = source;
  for (let match = INLINE.exec(rest); match; match = INLINE.exec(rest)) {
    if (match.index) out.push({ type: "text", text: rest.slice(0, match.index) });
    const [, code, label, href, autolink, strong, em] = match;
    if (code !== undefined) out.push({ type: "code", text: code });
    else if (label !== undefined && SAFE_HREF.test(href))
      out.push({ type: "link", href, children: parseInline(label) });
    else if (label !== undefined) out.push(...parseInline(label));
    else if (autolink !== undefined)
      out.push({ type: "link", href: autolink, children: [{ type: "text", text: autolink }] });
    else if (strong !== undefined) out.push({ type: "strong", children: parseInline(strong) });
    else out.push({ type: "em", children: parseInline(em) });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) out.push({ type: "text", text: rest });
  return out;
}

const FENCE = /^```(\w*)\s*$/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const LIST_ITEM = /^(?:(\d+)\.|[-*])\s+(.*)$/;
const TABLE_ROW = /^\|.*\|\s*$/;
const TABLE_RULE = /^\|(?:\s*:?-+:?\s*\|)+\s*$/;
const RULE = /^(?:---+|\*\*\*+)\s*$/;

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => parseInline(cell.trim()));

const startsBlock = (line: string, next: string | undefined) =>
  FENCE.test(line) ||
  HEADING.test(line) ||
  QUOTE.test(line) ||
  LIST_ITEM.test(line) ||
  RULE.test(line) ||
  (TABLE_ROW.test(line) && next !== undefined && TABLE_RULE.test(next));

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = FENCE.exec(line);
    const heading = HEADING.exec(line);
    const item = LIST_ITEM.exec(line);
    const quote = QUOTE.exec(line);
    if (!line.trim()) {
      i++;
    } else if (fence) {
      const code: string[] = [];
      for (i++; i < lines.length && !FENCE.test(lines[i]); i++) code.push(lines[i]);
      i++;
      blocks.push({ type: "code", language: fence[1], text: code.join("\n") });
    } else if (heading) {
      const level = heading[1].length === 3 ? 3 : 2;
      blocks.push({ type: "heading", level, children: parseInline(heading[2]) });
      i++;
    } else if (quote) {
      const text: string[] = [];
      for (; i < lines.length && QUOTE.test(lines[i]); i++) text.push(QUOTE.exec(lines[i])![1]);
      blocks.push({ type: "quote", children: parseInline(text.join(" ").trim()) });
    } else if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i++;
    } else if (TABLE_ROW.test(line) && TABLE_RULE.test(lines[i + 1] ?? "")) {
      const head = cells(line);
      const rows: Inline[][][] = [];
      for (i += 2; i < lines.length && TABLE_ROW.test(lines[i]); i++) rows.push(cells(lines[i]));
      blocks.push({ type: "table", head, rows });
    } else if (item) {
      const ordered = item[1] !== undefined;
      const items: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const next = LIST_ITEM.exec(lines[i]);
        if (next) items.push(next[2]);
        else if (/^\s+\S/.test(lines[i])) items[items.length - 1] += ` ${lines[i].trim()}`;
        else break;
        i++;
      }
      blocks.push({ type: "list", ordered, items: items.map(parseInline) });
    } else {
      const text: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !(text.length && startsBlock(lines[i], lines[i + 1]))
      ) {
        text.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: "paragraph", children: parseInline(text.join(" ")) });
    }
  }
  return blocks;
}

export function parseFrontmatter(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) return { meta: {} as Record<string, string>, body: source };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { meta, body: source.replace(/\r\n/g, "\n").slice(match[0].length) };
}
