export interface CompactSections {
  summary: string;
  detail: string | null;
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
      .slice(
        summaryMatch.index + summaryMatch[0].length,
        detailMatch.index,
      )
      .trim();
    const detail = sliceAfterHeading(content, detailMatch.index).trim();
    return { summary, detail: detail || null };
  }

  if (summaryMatch) {
    const summary = sliceAfterHeading(content, summaryMatch.index).trim();
    return { summary, detail: null };
  }

  const blocks = content.split(/\n{2,}/).filter((block) => block.trim());
  if (blocks.length <= 2) {
    return { summary: content.trim(), detail: null };
  }

  return {
    summary: blocks.slice(0, 2).join('\n\n').trim(),
    detail: blocks.slice(2).join('\n\n').trim(),
  };
}
