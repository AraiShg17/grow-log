import { getModel, getOpenAiClient } from '@/lib/openai/client';
import {
  buildFertilizerProductClarityRules,
  buildHonestHealthAssessmentRules,
  buildRegisteredPlantContextRules,
} from '@/lib/openai/plantPhotoPrompts';
import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function buildCareGuideMarkdownRules(name: string): string {
  const registeredNameRules = buildRegisteredPlantContextRules(
    '入力された植物名',
    name,
  );
  const honestRules = buildHonestHealthAssessmentRules({ includeMemoEmpathy: false });

  return `ユーザーが入力した植物名: 「${name}」

${registeredNameRules}

${honestRules}

${buildFertilizerProductClarityRules()}
- 植物の種類は入力名「${name}」を正とする。写真による種類の再判定はしない。
- 写真は葉の形・質感・全体の様子など、入力名に補足できる特徴を見るために使う（部屋の明るさだけで日照タグを決めない）。
- この回答は登録時の「共通育成ガイド」です。個体の健康診断や今日すぐやる対応は書かない。
- 入力名が品種名・流通名で詳細な系統が不明な場合も、入力名を維持したまま、分かる範囲の一般的な育て方を書く。

careGuideMarkdown は次の Markdown 構造**のみ**にしてください。見出し構造を必ず守ってください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。1行目は必ず「種類: ${name}」）

## 詳細
### 水やり
（頻度、土の乾き具合、季節差）

### 日当たり
（光量、直射日光の可否、置き場所）

### 温度と湿度
（適温、寒さ暑さ、乾燥対策）

### 肥料と植え替え
（肥料の時期・量・植え替え目安。肥料を書くときは【肥料・液肥など購入品を書くときのルール】に従い、具体商品名と購入URLを1〜2点含める）

### 注意点
（弱りやすいサイン、害虫、初心者が間違えやすいこと）`;
}

function buildSunlightTagJudgementRules(name: string): string {
  return `【日照タグ sunlightTag の意味（重要）】
sunlightTag は**「この植物を育てるうえで、ユーザーが選ぶべき置き場のカテゴリ」**を表します。
**撮影時点の部屋の明るさや、写真に写っている窓・影から「いまの環境」をタグ付けするものではありません。** 現状の環境タグではないことを必ず守ってください。

【決め方】
1. 登録名「${name}」を正しい植物名として扱ってください。
2. 登録名についての一般的な園芸知識を主な根拠とし、写真は葉形・茎・成長姿・質感などの補足にだけ使ってください。背景の明るさだけでタグを決めないでください。
3. 「${name}」が健やかに育つのに適した光環境（日向寄り／半日向／日陰寄り）を選び、次のいずれか 1 つだけ sunlightTag に出力してください:
   - "full_sun" … 日向で育てるのが適する（強い光・直射を比較的多く浴びる置き場向き）
   - "partial_sun" … 半日向で育てるのが適する（明るい散射中心、短時間の直射も可など）
   - "shade" … 日陰寄り・耐陰性が高く、直射を避け弱めの光で育てるのが適する

写真が明るい場所で撮影されていても、その植物が日陰性なら "shade" にするなど、**常に「どこに置くべきか」の推奨**に基づいて選んでください。迷ったら "partial_sun"。`;
}

const jsonShapeInstruction = `
次のキーだけを持つ JSON オブジェクト**のみ**を返してください（前置き・コードフェンス・説明文は禁止）。

- "careGuideMarkdown": 上記ルールに従った育成ガイド全文（Markdown 文字列）
- "sunlightTag": 上記【日照タグ】のとおり、この植物を**どの明るさの置き場で育てるべきか**の推奨カテゴリ。次のいずれかの文字列だけ（撮影環境の現状ではない）:
  - "full_sun" … 日向
  - "partial_sun" … 半日向
  - "shade" … 日陰

登録名から適切なカテゴリを絞れない場合は "partial_sun" を選んでください。`;

export interface PlantRegistrationBundle {
  careGuide: string;
  sunlightTag: SunlightTagId;
}

function parseRegistrationBundle(raw: string): PlantRegistrationBundle {
  const fallbackCare =
    '育成方法を生成できませんでした。植物名と一般的な育て方を参考書籍や専門サイトで確認してください。';
  const fallback: PlantRegistrationBundle = {
    careGuide: fallbackCare,
    sunlightTag: 'partial_sun',
  };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }

  const o = parsed as Record<string, unknown>;
  const mdCandidate =
    typeof o.careGuideMarkdown === 'string'
      ? o.careGuideMarkdown.trim()
      : typeof o.care_guide_markdown === 'string'
        ? o.care_guide_markdown.trim()
        : '';

  const tagRaw = typeof o.sunlightTag === 'string' ? o.sunlightTag.trim() : '';
  const sunlightTag: SunlightTagId = isSunlightTagId(tagRaw) ? tagRaw : 'partial_sun';

  return {
    careGuide: mdCandidate || fallbackCare,
    sunlightTag,
  };
}

/** 登録時: 育成ガイド Markdown と、「置くべき明るさ」の推奨日照タグをまとめて生成 */
export async function generatePlantRegistrationBundle(input: {
  name: string;
  photoBuffer: Buffer;
  mimeType: string;
}): Promise<PlantRegistrationBundle> {
  const imageUrl = bufferToDataUrl(input.photoBuffer, input.mimeType);
  const response = await getOpenAiClient().chat.completions.create({
    model: getModel(),
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'あなたは観葉植物・多肉植物の育成アドバイザーです。ユーザーが入力した植物名を正しい種類として必ず採用し、写真で登録名の正誤を再判定しないでください。写真が不鮮明でも、登録名を前提に育成ガイドを作成し、必要ならより分かりやすい写真の撮り方を案内してください。個体の健康診断は書かないでください。必ず「## まとめ」と「## 詳細」を使い、JSON オブジェクトだけを返してください。',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${buildCareGuideMarkdownRules(input.name)}

${buildSunlightTagJudgementRules(input.name)}

${jsonShapeInstruction}`,
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';
  if (!raw) {
    return parseRegistrationBundle('{}');
  }

  return parseRegistrationBundle(raw);
}
