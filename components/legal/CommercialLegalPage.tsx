import Link from "next/link";
import type { ReactNode } from "react";
import {
  COMMERCIAL_LEGAL_DOCUMENTS,
  readCommercialLegalMarkdown,
  type CommercialLegalDocumentSlug,
} from "@/lib/blundr/legal/commercialLegalContent";

const legalLinks: Array<[CommercialLegalDocumentSlug, string]> = [
  ["pricing", "Pricing"],
  ["terms", "Terms"],
  ["privacy", "Privacy"],
  ["subscription-terms", "Subscription Terms"],
  ["cookies", "Cookies"],
  ["legal", "Legal Notice"],
];

function inlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      nodes.push(
        <a key={`${match.index}-link`} href={link?.[2] ?? "#"}>
          {link?.[1] ?? token}
        </a>,
      );
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function slugFromHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      const text = trimmed.slice(2);
      nodes.push(
        <h1 key={index} id={slugFromHeading(text)}>
          {inlineMarkdown(text)}
        </h1>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3);
      nodes.push(
        <h2 key={index} id={slugFromHeading(text)}>
          {inlineMarkdown(text)}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4);
      nodes.push(
        <h3 key={index} id={slugFromHeading(text)}>
          {inlineMarkdown(text)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const header = tableCells(trimmed);
      const rows: string[][] = [];
      index += 1;
      if (isTableSeparator(lines[index]?.trim() ?? "")) index += 1;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      nodes.push(
        <div className="overflow-x-auto" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {header.map((cell) => (
                  <th key={cell}>{inlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>
                      {inlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`}>
          {items.map((item) => (
            <li key={item}>{inlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("|") &&
      !lines[index].trim().startsWith("- ")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    nodes.push(<p key={`p-${index}`}>{inlineMarkdown(paragraph.join(" "))}</p>);
  }

  return nodes;
}

export function CommercialLegalPage({
  document,
}: {
  document: CommercialLegalDocumentSlug;
}) {
  const details = COMMERCIAL_LEGAL_DOCUMENTS[document];
  const markdown = readCommercialLegalMarkdown(document);
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <article className="legal-markdown mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10">
        <nav
          className="mb-8 flex flex-wrap gap-3 text-sm font-bold text-green-800"
          aria-label="Legal pages"
        >
          <Link href="/">Blundr</Link>
          {legalLinks.map(([slug, label]) => (
            <Link key={slug} href={`/${slug}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div>{renderMarkdown(markdown)}</div>
        <footer className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-600">
          Source: {details.sourceFile}
        </footer>
      </article>
    </main>
  );
}
