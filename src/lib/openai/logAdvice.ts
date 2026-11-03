import { getModel, getOpenAiClient } from '@/lib/openai/client';
import { formatPastLogsForAdvice } from '@/lib/openai/formatPastLogsForAdvice';
import {
  parseLogAdviceResponse,
  type LogAdviceGenerationResult,
} from '@/lib/openai/parseLogAdviceResponse';
import type { PlantLog } from '@/types/plant';
import {
  buildFertilizerProductClarityRules,
  buildHonestHealthAssessmentRules,
  buildRegisteredPlantContextRules,
} from '@/lib/openai/plantPhotoPrompts';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

const NO_REPEAT_CARE_GUIDE_IN_OUTPUT = `【育成ガイドの扱い（重要）】
下文の「育成方法（登録時）」全文は**背景情報**として読んでよい。
ただし aiAdvice には、水やり頻度・基本的な置き場・肥料の時期など**育成ガイドと重なる一般論を繰り返し書かない**こと。ユーザーは詳細画面で育成ガイドを既に読める。
aiAdvice では**今回の写真・メモ・過去記録との変化**にだけ答える。`;

const JSON_OUTPUT_RULES = `返却は次のキーだけを持つ JSON オブジェクト**のみ**（前置き・コードフェンス禁止）。
- "aiAdvice": ユーザー向けアドバイス本文。登録名を正として必ず回答する
- "visualSnapshot": 今回の写真から実際に読み取れる客観的な状態メモ（次回比較用・150〜300字）。葉・茎・土の色・乾き・姿勢・目立つ変化など。アドバイス本文の繰り返しや「〜すべき」は書かない。写真から客観的な状態をほとんど読み取れない場合だけ空文字 ""`;

const LOG_ADVICE_SYSTEM_FIRST = `あなたは植物の健康状態を観察するアドバイザーです。
登録名はユーザーが確認した正しい植物名です。写真で種類を再判定せず、登録名を前提に必ず回答してください。
写真から状態が十分に見えない場合も回答を中止せず、登録名・メモ・育成ガイドに基づく助言を行ったうえで、確認したい部位と撮り方を具体的に依頼してください。
${NO_REPEAT_CARE_GUIDE_IN_OUTPUT}
肥料・液肥などを勧めるときは、具体商品名と購入URLを示し「どれを買うか」がわかるようにしてください。
初回の観察記録では aiAdvice に必ず「## まとめ」と「## 詳細」を使い、「## 詳細」の中は「###」見出しごとに分けてください。
${JSON_OUTPUT_RULES}`;

const LOG_ADVICE_SYSTEM_FOLLOWUP = `あなたは植物の健康状態を観察するアドバイザーです。
登録名はユーザーが確認した正しい植物名です。写真で種類を再判定せず、登録名を前提に必ず回答してください。
写真から状態が十分に見えない場合も回答を中止せず、登録名・メモ・育成ガイド・過去記録に基づく助言を行ったうえで、確認したい部位と撮り方を具体的に依頼してください。
${NO_REPEAT_CARE_GUIDE_IN_OUTPUT}
2回目以降の観察記録では、過去の「当時の写真から読み取った状態」と今回の写真を比較し、**いまどうなっているか**を中心に答えてください。
aiAdvice は見出し・箇条書き・項目名ラベルは使わず、自然な文章（段落3〜5、合計200〜450字程度）で書いてください。
${JSON_OUTPUT_RULES}`;

function buildFirstLogAdviceSection(): string {
  return `---

aiAdvice は次の形式**のみ**で書いてください。
写真から見える状態・リスク・次に取る行動を優先してください。写真で状態が十分に見えなくても、登録名とメモに基づいて答えを出してください。

## まとめ
（箇条書き3〜5項目。メモがある場合は**1項目目だけ**メモへの短い共感）

## 詳細
### 現在の状態
### 今すぐやること
### 様子を見ること
### 次回チェック
### 注意点`;
}

function buildFollowUpAdviceSection(): string {
  return `---

aiAdvice は**プレーンテキストの文章のみ**で、次の流れで書いてください（見出し・箇条書き・「###」は禁止）。

1. **いまどうなっているか** … 今回の写真（とメモがあれば一言の共感）から見える状態。過去の状態メモと比べて変化があれば自然に触れる。
2. **それは普通か** … その状態がこの植物として問題ないか、季節・成長段階として自然か。問題なければ「このままでよい」とはっきり書く。
3. **気になる点と改善** … 気になる所があるときだけ、何が気になるかと、**具体的にどうすれば改善できるか**を書く。問題がなければ「急いで直すことはない」と書く。
4. **追加写真** … 状態判断に必要な部位が見えない場合だけ、最後の段落で必要な写真と撮り方を具体的に依頼する。

育成ガイドの一般論の繰り返しはしない。肥料を勧める場合だけ【肥料・液肥など購入品を書くときのルール】に従う。`;
}

function buildUserPromptText(input: {
  plantName: string;
  careGuide: string;
  memo: string;
  pastLogs: PlantLog[];
  isFollowUp: boolean;
  photoCount: number;
}): string {
  const registeredNameRules = buildRegisteredPlantContextRules(
    '登録名',
    input.plantName,
  );
  const honestRules = buildHonestHealthAssessmentRules();
  const fertilizerRules = buildFertilizerProductClarityRules();

  const pastSection = input.isFollowUp
    ? `## 過去の観察記録（最大10件・古い順。写真は送っていない。状態メモとアドバイスを比較の材料にする）
${formatPastLogsForAdvice(input.pastLogs)}`
    : `## 過去の観察記録
${formatPastLogsForAdvice(input.pastLogs)}`;
  const legacyAdviceRule = input.pastLogs.length
    ? '過去の記録に旧仕様の「登録名と写真が一致しない」「写真から判断できない」「解析不可」というAI回答が含まれていても、その判定は採用しない。今回の登録名を正として、観察できる状態と栽培情報から回答する。'
    : '';

  const photoNote =
    input.photoCount > 1
      ? `## 今回の写真\n${input.photoCount}枚を添付しています。すべてを見て総合的に判断してください。`
      : '';

  const sections = [
    `植物名（登録名・テキスト）: ${input.plantName}`,
    photoNote,
    registeredNameRules,
    honestRules,
    fertilizerRules,
    `## 育成方法（登録時・全文。aiAdvice にこの一般論を繰り返すな）\n${input.careGuide}`,
    `## 今回のメモ\n${input.memo || '（なし）'}`,
    pastSection,
    legacyAdviceRule,
    input.isFollowUp ? buildFollowUpAdviceSection() : buildFirstLogAdviceSection(),
  ];

  return sections.filter((section) => section.length > 0).join('\n\n');
}

export async function generateLogAdvice(input: {
  plantName: string;
  careGuide: string;
  memo: string;
  photos: { buffer: Buffer; mimeType: string }[];
  pastLogs: PlantLog[];
}): Promise<LogAdviceGenerationResult> {
  const isFollowUp = input.pastLogs.length > 0;
  const userText = buildUserPromptText({
    plantName: input.plantName,
    careGuide: input.careGuide,
    memo: input.memo,
    pastLogs: input.pastLogs,
    isFollowUp,
    photoCount: input.photos.length,
  });

  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: isFollowUp ? LOG_ADVICE_SYSTEM_FOLLOWUP : LOG_ADVICE_SYSTEM_FIRST,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          ...input.photos.map((photo) => ({
            type: 'image_url' as const,
            image_url: { url: bufferToDataUrl(photo.buffer, photo.mimeType) },
          })),
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';
  if (!raw) {
    return {
      aiAdvice: 'アドバイスを生成できませんでした。',
      visualSnapshot: '',
    };
  }

  return parseLogAdviceResponse(raw);
}
