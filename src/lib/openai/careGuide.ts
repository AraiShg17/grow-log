import { getModel, getOpenAiClient } from '@/lib/openai/client';
import { isSunlightTagId, type SunlightTagId } from '@/lib/plants/sunlightTags';

function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function buildCareGuideMarkdownRules(name: string): string {
  return `ユーザーが入力した植物名: 「${name}」

この名前を主な手がかりにし、添付写真は葉の形・質感・全体の様子から**種類の補助推定**に使ってください（写真に写っている部屋の明るさや窓からの距離を「現状のタグ」にしないでください）。
この回答は登録時の「共通育成ガイド」です。今回の写真に写っている個体の一時的な状態診断や、今日すぐやる個別対応は書かないでください。

careGuideMarkdown は次の Markdown 構造**のみ**にしてください。見出し構造を必ず守ってください。

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

function buildSunlightTagJudgementRules(name: string): string {
  return `【日照タグ sunlightTag の意味（重要）】
sunlightTag は**「この植物を育てるうえで、ユーザーが選ぶべき置き場のカテゴリ」**を表します。
**撮影時点の部屋の明るさや、写真に写っている窓・影から「いまの環境」をタグ付けするものではありません。** 現状の環境タグではないことを必ず守ってください。

【決め方】
1. **植物名「${name}」**をもとに、想定される種類・近縁群を特定してください。
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

迷ったら "partial_sun" を選んでください。`;

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
          'あなたは観葉植物・多肉植物の育成アドバイザーです。日本語で、初心者向けに回答してください。ユーザーが入力した植物名と写真（主に植物の見た目）から種類を推定し、その植物の一般的な栽培要件を知識として用いてください。育成ガイドでは品種・種類ごとの一般的な育成方法だけを扱い、写真の個体に対する健康診断や緊急対応は書かないでください。必ず「## まとめ」と「## 詳細」を使い、「## 詳細」の中は「###」見出しごとの項目に分けてください。sunlightTag は「撮影した部屋の明るさ」ではなく「この植物をどの明るさの置き場で育てるべきか」の推奨だけを表すこと。ユーザーへの指示どおり JSON オブジェクトだけを返してください。',
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
