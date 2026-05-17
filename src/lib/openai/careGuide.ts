import { getModel, getOpenAiClient } from '@/lib/openai/client';
import {
  buildHonestHealthAssessmentRules,
  buildPhotoPlantVerificationRules,
  buildRegistrationMismatchMarkdown,
} from '@/lib/openai/plantPhotoPrompts';
import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function buildCareGuideMarkdownRules(name: string): string {
  const verification = buildPhotoPlantVerificationRules('入力された植物名', name);
  const honestRules = buildHonestHealthAssessmentRules({ includeMemoEmpathy: false });
  const mismatchExample = buildRegistrationMismatchMarkdown(name);

  return `ユーザーが入力した植物名: 「${name}」

${verification}

照合に失敗した場合: careGuideMarkdown には次の内容**のみ**を入れ、sunlightTag は "partial_sun" にしてください（種類の推定や一般論は書かない）。

${mismatchExample}

照合に成功した場合のみ:
${honestRules}
- 写真は葉の形・質感・全体の様子から種類の**補助推定**に使う（部屋の明るさだけで日照タグを決めない）。
- この回答は登録時の「共通育成ガイド」です。個体の健康診断や今日すぐやる対応は書かない。
- 種類に確信が低いときは「種類: 〇〇（推定）」のように書く。照合が通ったことの説明は不要。

careGuideMarkdown は次の Markdown 構造**のみ**にしてください。見出し構造を必ず守ってください。

## まとめ
（3〜5行以内。箇条書き3〜5項目。1行目に「種類: 〇〇」または「種類: 〇〇（推定）」。照合と写真に基づく推定であること）

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

function buildSunlightTagJudgementRules(name: string): string {
  return `【日照タグ sunlightTag の意味（重要）】
sunlightTag は**「この植物を育てるうえで、ユーザーが選ぶべき置き場のカテゴリ」**を表します。
**撮影時点の部屋の明るさや、写真に写っている窓・影から「いまの環境」をタグ付けするものではありません。** 現状の環境タグではないことを必ず守ってください。

【決め方】（照合成功時のみ）
1. **植物名「${name}」**と写真の両方が一致していると確信できる場合に、想定される種類・近縁群を特定してください。
2. **写真**は、葉形・茎・成長姿・質感など**種類の同定を補うため**に使ってください。背景の明るさだけでタグを決めないでください。
3. 同定した種類について、観葉植物・園芸の一般的知識から**この植物が健やかに育つのに適した光環境（日向寄り／半日向／日陰寄り）**を選び、次のいずれか 1 つだけ sunlightTag に出力してください:
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

照合成功かつ種類が推定できたうえで迷ったら "partial_sun" を選んでください。照合失敗時は上記どおり "partial_sun" のみ（推定に基づくタグ付けはしない）。`;

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
          'あなたは観葉植物・多肉植物の育成アドバイザーです。作業順序は必ず (1) 写真と入力名の照合（内部） → (2) 照合成功時のみ育成ガイドを作成。照合失敗時だけ「判断できない／一致しない」を書く。照合成功時は一致したことの報告は書かず、育成ガイドに直入る。種類の推定は写真と入力名に基づき、確信が低いときは「推定」を使う。健康診断は書かない。必ず「## まとめ」と「## 詳細」を使う。sunlightTag は照合成功かつ種類が推定できたときだけ、置き場の推奨として選ぶ。JSON オブジェクトだけを返す。',
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
