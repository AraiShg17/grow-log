# CSS Layout Rules — Layout Safety & Performance

UI レイアウトの破綻防止・アクセシビリティ・パフォーマンス向けのルールです。  
スタイリング全般は [css-styling-rules.md](./css-styling-rules.md)、コンポーネント構造は [structure.md](./structure.md) を参照。

## ⚠️ 使用ガイドライン

**このドキュメントは「レイアウトの安全性を確保するための必須ルール」を定義しています。**

- ✅ **必須ルール**: `safe center`、`isolation: isolate`、`prefers-reduced-motion`などは積極的に適用してください
- ✅ **推奨ルール**: `overflow: clip`、`contain`などは必要に応じて使用してください
- ⚠️ **禁止事項**: 記載された禁止事項は必ず守ってください（UIの破綻を防ぐため）

これらのルールは、モーダルが潜る、スクロール時にコンテンツが切れる、レイアウトが壊れるなどの「UI事故」を防ぐために重要です。

## 1. 安全寄せ（safe キーワード）

### 原則（必須）

レイアウトに中央寄せ・整列が含まれる場合は、`safe` キーワードを常に優先して使用する。

```css
justify-content: safe center;
align-items: safe center;
align-content: safe center;
place-content: safe center;
```

### 理由

- スクロール発生時の "先頭側がクリップされるバグ" を防ぐ
- モーダルや独立スクロール領域でUIが切れる問題を回避
- スマホUI（特にiOS）で安全にレンダリングされる

### 注意点

- `safe` は「安全側に寄せる」ため、本当に中央固定したいケース（ローダーなど）は `unsafe center` を使ってもよい
- `place-items: safe center` は grid/flex 両方で効く
- 古いブラウザでは非対応があるため、完全中央寄せが要求されるデザインでは fallback を検討する

## 2. overflow: clip

### 原則（推奨）

スクロールを禁止しつつ、要素のはみ出しを確実にクリップしたい場合は `overflow: clip` を使用する。

```css
overflow: clip;
```

### 使いどころ

- アニメーション中のはみ出しを確実にカットしたいとき
- `transform` による揺れ/ズレを防止したいとき
- モーダルやオーバーレイ内の背景レイヤー

### 注意点

- `clip` はスクロールを絶対に発生させない → UI内のスクロールが必要な場合は使わない
- `hidden` と違い「スクロール可能な状態でもスクロールバーを出さない」

## 3. prefers-reduced-motion（アクセシビリティ）

### 原則（必須）

アニメーションを含むコンポーネントは必ず `prefers-reduced-motion: reduce` の fallback を定義すること。

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 対象

- モーダルのフェードイン/フェードアウト
- ページ遷移アニメーション（View Transition API）
- スクロール連動アニメーション
- パララックス
- ホバーで大きく動く効果

### 注意点

- "動きの量を減らす" であって "全削除" ではない
- 背景ぼかし（blur）は motion とは別なので削除不要
- Lottie / GIF / video は JS 側でも reduce 対応が必要

## 4. isolation: isolate（レイヤー安全性）

### 原則（必須）

以下のパーツには必ず `isolation: isolate;` を付与する：

- モーダルの最上位要素
- ドロップダウン / ポップオーバー / ツールチップ
- `backdrop-filter` を使う背景
- 固定ヘッダー / 固定フッター
- `transform` を持つ要素の手前に表示する必要がある UI

```css
.component {
  isolation: isolate;
}
```

### 理由

- `transform` / `opacity` / `filter` による stacking context 汚染を防ぐ
- モーダルが画面下に沈む z-index 事故を防止
- `backdrop-filter` のバグ回避

### 注意点

- `isolation` を付けると内部の `position: sticky` が正常に動かない場合がある
- `z-index` 関係が完全に独立するため、「親レイヤーの上に出ない」ケースも起こりうる
- UIの「世界」を切るので乱用しない（最上位コンポーネントのみに）

## 5. contain（レイアウト境界分離）

### 原則（推奨）

パフォーマンスが重くなりやすい領域には `contain: layout paint` をつけ、レイアウトの影響を閉じる。

```css
.container {
  contain: layout paint;
}
```

### 推奨パターン

- スクロールコンテナ
- リスト / カードグリッド
- 高頻度でDOMが変化する領域
- Virtualized List と組み合わせる領域

### 注意点（重要）

- `contain: layout` を付けると `height: auto` が効かない場合がある → "外側の高さ" がゼロ扱いになることがある
- `sticky` は `contain` で壊れる可能性あり
- `contain: content`（全部閉じる）は強力だがUIが壊れやすいので慎重に
- `overflow` とセットで挙動が複雑化するため、スクロールが必要な要素に使う場合は注意

## 6. 推奨レイアウト安全セット（例）

モーダルや独立スクロール要素では、以下の組み合わせが最も安全：

```css
.modal {
  position: fixed;
  inset: 0;
  justify-content: safe center;
  align-items: safe center;
  
  isolation: isolate;
  contain: paint;
  overflow: auto;
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
```

## 7. 禁止事項 / 非推奨事項

❌ **やってはいけないこと：**

- モーダル背景（`backdrop-filter` あり）に `isolation` を付けない
- `contain: content` をフォームやモーダルに付ける
- `sticky` 領域に `isolation` / `contain` を加える
- `overflow: clip` をスクロール領域に使う（スクロール封鎖の原因）
- `unsafe` キーワードをむやみに使用する
- `justify-content: center` を単体で使う（スクロール時にクリップされる）
- `transform: translateZ(0)` をレイアウト要素に乱用する（新規レイヤー生成）

## 🔥 まとめ（Kiro が自動で守ってくれる状態）

このルールを Kiro の共通領域に入れておけば、以下の "UI 事故の9割" を自動で回避できる：

- ✅ モーダルが潜る
- ✅ スクロール時に中央寄せコンテンツが切れる
- ✅ スクロールが重い
- ✅ アニメで酔う
- ✅ `transform` や `backdrop-filter` でレイヤー事故
- ✅ `sticky` / `auto-height` が壊れる
- ✅ レイアウトがカクつく
- ✅ スマホUIがガタつく

## 適用チェックリスト

新規コンポーネント作成時は以下を確認：

- [ ] 中央寄せに `safe center` を使用している
- [ ] モーダル/オーバーレイに `isolation: isolate` を付与している
- [ ] アニメーションに `prefers-reduced-motion` 対応を追加している
- [ ] スクロールコンテナに適切な `contain` を設定している
- [ ] `overflow: clip` を誤用していない（スクロール領域に使っていない）
- [ ] `sticky` 要素に `isolation` や `contain` を付けていない
