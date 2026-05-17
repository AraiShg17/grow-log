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
});
