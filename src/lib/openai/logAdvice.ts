import { getModel, getOpenAiClient } from '@/lib/openai/client';
import type { PlantLog } from '@/types/plant';
import { parseCompactSections } from '@/lib/markdown/parseCompactSections';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function formatPastLogs(logs: PlantLog[]): string {
  if (logs.length === 0) {
    return '（過去ログなし）';
  }

  return logs
    .map((log, index) => {
      const { summary } = parseCompactSections(log.aiAdvice);
      return `### ログ ${index + 1} (${log.observedAt.toISOString().slice(0, 10)})\nメモ: ${log.memo || 'なし'}\n要点: ${summary.slice(0, 120)}`;
    })
    .join('\n\n');
}

export async function generateLogAdvice(input: {
  plantName: string;
  careGuide: string;
  memo: string;
  photoBuffer: Buffer;
  mimeType: string;
  pastLogs: PlantLog[];
}): Promise<string> {
  const imageUrl = bufferToDataUrl(input.photoBuffer, input.mimeType);
  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content:
          'あなたは植物の健康状態を観察するアドバイザーです。断定しすぎず、初心者向けに日本語で回答してください。必ず「## まとめ」と「## 詳細」の2セクション構成にしてください。まとめは短く、詳細は必要な人向けに書いてください。',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `植物名: ${input.plantName}

## 育成方法（登録時・参考）
${input.careGuide}

## 今回のメモ
${input.memo || '（なし）'}

## 過去ログ
${formatPastLogs(input.pastLogs)}

今回の写真と情報をもとに、次の形式**のみ**で観察アドバイスを作成してください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。現在の状態・いま一番やること・次回見るポイントだけ）

## 詳細
（気になる点、やること、様子見でよいこと、季節の注意など。ここだけ長めに）`,
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? 'アドバイスを生成できませんでした。';
}
