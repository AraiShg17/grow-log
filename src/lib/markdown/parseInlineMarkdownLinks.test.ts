import { describe, expect, it } from 'vitest';
import { parseInlineMarkdownLinks } from './parseInlineMarkdownLinks';

describe('parseInlineMarkdownLinks', () => {
  it('parses a markdown link', () => {
    const parts = parseInlineMarkdownLinks(
      '例: [ハイポネックス 原液](https://www.amazon.co.jp/dp/example)',
    );
    expect(parts).toEqual([
      { type: 'text', value: '例: ' },
      {
        type: 'link',
        label: 'ハイポネックス 原液',
        href: 'https://www.amazon.co.jp/dp/example',
      },
    ]);
  });

  it('returns plain text when no links', () => {
    expect(parseInlineMarkdownLinks('肥料は春から')).toEqual([
      { type: 'text', value: '肥料は春から' },
    ]);
  });
});
