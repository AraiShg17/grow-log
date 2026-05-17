---
inclusion: always
---

# Liquid Glass Design Guidelines

このドキュメントは、プロジェクト全体で使用するLiquid Glassデザインの実装ガイドラインです。

## ⚠️ 使用ガイドライン

**このドキュメントは「Liquid Glassデザインを使う場合の実装方法」を定義しています。**

- ✅ Liquid Glassデザインを採用する場合は、このガイドラインに従って実装してください
- ❌ すべてのコンポーネントにLiquid Glassを適用する必要はありません
- 💡 デザイン要件や目的に応じて、適切な場面で使用してください

## 概要

Liquid Glassデザインは、SVGフィルターと`backdrop-filter`を組み合わせて、ガラスのような透明感と液体のような動きを表現するデザイン手法です。

**推奨実装方法**: RGBチャンネル分離による色収差効果を使用した高品質なLiquid Glass効果

## 適用対象

- ヘッダー/ナビゲーション
- ボタン
- カード
- モーダル/ダイアログ
- オーバーレイ
- その他のインタラクティブ要素

## 推奨実装パターン（RGBチャンネル分離方式）

### 1. 動的SVG変位マップの生成

```tsx
'use client';

import { useId } from 'react';

export function LiquidGlassComponent() {
  const filterId = useId(); // 一意なIDを生成

  // コンポーネントのサイズ
  const width = 1280;
  const height = 64;
  const radius = 16;
  const border = 0.02;
  const alpha = 0.86;
  const blur = 2;
  const lightness = 50;

  const buildDisplacementImage = () => {
    const borderSize = Math.min(width, height) * (border * 0.5);
    const svgContent = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red-${filterId}" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#808080"/>
          <stop offset="20%" stop-color="#808080"/>
          <stop offset="80%" stop-color="#808080"/>
          <stop offset="100%" stop-color="#909090"/>
        </linearGradient>
        <linearGradient id="blue-${filterId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#808080"/>
          <stop offset="20%" stop-color="#808080"/>
          <stop offset="80%" stop-color="#808080"/>
          <stop offset="100%" stop-color="#707070"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="#808080"></rect>
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red-${filterId})" />
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue-${filterId})" style="mix-blend-mode: difference" />
      <rect x="${borderSize}" y="${borderSize}" width="${width - borderSize * 2}" height="${height - borderSize * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)" />
    </svg>`;
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml,${encoded}`;
  };

  return (
    <div className={styles.container}>
      {/* SVGフィルター定義 */}
      <svg
        className={styles.filter}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={buildDisplacementImage()}
              result="map"
            />
            {/* Red チャンネル */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-30"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="red"
            />
            {/* Green チャンネル */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-25"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="green"
            />
            {/* Blue チャンネル */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              xChannelSelector="R"
              yChannelSelector="B"
              scale="-20"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="blue"
            />
            {/* チャンネル合成 */}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation="0" />
          </filter>
        </defs>
      </svg>

      {/* Liquid Glass背景レイヤー（フィルター適用） */}
      <div
        className={styles.liquidGlassBackground}
        style={{ filter: `url(#${filterId})` }}
        aria-hidden="true"
      />

      {/* コンテンツレイヤー（フィルター適用なし） */}
      <div className={styles.content}>
        {/* コンテンツ */}
      </div>
    </div>
  );
}
```

### 2. CSS実装（レイヤー分離方式）

```css
.container {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

/* SVGフィルター（非表示） */
.filter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

/* Liquid Glass背景レイヤー */
.liquidGlassBackground {
  position: absolute;
  inset: 0;
  z-index: -1;

  /* 透明度の高いグラデーション背景 */
  background: linear-gradient(
    135deg,
    in oklab,
    oklch(100% 0 0 / 0.3) 0%,
    oklch(95% 0.02 250 / 0.25) 50%,
    oklch(100% 0 0 / 0.28) 100%
  );
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);

  border-radius: inherit;
}

/* コンテンツレイヤー */
.content {
  position: relative;
  z-index: 1;
  /* コンテンツのスタイル */
}
```

## パラメータ調整ガイド

### 動的SVG変位マップ

- `border`: ボーダーサイズ（0.01-0.05推奨）
- `alpha`: 透明度（0.7-0.9推奨）
- `blur`: ブラー強度（1-4px推奨）
- `lightness`: 明度（40-60推奨）
- **グラデーション色**: 中間グレー（#808080）を使用して目立たないように

### feDisplacementMap（RGBチャンネル別）

- **Red チャンネル**: `scale="-30"` （最も強い歪み）
- **Green チャンネル**: `scale="-25"` （中間の歪み）
- **Blue チャンネル**: `scale="-20"` （最も弱い歪み）
- **推奨範囲**: -20 〜 -40（コンテンツがズレない程度）

### backdrop-filter

- `blur()`: 背景のぼかし（10-15px推奨）
- `saturate()`: 彩度（120-180%推奨）

## 重要な実装ポイント

### 1. レイヤー分離

```tsx
// ✅ 正しい - 背景とコンテンツを分離
<div className={styles.container}>
  <div className={styles.liquidGlassBackground} style={{ filter: `url(#${filterId})` }} />
  <div className={styles.content}>{children}</div>
</div>

// ❌ 間違い - コンテナ全体にフィルター適用（コンテンツがズレる）
<div className={styles.container} style={{ filter: `url(#${filterId})` }}>
  {children}
</div>
```

### 2. 一意なフィルターID

```tsx
// ✅ 正しい
const filterId = useId();
<filter id={filterId}>
<linearGradient id={`red-${filterId}`}>

// ❌ 間違い（複数コンポーネントで衝突）
<filter id="liquid-glass-filter">
<linearGradient id="red">
```

### 3. 変位マップの色

```tsx
// ✅ 正しい - 中間グレーで目立たない
stop-color="#808080"

// ❌ 間違い - 黒や赤/青は視覚的に目立つ
stop-color="#000"
stop-color="red"
```

### 4. Webkit プレフィックス

```css
/* ✅ 正しい */
backdrop-filter: blur(12px) saturate(150%);
-webkit-backdrop-filter: blur(12px) saturate(150%);

/* ❌ 間違い（Safariで動作しない） */
backdrop-filter: blur(12px) saturate(150%);
```

## 旧実装パターン（非推奨）

以下の実装は、コンテンツがズレる問題があるため非推奨です：

```tsx
// ❌ 非推奨 - feTurbulence + feDisplacementMap の直接適用
<filter id={filterId}>
  <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="3" result="noise" />
  <feGaussianBlur in="noise" stdDeviation="10" result="blur" />
  <feDisplacementMap in="SourceGraphic" in2="blur" scale="20" />
</filter>
```

**問題点**:
- コンテンツ全体が歪んでテキストが読みにくい
- 位置がズレて配置が崩れる
- 背景とコンテンツの分離ができない

## パフォーマンス最適化

### 1. SVGフィルターの最適化

```tsx
// ✅ 正しい - 非表示にして描画負荷を軽減
<svg
  style={{
    position: 'absolute',
    width: 0,
    height: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
  }}
  aria-hidden="true"
>
```

### 2. contain プロパティ

```css
.liquidGlassBackground {
  contain: paint; /* layout は避ける */
}
```

### 3. アニメーション削減対応

```css
@media (prefers-reduced-motion: reduce) {
  .container {
    transition: none;
    animation: none;
  }
}
```

## アクセシビリティ

### 1. コントラスト確保

```css
/* テキストのコントラストを確保 */
.content {
  color: var(--color-text);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

### 2. フォーカス表示

```css
.container:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3. aria属性

```tsx
// 装飾的な要素には aria-hidden を追加
<div className={styles.liquidGlassBackground} aria-hidden="true" />
<svg aria-hidden="true">
```

## トラブルシューティング

### 効果が見えない

1. **背景の確認**: 単色背景では効果が弱い
2. **ブラウザ対応**: Firefox では制限あり
3. **CSS変数**: 値が正しく設定されているか確認
4. **z-index**: レイヤーの重なり順を確認

### コンテンツがズレる

1. **レイヤー分離**: 背景レイヤーにのみフィルターを適用
2. **scale値**: -20 〜 -40 の範囲に調整
3. **コンテンツレイヤー**: `z-index: 1` で前面に配置

### 変位マップが見える

1. **色の調整**: 中間グレー（#808080）を使用
2. **透明度**: 背景の透明度を上げる（0.25-0.35）
3. **scale値**: 値を小さくして効果を微妙に

### パフォーマンス問題

1. **インスタンス数**: 同時使用数を制限
2. **アニメーション**: 不要なトランジションを無効化
3. **メモリ**: 大量使用時のメモリ監視

## 使用例

### ヘッダー

```tsx
<header className={styles.header}>
  <svg>{/* フィルター定義 */}</svg>
  <div className={styles.liquidGlassBackground} style={{ filter: `url(#${filterId})` }} />
  <div className={styles.headerInner}>
    <nav>{/* ナビゲーション */}</nav>
  </div>
</header>
```

### ボタン

```tsx
<button className={styles.liquidGlassButton}>
  <div className={styles.liquidGlassBackground} style={{ filter: `url(#${filterId})` }} />
  <span className={styles.buttonText}>クリック</span>
</button>
```

### カード

```tsx
<div className={styles.liquidGlassCard}>
  <div className={styles.liquidGlassBackground} style={{ filter: `url(#${filterId})` }} />
  <div className={styles.cardContent}>
    <h3>タイトル</h3>
    <p>説明文</p>
  </div>
</div>
```

## 禁止事項

❌ **やってはいけないこと：**

- フィルターIDをハードコードする（`useId()` を使用）
- `-webkit-` プレフィックスを省略する
- コンテナ全体にフィルターを適用する（レイヤー分離必須）
- 変位マップに黒や原色を使用する（中間グレー推奨）
- scale値を大きくしすぎる（-20 〜 -40推奨）
- `contain: layout` を使用する（レイアウトが壊れる）
- 過度なアニメーションを追加する（パフォーマンス低下）
- アクセシビリティ対応を省略する

## 参考リソース

- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [MDN: SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
- [MDN: feDisplacementMap](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap)
- [Can I Use: backdrop-filter](https://caniuse.com/css-backdrop-filter)
