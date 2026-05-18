import { getModel, getOpenAiClient } from '@/lib/openai/client';
import { buildFertilizerProductClarityRules } from '@/lib/openai/plantPhotoPrompts';
import { buildPlantChatContext } from '@/lib/openai/buildPlantChatContext';
import type { Plant, PlantChatMessage, PlantLog } from '@/types/plant';

const MAX_HISTORY_MESSAGES = 24;

function buildSystemPrompt(plant: Plant, logs: readonly PlantLog[]): string {
  const context = buildPlantChatContext(plant, logs);

  return `あなたは観葉植物・多肉植物の栽培アドバイザーです。
ユーザーはアプリ「植物記録」で、登録した植物について質問しています。
以下の【植物情報】と会話履歴を踏まえ、日本語で親切かつ具体的に答えてください。

- 登録時の育成ガイドや観察記録にないことは推測と分けて書く
- 健康状態の断定は、記録・写真の記述がある範囲に留める
- 初心者にも分かる表現を使う

${buildFertilizerProductClarityRules()}

【植物情報】
${context}`;
}

export async function generatePlantChatReply(input: {
  plant: Plant;
  logs: readonly PlantLog[];
  history: readonly PlantChatMessage[];
  userMessage: string;
}): Promise<string> {
  const history = input.history.slice(-MAX_HISTORY_MESSAGES);
  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> =
    [
      { role: 'system', content: buildSystemPrompt(input.plant, input.logs) },
      ...history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: 'user', content: input.userMessage.trim() },
    ];

  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    messages: apiMessages,
  });

  const reply = response.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('チャットの応答を生成できませんでした。');
  }

  return reply;
}
