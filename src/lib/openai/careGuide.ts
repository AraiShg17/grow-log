import { getModel, getOpenAiClient } from '@/lib/openai/client';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function buildCareGuidePrompt(name: string): string {
  return `植物名: ${name}

植物名と添付写真から種類を推定し、以下の Markdown 形式**のみ**で回答してください。見出しは必ずこの2つにしてください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。いちばん大事なことだけ。推定した種類を1行目に「種類: 〇〇」として含める）

## 詳細
（水やり・日当たり・置き場所・肥料・注意点・季節ごとの管理など。ここだけ長めに書いてよい）`;
}

export async function generateCareGuide(input: {
  name: string;
  photoBuffer: Buffer;
  mimeType: string;
}): Promise<string> {
  const imageUrl = bufferToDataUrl(input.photoBuffer, input.mimeType);
  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: 'system',
        content:
          'あなたは観葉植物・多肉植物の育成アドバイザーです。日本語で、初心者向けに回答してください。必ず「## まとめ」と「## 詳細」の2セクション構成にしてください。まとめは短く、詳細は必要な人向けに充実させてください。',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildCareGuidePrompt(input.name),
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? '育成方法を生成できませんでした。';
}
