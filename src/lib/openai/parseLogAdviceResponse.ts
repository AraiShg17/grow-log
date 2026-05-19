export type LogAdviceGenerationResult = {
  aiAdvice: string;
  visualSnapshot: string;
};

export function parseLogAdviceResponse(raw: string): LogAdviceGenerationResult {
  const fallbackAdvice = raw.trim() || 'アドバイスを生成できませんでした。';

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const aiAdvice =
      typeof parsed.aiAdvice === 'string'
        ? parsed.aiAdvice.trim()
        : typeof parsed.advice === 'string'
          ? parsed.advice.trim()
          : '';
    const visualSnapshot =
      typeof parsed.visualSnapshot === 'string' ? parsed.visualSnapshot.trim() : '';

    return {
      aiAdvice: aiAdvice || fallbackAdvice,
      visualSnapshot,
    };
  } catch {
    return {
      aiAdvice: fallbackAdvice,
      visualSnapshot: '',
    };
  }
}
