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
          'あなたは植物の健康状態を観察するアドバイザーです。今回の写真に写っている個体の状態を最優先に見て、いま何をすべきかを具体的に回答してください。ユーザーのメモがある場合は、その観察やコメントをまず肯定的に受け止め、基本的には褒める方向の短い反応を入れてからアドバイスを書いてください。登録時の育成方法は背景情報として使い、一般論の繰り返しは避けてください。断定しすぎず、初心者向けに日本語で回答してください。必ず「## まとめ」と「## 詳細」を使い、「## 詳細」の中は「###」見出しごとの項目に分けてください。余計な前置きや締めの文章は不要です。',
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

今回の写真と情報をもとに、この個体に対する観察アドバイスを作成してください。
一般的な育て方の説明ではなく、写真から見える状態・変化・リスク・次に取る行動を優先してください。
次の形式**のみ**で回答してください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。メモがある場合は1項目目でユーザーの観察やコメントを肯定的に受け止める。続けて現在の状態・いま一番やること・次回見るポイントを書く）

## 詳細
### 現在の状態
（メモがある場合は最初にその観察やコメントへの短い肯定的な反応を書く。その後、写真から見える葉・茎・土・全体の状態について、良い点と気になる点を分けて書く）

### 今すぐやること
（今日〜数日以内にこの個体へ行う具体的な対応。不要なら「急いで対応することはありません」と書く）

### 様子を見ること
（急がなくてよい観察ポイント、判断基準）

### 次回チェック
（次に写真を撮るときに見る場所、記録するとよいこと）

### 注意点
（病害虫、根腐れ、乾燥、季節要因などのリスク）`,
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
    response.choices[0]?.message?.content?.trim() ??
    'アドバイスを生成できませんでした。'
  );
}
