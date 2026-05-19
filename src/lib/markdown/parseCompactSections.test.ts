import { describe, expect, it } from 'vitest';
import { parseCompactSections } from './parseCompactSections';

describe('parseCompactSections', () => {
  it('splits まとめ and 詳細 sections', () => {
    const content = `## まとめ
- 水は控えめ

## 詳細
### 水やり
週1回`;
    const result = parseCompactSections(content);
    expect(result.summary).toContain('水は控えめ');
    expect(result.detail).toContain('週1回');
    expect(result.detailSections).toEqual([
      {
        title: '水やり',
        content: '週1回',
      },
    ]);
  });

  it('returns full content when no sections', () => {
    const content = '短いテキストだけ';
    const result = parseCompactSections(content);
    expect(result.summary).toBe(content);
    expect(result.detail).toBeNull();
    expect(result.detailSections).toEqual([]);
  });

  it('does not split plain multi-paragraph text', () => {
    const content = `いまの葉は緑で元気です。

前回より土の乾きが早いので、水やりの間隔を少し空けて様子を見ましょう。

急いで直すことはありません。`;
    const result = parseCompactSections(content);
    expect(result.summary).toBe(content);
    expect(result.detail).toBeNull();
    expect(result.detailSections).toEqual([]);
  });
});
