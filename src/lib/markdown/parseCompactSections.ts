export interface CompactSections {
  summary: string;
  detail: string | null;
  detailSections: CompactDetailSection[];
}

export interface CompactDetailSection {
  title: string;
  content: string;
}

const SUMMARY_HEADING = /^##\s*まとめ\s*$/im;
const DETAIL_HEADING = /^##\s*詳細\s*$/im;

function sliceAfterHeading(content: string, headingIndex: number): string {
  const lineEnd = content.indexOf('\n', headingIndex);
  return lineEnd === -1 ? '' : content.slice(lineEnd + 1);
}

export function parseCompactSections(content: string): CompactSections {
  const summaryMatch = SUMMARY_HEADING.exec(content);
  const detailMatch = DETAIL_HEADING.exec(content);

  if (summaryMatch && detailMatch && detailMatch.index > summaryMatch.index) {
    const summary = content
      .slice(summaryMatch.index + summaryMatch[0].length, detailMatch.index)
      .trim();
    const detail = sliceAfterHeading(content, detailMatch.index).trim();
    return {
      summary,
      detail: detail || null,
      detailSections: parseDetailSections(detail),
    };
  }

  if (summaryMatch) {
    const summary = sliceAfterHeading(content, summaryMatch.index).trim();
    return { summary, detail: null, detailSections: [] };
  }

  return { summary: content.trim(), detail: null, detailSections: [] };
}

function parseDetailSections(detail: string): CompactDetailSection[] {
  const headingMatches = [...detail.matchAll(/^###\s+(.+)$/gm)];
  if (headingMatches.length === 0) {
    return [];
  }

  return headingMatches
    .map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const next = headingMatches[index + 1];
      const end = next?.index ?? detail.length;

      return {
        title: match[1].trim(),
        content: detail.slice(start, end).trim(),
      };
    })
    .filter((section) => section.title && section.content);
}
