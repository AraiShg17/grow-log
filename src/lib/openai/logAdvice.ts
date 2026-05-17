import { getModel, getOpenAiClient } from '@/lib/openai/client';
import type { PlantLog } from '@/types/plant';
import { parseCompactSections } from '@/lib/markdown/parseCompactSections';
import {
  buildHonestHealthAssessmentRules,
  buildLogAnalysisUnavailableMarkdown,
  buildPhotoPlantVerificationRules,
} from '@/lib/openai/plantPhotoPrompts';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function formatPastLogs(logs: PlantLog[]): string {
  if (logs.length === 0) {
    return '（過去ログなし）';
  }

  return logs
    .map((log, index) => {
      const advice = log.aiAdvice?.trim() ?? '';
      const { summary } = parseCompactSections(advice);
      const gist = advice
        ? summary.slice(0, 120)
        : (log.memo || '（メモなし）').slice(0, 120);
      return `### ログ ${index + 1} (${log.observedAt.toISOString().slice(0, 10)})\nメモ: ${log.memo || 'なし'}\n要点: ${gist}`;
    })
    .join('\n\n');
}

const LOG_ADVICE_SYSTEM = `あなたは植物の健康状態を観察するアドバイザーです。
作業順序は必ず (1) 写真と登録名の照合（内部） → (2) 照合成功時のみ写真ベースの観察アドバイスです。
照合に失敗したときだけ「判断できない／一致しない」をユーザーに伝えてください。照合に成功したときは、一致したこと・種類が合うことの報告は書かないでください。
照合成功時のみ、登録時の育成方法を背景情報として使い、一般論の繰り返しは避けてください。
必ず「## まとめ」と「## 詳細」を使い、「## 詳細」の中は「###」見出しごとの項目に分けてください。余計な前置きや締めの文章は不要です。初心者向けの日本語で書いてください。`;

export async function generateLogAdvice(input: {
  plantName: string;
  careGuide: string;
  memo: string;
  photoBuffer: Buffer;
  mimeType: string;
  pastLogs: PlantLog[];
}): Promise<string> {
  const imageUrl = bufferToDataUrl(input.photoBuffer, input.mimeType);
  const verification = buildPhotoPlantVerificationRules('登録名', input.plantName);
  const honestRules = buildHonestHealthAssessmentRules();
  const unavailableFormat = buildLogAnalysisUnavailableMarkdown(input.plantName);

  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    messages: [
      { role: 'system', content: LOG_ADVICE_SYSTEM },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `植物名（登録名・テキスト）: ${input.plantName}

${verification}

${honestRules}

## 育成方法（登録時・参考・照合成功時のみ参照）
${input.careGuide}

## 今回のメモ
${input.memo || '（なし）'}

## 過去ログ
${formatPastLogs(input.pastLogs)}

---

照合に失敗した場合: 次の解析不可フォーマット**のみ**を返してください（要点は維持し、表現は調整可）。

${unavailableFormat}

---

照合に成功した場合のみ: 次の通常形式**のみ**で回答してください。
写真から見える状態・変化・リスク・次に取る行動を優先し、一般的な育て方の説明は避けてください。
照合が通ったこと・登録名と写真が一致すること・ラベルが合うことなどの**報告は書かない**こと。

## まとめ
（箇条書き3〜5項目。メモがある場合は**1項目目だけ**メモへの短い共感。2項目目以降は写真に基づく状態・いま一番やること・次回見るポイント。照合の報告は含めない）

## 詳細
### 現在の状態
（照合・種類一致の宣言から始めない。メモへの共感は最初に1〜2文まで。その後は葉・茎・土など写真に見える状態だけを、良い点と気になる点に分けて記述。確信が低い所は「推定」「可能性」を使う）

### 今すぐやること
（写真から読み取れる状態に基づく具体的対応。不要なら「急いで対応することはありません」と明記）

### 様子を見ること
（観察ポイントと判断基準。不確かな点は推定として書く）

### 次回チェック
（次に撮る場所・記録するとよいこと）

### 注意点
（写真から想定できるリスク。見えない脅威は断定せず、確認方法を書く）`,
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
