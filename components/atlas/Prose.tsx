import type { ReactNode } from "react";
import type { Block, Inline } from "@/lib/markdown";
import styles from "./Atlas.module.css";

export function InlineText({ nodes }: { nodes: Inline[] }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return node.text;
      case "code":
        return <code key={index}>{node.text}</code>;
      case "strong":
        return (
          <strong key={index}>
            <InlineText nodes={node.children} />
          </strong>
        );
      case "em":
        return (
          <em key={index}>
            <InlineText nodes={node.children} />
          </em>
        );
      case "link": {
        const external = node.href.startsWith("http");
        return (
          <a
            key={index}
            href={node.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <InlineText nodes={node.children} />
            {external ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
          </a>
        );
      }
    }
  });
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag key={index}>
          <InlineText nodes={block.children} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={index}>
          <InlineText nodes={block.children} />
        </p>
      );
    case "quote":
      return (
        <blockquote key={index}>
          <InlineText nodes={block.children} />
        </blockquote>
      );
    case "code":
      return (
        <pre key={index} tabIndex={0} aria-label={`${block.language || "Code"} sample`}>
          <code>{block.text}</code>
        </pre>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineText nodes={item} />
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <div
          key={index}
          className={styles.proseTable}
          tabIndex={0}
          role="region"
          aria-label="Table"
        >
          <table>
            <thead>
              <tr>
                {block.head.map((cell, cellIndex) => (
                  <th key={cellIndex} scope="col">
                    <InlineText nodes={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <InlineText nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "rule":
      return <hr key={index} />;
  }
}

export default function Prose({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map(renderBlock)}</>;
}
