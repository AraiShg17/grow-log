export type InlineMarkdownPart =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string };

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** `[表示名](https://...)` 形式の Markdown リンクを分割する */
export function parseInlineMarkdownLinks(text: string): InlineMarkdownPart[] {
  const parts: InlineMarkdownPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'link', label: match[1], href: match[2] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}
