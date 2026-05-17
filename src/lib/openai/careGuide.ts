import { getModel, getOpenAiClient } from '@/lib/openai/client';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function buildCareGuidePrompt(name: string): string {
  return `植物名: ${name}

植物名と添付写真から種類を推定し、その品種・種類に対する標準的な育て方を回答してください。
この回答は登録時の「共通育成ガイド」です。今回の写真に写っている個体の一時的な状態診断や、今日すぐやる個別対応は書かないでください。
以下の Markdown 形式**のみ**で回答してください。見出し構造を必ず守ってください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。いちばん大事なことだけ。推定した種類を1行目に「種類: 〇〇」として含める）

## 詳細
### 水やり
（頻度、土の乾き具合、季節差）

### 日当たり
（光量、直射日光の可否、置き場所）

### 温度と湿度
（適温、寒さ暑さ、乾燥対策）

### 肥料と植え替え
（肥料の時期、植え替え目安）

### 注意点
（弱りやすいサイン、害虫、初心者が間違えやすいこと）`;
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
          'あなたは観葉植物・多肉植物の育成アドバイザーです。日本語で、初心者向けに回答してください。この回答では品種・種類ごとの一般的な育成方法だけを扱い、写真の個体に対する健康診断や緊急対応は書かないでください。必ず「## まとめ」と「## 詳細」を使い、「## 詳細」の中は「###」見出しごとの項目に分けてください。余計な前置きや締めの文章は不要です。',
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

  return (
    response.choices[0]?.message?.content?.trim() ?? '育成方法を生成できませんでした。'
  );
}
