import { describe, expect, it } from 'vitest';
import { parseLogAdviceResponse } from './parseLogAdviceResponse';

describe('parseLogAdviceResponse', () => {
  it('parses JSON with advice and visualSnapshot', () => {
    const result = parseLogAdviceResponse(
      JSON.stringify({
        aiAdvice: '葉は元気です。',
        visualSnapshot: '葉は濃い緑で5枚。土は表面がやや乾いている。',
      }),
    );
    expect(result.aiAdvice).toBe('葉は元気です。');
    expect(result.visualSnapshot).toContain('濃い緑');
  });

  it('falls back to raw text when not JSON', () => {
    const result = parseLogAdviceResponse('プレーンテキスト');
    expect(result.aiAdvice).toBe('プレーンテキスト');
    expect(result.visualSnapshot).toBe('');
  });
});
