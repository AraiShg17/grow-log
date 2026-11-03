import { describe, expect, it } from 'vitest';
import { buildRegisteredPlantContextRules } from './plantPhotoPrompts';

describe('buildRegisteredPlantContextRules', () => {
  it('treats the registered name as authoritative and continues with unclear photos', () => {
    const prompt = buildRegisteredPlantContextRules('登録名', 'リラヘイズ');

    expect(prompt).toContain('リラヘイズ');
    expect(prompt).toContain('正しい植物名');
    expect(prompt).toContain('登録名の正誤を再判定しない');
    expect(prompt).toContain('回答を止めず');
    expect(prompt).toContain('株全体');
    expect(prompt).toContain('気になる葉の表裏');
    expect(prompt).toContain('茎元と土');
  });
});
