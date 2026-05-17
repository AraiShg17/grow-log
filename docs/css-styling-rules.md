---
inclusion: always
---

# CSS Styling Rules

CSS Modules のスタイリング詳細ガイドです。**クラス名は camelCase**（[structure.md](./structure.md) を優先）。

## 関連ドキュメント（重複回避）

| トピック | 参照先 |
|---------|--------|
| レイアウト安全性（safe center、isolation） | [css-layout-rules.md](./css-layout-rules.md) |
| Container / Section / Inner | [structure.md](./structure.md) |
| Liquid Glass | [liquid-glass-design.md](./liquid-glass-design.md) |
| View Transitions | [view-transitions.md](./view-transitions.md) |
| `<dialog>` / Popover | [dialog-element.md](./dialog-element.md), [popover-api.md](./popover-api.md) |

## ⚠️ 使用ガイドライン

**このドキュメントは「CSSを書く場合の実装方法」を定義しています。**

- ✅ 各CSS機能を使用する場合は、このガイドラインに従って実装してください
- ❌ すべての機能を必ず使用する必要はありません
- 💡 プロジェクトの要件に応じて、適切な機能を選択してください

**例**：
- `@property`を使う場合 → このガイドラインに従って実装
- `calc-size()`を使う場合 → このガイドラインに従って実装
- 文字詰めを使う場合 → このガイドラインに従って実装
- シンプルなスタイルで十分な場合 → 無理に高度な機能を使う必要はありません

## 🍎 Apple Human Interface Guidelines 準拠

[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)を参考にデザインを実装してください。

### デザイン原則

- **Clarity（明確性）**: 情報を明確に伝達し、不要な装飾を避ける
- **Deference（敬意）**: コンテンツを重視し、UIは控えめに
- **Depth（深さ）**: 階層と動きでコンテンツの重要性を表現

### 参考すべきガイドライン

1. **Typography**: SF Proフォントファミリーの使用
2. **Color**: SF Symbols準拠のシステムカラー
3. **Spacing**: 8pt Grid Systemの活用
4. **Motion**: 自然で意図的なアニメーション
5. **Layout**: [Apple Layout Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout)に従った適切な階層とコントラスト
6. **Safe Areas**: デバイスの安全領域を考慮したレイアウト
7. **Accessibility**: アクセシビリティの考慮

## グローバル CSS 設定（必須）

以下のプロパティは、`globals.css`の`:root`または`body`に必ず設定してください。

### 1. interpolate-size（:root に設定）

```css
:root {
  /* 固有サイズの設定キーワードをアニメーション可能にする */
  interpolate-size: allow-keywords;
}
```

**目的**: `height: auto`や`width: auto`などの固有サイズキーワードをアニメーション可能にする

**効果**:
- アコーディオンやドロップダウンなどの可変高さ要素のアニメーションが可能になる
- `calc-size()`関数と組み合わせることで、より柔軟なアニメーションが実現できる

**ブラウザサポート**: Chrome 129+, Safari 18+

### 2. text-autospace（body に設定）

```css
body {
  /* 日本語と英語の間に自動でスペースを挿入 */
  text-autospace: normal;
}
```

**目的**: 日本語と英語（ラテン文字）の間に自動的にスペースを挿入

**効果**:
- 手動でスペースを入れる必要がなくなる
- メンテナンス性が向上（スペースの入れ忘れを防ぐ）
- 自然な読みやすさを実現

**例**:
```html
<!-- 自動的にスペースが挿入される -->
<p>これはReactで作られたアプリケーションです。</p>
<!-- 表示: これは React で作られたアプリケーションです。 -->
```

**ブラウザサポート**: Chrome 123+, Safari 17.4+

### 3. text-box（body に設定）

```css
body {
  /* テキストボックスのトリミング（行頭・行末の余白を削除） */
  text-box: trim-both cap alphabetic;
}
```

**目的**: テキストボックスの余白をトリミングして、より正確な配置を実現

**効果**:
- 行頭と行末の余白を削除し、デザインの精度を向上
- キャップハイト（大文字の高さ）とベースライン（文字の下端）を基準にトリミング
- アイコンとテキストの垂直方向の配置が正確になる

**パラメータ**:
- `trim-both`: 行頭と行末の両方をトリミング
- `cap`: キャップハイト（大文字の高さ）を基準
- `alphabetic`: ベースライン（文字の下端）を基準

**ブラウザサポート**: Chrome 131+（実験的機能）

### 4. img の vertical-align（必須）

```css
img {
  /* 画像の下に余白ができるのを防ぐ */
  vertical-align: top;
}
```

**目的**: 画像の下に不要な余白が発生するのを防ぐ

**効果**:
- `img` 要素はデフォルトで `vertical-align: baseline` が適用されており、ベースライン下の余白（descender space）が発生する
- `vertical-align: top` を設定することで、この余白を削除
- レイアウトが崩れにくくなる

**理由**:
- `img` はインライン要素として扱われるため、テキストのベースラインに揃えられる
- これにより、画像の下に約3-5pxの余白が発生する
- `vertical-align: top` で画像を上端に揃えることで、この問題を解決

**代替案**:
- `display: block` を設定する方法もあるが、インライン配置が必要な場合に使えない
- `vertical-align: top` はインライン配置を維持しつつ、余白を削除できる

**ブラウザサポート**: すべてのブラウザでサポート

### グローバルCSS設定の実装例

```css
/* globals.css */

:root {
  /* 固有サイズの設定キーワードをアニメーション可能にする */
  interpolate-size: allow-keywords;
  
  /* その他のCSS変数 */
  --color-primary: oklch(60% 0.15 250);
  /* ... */
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-background);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* 日本語と英語の間に自動でスペースを挿入 */
  text-autospace: normal;
  
  /* テキストボックスのトリミング（行頭・行末の余白を削除） */
  text-box: trim-both cap alphabetic;
}

img {
  /* 画像の下に余白ができるのを防ぐ */
  vertical-align: top;
}
```

### 重要なポイント

1. **プログレッシブエンハンスメント**: これらのプロパティは非対応ブラウザでは無視されるため、安全に使用できる
2. **グローバル設定**: `:root`または`body`に設定することで、プロジェクト全体で恩恵を受ける
3. **メンテナンス性**: 手動での調整が不要になり、コードの保守性が向上
4. **将来性**: モダンブラウザでサポートが進んでおり、今後の標準となる機能

## 🎨 デザインシステム

### カラーパレット

```css
:root {
  /* プライマリカラー */
  --primary-start: #3b82f6;
  --primary-end: #9333ea;
  --primary-gradient: linear-gradient(
    in oklab to right,
    var(--primary-start),
    var(--primary-end)
  );

  /* セカンダリカラー */
  --secondary-start: #f97316;
  --secondary-end: #ec4899;
  --secondary-gradient: linear-gradient(
    in oklab to right,
    var(--secondary-start),
    var(--secondary-end)
  );

  /* 背景カラー */
  --background-start: #f8fafc;
  --background-end: #e2e8f0;
  --background-gradient: linear-gradient(
    in oklab to bottom right,
    var(--background-start),
    var(--background-end)
  );

  /* テキストカラー */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #475569;

  /* アクセントカラー */
  --accent-success: #10b981;
  --accent-shadow: color-mix(in oklab, #000000 5%, transparent);

  /* ホバー状態の色 */
  --primary-hover-start: #2563eb;
  --primary-hover-end: #7c3aed;
  --secondary-hover-start: #ea580c;
  --secondary-hover-end: #db2777;
}
```

## 🎨 色設定ルール（必須）

### 基本原則

**すべての色設定はCSS変数を使用し、#000000形式（6桁のHEX）で定義すること。**

```css
/* ✅ 正しい - CSS変数 + HEX形式 */
:root {
  --color-primary: #3b82f6;
  --color-text: #1e293b;
  --color-background: #ffffff;
}

.button {
  background-color: var(--color-primary);
  color: var(--color-text);
}

/* ❌ 間違い - 直接色を指定 */
.button {
  background-color: #3b82f6;
  color: #1e293b;
}

/* ❌ 間違い - rgb()形式 */
:root {
  --color-primary: rgb(59 130 246);
}
```

### 半透明色の実現（必須）

**半透明色が必要な場合は、color-mix()関数でtransparentと混ぜること。**

```css
/* ✅ 正しい - color-mix()で半透明を実現 */
:root {
  --color-primary: #3b82f6;
  --color-overlay: color-mix(in oklab, var(--color-primary) 80%, transparent);
  --color-shadow: color-mix(in oklab, #000000 10%, transparent);
  --color-backdrop: color-mix(in oklab, #000000 50%, transparent);
}

.modal {
  background: var(--color-overlay);
  box-shadow: 0 8px 32px var(--color-shadow);
}

.modal::backdrop {
  background: var(--color-backdrop);
}

/* ❌ 間違い - rgba()やhsla()を使用 */
:root {
  --color-overlay: rgba(59, 130, 246, 0.8);
  --color-shadow: rgba(0, 0, 0, 0.1);
}

/* ❌ 間違い - rgb()のスラッシュ記法 */
:root {
  --color-overlay: rgb(59 130 246 / 0.8);
}
```

### color-mix()の使用パターン

```css
/* 基本パターン - ベースカラーのみ定義 */
:root {
  --color-primary: #3b82f6;
  --color-text: #1e293b;
  --color-background: #ffffff;
}

/* 使用時に直接透明度を指定 */
.button {
  background: var(--color-primary);
  transition: background 0.2s ease;
  
  &:hover {
    background: color-mix(in oklab, var(--color-primary) 60%, transparent);
  }
  
  &:active {
    background: color-mix(in oklab, var(--color-primary) 80%, transparent);
  }
  
  &:disabled {
    background: color-mix(in oklab, var(--color-primary) 30%, transparent);
  }
}

.overlay {
  background: color-mix(in oklab, #000000 50%, transparent);
  backdrop-filter: blur(8px);
}

.shadow {
  box-shadow: 0 4px 12px color-mix(in oklab, var(--color-primary) 20%, transparent);
}

/* 色の明暗調整 */
.darkButton {
  background: color-mix(in oklab, var(--color-primary) 80%, #000000);
}

.lightButton {
  background: color-mix(in oklab, var(--color-primary) 80%, #ffffff);
}
```

### 効率的な色管理

**ベースカラーのみCSS変数で定義し、使用時に直接透明度を指定する。**

```css
/* ✅ 正しい - ベースカラーのみ定義 */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #f97316;
  --color-text: #1e293b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
}

/* ✅ 正しい - 使用時に透明度を指定 */
.card {
  background: var(--color-surface);
  border: 1px solid color-mix(in oklab, var(--color-text) 10%, transparent);
  box-shadow: 0 4px 12px color-mix(in oklab, #000000 8%, transparent);
}

.button {
  background: var(--color-primary);
  
  &:hover {
    background: color-mix(in oklab, var(--color-primary) 80%, transparent);
  }
}

.overlay {
  background: color-mix(in oklab, #000000 50%, transparent);
}

/* ❌ 間違い - 透明度別にCSS変数を大量定義 */
:root {
  --color-primary-10: color-mix(in oklab, var(--color-primary) 10%, transparent);
  --color-primary-20: color-mix(in oklab, var(--color-primary) 20%, transparent);
  --color-primary-30: color-mix(in oklab, var(--color-primary) 30%, transparent);
  /* ... 大量の変数定義は非効率 */
}
```

### 色空間の指定

**color-mix()では必ずoklab色空間を使用すること。**

```css
/* ✅ 正しい - oklab色空間を使用 */
--color-mixed: color-mix(in oklab, #ff0000 50%, #0000ff);

/* ❌ 間違い - 色空間を省略 */
--color-mixed: color-mix(#ff0000 50%, #0000ff);

/* ❌ 間違い - srgb色空間を使用 */
--color-mixed: color-mix(in srgb, #ff0000 50%, #0000ff);
```

**理由**:
- oklabは知覚的に均等な色空間で、より自然な色の混合が可能
- グラデーションでも一貫してoklab色空間を使用するため統一性がある
- 将来的にブラウザサポートが向上した際の標準となる

### ダークモード対応

**`light-dark()`関数を使用してダークモード対応を実装してください。**

```css
/* ✅ 正しい - light-dark()でCSS変数を使用 */
.text {
  color: light-dark(var(--text-primary-light), var(--text-primary-dark));
}

.background {
  background-color: light-dark(var(--background-light), var(--background-dark));
}

.border {
  border-color: light-dark(var(--border-light), var(--border-dark));
}

/* ❌ 間違い - 直接色を指定 */
.text {
  color: light-dark(#1e293b, #f1f5f9);
}

/* ❌ 間違い - メディアクエリで分離 */
.text {
  color: #1e293b;
}
@media (prefers-color-scheme: dark) {
  .text {
    color: #f1f5f9;
  }
}
```

**CSS変数の定義例**：

```css
:root {
  /* ライトモード用の色 */
  --text-primary-light: #1e293b;
  --text-secondary-light: #64748b;
  --background-light: #ffffff;
  --border-light: #e2e8f0;

  /* ダークモード用の色 */
  --text-primary-dark: #f1f5f9;
  --text-secondary-dark: #cbd5e1;
  --background-dark: #0f172a;
  --border-dark: #334155;
}
```

### タイポグラフィ

```css
/* フォントファミリー */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

/* フォントスムージング */
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;

/* 日本語と英語の間に自動でスペースを挿入（必須） */
text-autospace: normal;

/* テキストボックスのトリミング（行頭・行末の余白を削除）（必須） */
text-box: trim-both cap alphabetic;
```

**text-autospace（必須）**:
- 日本語と英語（ラテン文字）の間に自動的にスペースを挿入
- `normal`: 自動スペース挿入を有効化（推奨）
- `no-autospace`: 自動スペース挿入を無効化
- グローバル（`body`）に設定することで、プロジェクト全体で適用

**text-box（必須）**:
- テキストボックスの余白をトリミングして、より正確な配置を実現
- `trim-both`: 行頭と行末の両方をトリミング
- `cap alphabetic`: キャップハイト（大文字の高さ）とベースライン（文字の下端）を基準にトリミング
- グローバル（`body`）に設定することで、プロジェクト全体で適用

**ブラウザサポート**:
- `text-autospace`: Chrome 123+, Safari 17.4+
- `text-box`: Chrome 131+（実験的機能）
- 非対応ブラウザでは無視されるため、プログレッシブエンハンスメントとして安全に使用可能

### 文字詰め（font-feature-settings）

```css
/* 見出しなど強めに詰めたい */
.kern-palt {
  font-feature-settings: 'palt' 1;
}

/* 句読点の詰まりを弱めたい（可読性重視） */
.kern-pwid {
  font-feature-settings: 'pwid' 1;
}

/* 仮名のみプロポーショナル */
.kern-pkna {
  font-feature-settings: 'pkna' 1;
}

/* 明示的に無効化（継承を打ち消す） */
.kern-off {
  font-feature-settings: normal;
}
```

**文字詰めの使用ルール**：

1. **デフォルトは非適用**: 本文は可読性を優先し、必要箇所にユーティリティで付与
2. **ユーティリティ運用**: 見出しやUIラベルには`.kern-palt`、本文で句読点の詰まりを緩和したい場合は`.kern-pwid`
3. **同時適用しない**: `palt`と`pwid`を併用しない（どちらか一方のみ）
4. **フォント対応の確認**: ヒラギノ/游/Noto は対応、メイリオは非対応
5. **letter-spacingは最小限**: 可読性に影響しない範囲で微調整

### スペーシング

```css
/* 8px ベースのスペーシング */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */

/* コンテナサイズ */
--container-max-width: 1200px;
```

## 🧩 CSS カスタムプロパティとアニメーション

### transition の設定（必須）

**基本的な時間とeasingはCSS変数を使用して共通化すること。**

```css
/* globals.css で定義 */
:root {
  /* 基本的な時間設定 */
  --duration-fast: 0.15s;
  --duration-default: 0.2s;
  --duration-slow: 0.3s;

  /* 基本的なeasing設定 */
  --ease-default: ease;
  --ease-in-out: ease-in-out;
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**使用例**:

```css
/* ✅ 正しい - 時間とeasingを組み合わせて使用 */
.button {
  transition: background var(--duration-default) var(--ease-default);
}

.modal {
  transition: 
    opacity var(--duration-default) var(--ease-smooth),
    transform var(--duration-default) var(--ease-smooth);
}

/* ❌ 間違い - 直接値を指定 */
.button {
  transition: background 0.2s ease;
}
```

### @property を使用したアニメーション（推奨）

**CSS変数をアニメーション可能にするには、必ず`@property`で定義する。**

```css
/* ✅ 正しい - @propertyで定義してからtransition */
@property --bg-x {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.button {
  background-position-x: var(--bg-x);
  transition: --bg-x var(--transition-default);
  
  &:hover {
    --bg-x: 100%;
  }
}

/* ❌ 間違い - @propertyなしではアニメーションしない */
.button {
  --bg-x: 0%;
  transition: --bg-x var(--transition-default); /* 動作しない */
  
  &:hover {
    --bg-x: 100%;
  }
}
```

### 色のアニメーション（color-mix対応）

**`color-mix()`を使った派生色もアニメーション可能にする。**

```css
/* ✅ 正しい - 色をアニメーション可能にする */
@property --theme-color {
  syntax: '<color>';
  inherits: true;
  initial-value: oklch(60% 0.15 250);
}

:root {
  --theme-color: oklch(60% 0.15 250);
  
  /* color-mix()で派生色を作成 */
  --theme-bg-subtle: color-mix(in oklab, var(--theme-color) 5%, transparent);
  --theme-bg-muted: color-mix(in oklab, var(--theme-color) 10%, transparent);
  --theme-border: color-mix(in oklab, var(--theme-color) 30%, transparent);
  
  /* --theme-colorのトランジション */
  transition: --theme-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* --theme-colorが変わると、color-mix()の派生色も自動的にアニメーション */
```

**重要なポイント**:
- `@property`で定義した変数のみ`transition`可能
- `color-mix()`で作った派生色は、元の変数がアニメーションすれば自動的にアニメーション
- `inherits: true`にすると、子要素でも使用可能

### グラデーションの色変化

```css
@property --color-start {
  syntax: '<color>';
  inherits: false;
  initial-value: #3b82f6;
}

@property --color-end {
  syntax: '<color>';
  inherits: false;
  initial-value: #9333ea;
}

.button {
  background-image: linear-gradient(
    in oklab to right,
    var(--color-start),
    var(--color-end)
  );
  transition:
    --color-start var(--transition-default),
    --color-end var(--transition-default);
  
  &:hover {
    --color-start: #f97316;
    --color-end: #ec4899;
  }
}
```

### calc-size() 関数の活用

```css
/* アコーディオンの実装例 */
.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content {
  /* フォールバック */
  height: auto;
  /* calc-size()対応ブラウザ */
  height: calc-size(auto, size);
}

/* 幅の計算例 */
.responsive-element {
  width: calc-size(min-content, size * 1.5);
}

/* calc-size()の書き方パターン */
.element {
  /* 基本形：内容のサイズ */
  width: calc-size(auto, size);

  /* 文字列指定系の第1引数 */
  width: calc-size(fit-content, size);
  width: calc-size(max-content, size);
  width: calc-size(min-content, size);
  width: calc-size(stretch, size);

  /* 固定値を加算 */
  width: calc-size(auto, size + 56px);

  /* 固定値を減算 */
  width: calc-size(auto, size - 20px);

  /* サイズを倍にする */
  width: calc-size(auto, size * 2);

  /* サイズを半分にする */
  width: calc-size(auto, size / 2);

  /* 複雑な計算 */
  width: calc-size(auto, size * 1.5 + 24px);
  width: calc-size(auto, (size + 16px) * 2);
}
```

### interpolate-size プロパティ（必須）

**`:root`に必ず設定すること。**

```css
:root {
  /* 固有サイズの設定キーワードをアニメーション可能にする */
  interpolate-size: allow-keywords;
}
```

**重要なポイント**:
- `height: auto`や`width: auto`などの固有サイズキーワードをアニメーション可能にする
- アコーディオンやドロップダウンなどの可変高さ要素のアニメーションに必須
- グローバルに設定することで、プロジェクト全体で恩恵を受ける

**calc-size()とinterpolate-sizeの使い分け**：

```css
/* calc-size()を使用したアニメーション */
.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content {
  height: auto;
  height: calc-size(auto, size);
}

/* interpolate-sizeを使用したアニメーション */
.accordion-content-interpolate {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-default);
}

.accordion-trigger:checked + .accordion-content-interpolate {
  height: auto; /* interpolate-sizeによりアニメーション可能 */
}
```

## 📐 レイアウト

### Container / Section / Inner パターン

```css
/* 1. 全体を囲むコンテナ - padding-inlineなし */
.container {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}

/* 2. セクション - 横幅全体に伸びる */
.section {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  background: var(--section-background);
  padding-block: var(--spacing-2xl);
}

/* 3. セクション内のコンテンツエリア */
.sectionInner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--spacing-xl);
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
}
```

### width 設定のルール

```css
/* ✅ 正しい - stretchキーワードを使用 */
button {
  width: -webkit-fill-available;
  width: -moz-available;
  width: stretch;
  margin-inline: var(--spacing-md);
}

/* ❌ 間違い - width: 100%を使用 */
button {
  width: 100%;
  margin-inline: var(--spacing-md);
  /* オーバーフローが発生する可能性 */
}

/* ❌ 間違い - calc()で計算 */
button {
  width: calc(100% - 48px);
  margin-inline: 24px;
  /* マージン変更時に計算も変更が必要 */
}
```

**stretchキーワードの利点**：

1. **オーバーフロー防止**: マージンがあっても水平スクロールバーが発生しない
2. **メンテナンス性**: マージン変更時に計算の変更が不要
3. **ブラウザサポート**: 全ブラウザでサポート（ベンダープレフィックス付き）
4. **レスポンシブ対応**: 利用可能な幅に自動調整
5. **多用途対応**: `width`, `min-width`, `max-width`, `height`, `min-height`, `max-height`で使用可能

### Safe Areas（安全領域）

```css
/* bodyレベルで設定 */
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

### レスポンシブデザイン（モバイルファースト）

**必ずモバイルファースト（`width >=`）の方向で記述する。**

```css
/* ✅ 正しい - モバイルファースト */
.element {
  /* デフォルト（モバイル）スタイル */
  font-size: 1rem;
  padding: var(--space-2);
}

@media (width >= 480px) {
  .element {
    /* 小さいタブレット向けスタイル */
    font-size: 1.125rem;
    padding: var(--space-3);
  }
}

@media (width >= 768px) {
  .element {
    /* タブレット向けスタイル */
    font-size: 1.25rem;
    padding: var(--space-4);
  }
}

@media (width >= 1024px) {
  .element {
    /* デスクトップ向けスタイル */
    font-size: 1.5rem;
    padding: var(--space-5);
  }
}

/* ❌ 間違い - デスクトップファースト（width <）は使用禁止 */
.element {
  /* デフォルト（デスクトップ）スタイル */
  font-size: 1.5rem;
  padding: var(--space-5);
}

@media (width < 1024px) {
  .element {
    /* タブレット向けスタイル */
    font-size: 1.25rem;
    padding: var(--space-4);
  }
}

@media (width < 768px) {
  .element {
    /* モバイル向けスタイル */
    font-size: 1rem;
    padding: var(--space-2);
  }
}
```

### ブレイクポイントの変数管理（推奨）

**スタイルクエリ（Style Queries）を使用してブレイクポイントをCSS変数で管理する。**

#### 1. グローバル設定（globals.css）

```css
/* globals.css */
:root {
  /* ブレイクポイント変数をメディアクエリで設定 */
  @media (width >= 480px) {
    --sm: true;
  }
  
  @media (width >= 768px) {
    --md: true;
  }
  
  @media (width >= 1024px) {
    --lg: true;
  }
  
  @media (width >= 1280px) {
    --xl: true;
  }
}
```

#### 1. グローバル設定（globals.css）

```css
/* globals.css */
:root {
  /* ブレイクポイント変数をメディアクエリで設定 */
  @media (width >= 480px) {
    --sm: true;
  }
  
  @media (width >= 768px) {
    --md: true;
  }
  
  @media (width >= 1024px) {
    --lg: true;
  }
  
  @media (width >= 1280px) {
    --xl: true;
  }
}
```

#### 2. コンテナ定義（必須）

**スタイルクエリを使用するには、必ずコンテナを定義すること。**

```css
/* ✅ 正しい - ページやセクションの最上位要素にコンテナを定義 */
.container {
  /* コンテナを定義してスタイルクエリを有効化 */
  container-type: inline-size;
  container-name: page-main; /* 任意の名前 */
}

.section {
  container-type: inline-size;
  container-name: section-content;
}

/* ❌ 間違い - コンテナ定義なしでスタイルクエリを使用 */
.element {
  @container style(--md: true) {
    /* コンテナが定義されていないため動作しない */
    font-size: 1.25rem;
  }
}
```

**コンテナ定義のルール**:
- **Page/Layout Module**: ページやレイアウトの最上位要素に`container-type: inline-size`を設定
- **Component Module**: 必要に応じてコンポーネント内でもコンテナを定義可能
- **命名規則**: `container-name`は明確な名前を使用（`page-main`, `section-content`など）

**実装例**:
```css
/* app/about/page.module.css */
.container {
  width: stretch;
  container-type: inline-size;
  container-name: about-page;
}

.section {
  padding-block: var(--space-12);
  
  @container style(--md: true) {
    padding-block: var(--space-16);
  }
}
```

#### 3. コンポーネントでの使用

```css
/* ✅ 推奨 - スタイルクエリでブレイクポイント変数を使用 */
.element {
  /* デフォルト（モバイル）スタイル */
  font-size: 1rem;
  padding: var(--space-2);
}

/* 480px以上（小さいタブレット） */
@container style(--sm: true) {
  .element {
    font-size: 1.125rem;
    padding: var(--space-3);
  }
}

/* 768px以上（タブレット） */
@container style(--md: true) {
  .element {
    font-size: 1.25rem;
    padding: var(--space-4);
  }
}

/* 1024px以上（デスクトップ） */
@container style(--lg: true) {
  .element {
    font-size: 1.5rem;
    padding: var(--space-5);
  }
}

/* 1280px以上（大きいデスクトップ） */
@container style(--xl: true) {
  .element {
    font-size: 1.75rem;
    padding: var(--space-6);
  }
}

/* ❌ 従来の方法 - 直接メディアクエリを使用 */
@media (width >= 768px) {
  .element {
    font-size: 1.25rem;
  }
}
```

#### 3. 複数ブレイクポイントの組み合わせ

```css
/* タブレット以上かつデスクトップ未満 */
@container style(--md: true) and not style(--lg: true) {
  .element {
    /* タブレット専用スタイル */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* モバイルのみ（--smが設定されていない） */
@container not style(--sm: true) {
  .element {
    /* モバイル専用スタイル */
    display: block;
  }
}
```

#### 4. 実用例

```css
/* ナビゲーションの例 */
.navigation {
  /* モバイル: ハンバーガーメニュー */
  display: none;
}

.mobileMenuButton {
  display: block;
}

@container style(--md: true) {
  .navigation {
    /* タブレット以上: 横並びメニュー */
    display: flex;
    gap: var(--space-4);
  }
  
  .mobileMenuButton {
    display: none;
  }
}

/* グリッドレイアウトの例 */
.cardGrid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr; /* モバイル: 1列 */
}

@container style(--sm: true) {
  .cardGrid {
    grid-template-columns: repeat(2, 1fr); /* 小さいタブレット: 2列 */
  }
}

@container style(--lg: true) {
  .cardGrid {
    grid-template-columns: repeat(3, 1fr); /* デスクトップ: 3列 */
  }
}

@container style(--xl: true) {
  .cardGrid {
    grid-template-columns: repeat(4, 1fr); /* 大きいデスクトップ: 4列 */
  }
}
```

#### ネストルール（重要）

**`@container style()`は必ずクラス内にネストして記述すること。**

```css
/* ✅ 正しい - クラス内にネスト */
.element {
  /* デフォルト（モバイル）スタイル */
  font-size: 1rem;
  padding: var(--space-2);

  /* タブレット以上（768px以上） */
  @container style(--md: true) {
    font-size: 1.25rem;
    padding: var(--space-4);
  }

  /* デスクトップ以上（1024px以上） */
  @container style(--lg: true) {
    font-size: 1.5rem;
    padding: var(--space-5);
  }
}

/* ❌ 間違い - クラスの外に記述 */
.element {
  font-size: 1rem;
  padding: var(--space-2);
}

@container style(--md: true) {
  .element {
    font-size: 1.25rem;
    padding: var(--space-4);
  }
}
```

**理由**:
1. **可読性**: 関連するスタイルが1箇所にまとまる
2. **保守性**: クラスを削除する際に関連するブレイクポイントも一緒に削除できる
3. **一貫性**: 疑似クラス・疑似要素・メディアクエリと同じネストルールを適用
4. **CSS Nesting**: モダンなCSS Nestingの原則に従う

**複数のクラスで同じブレイクポイントを使用する場合も、それぞれのクラス内にネスト**:

```css
/* ✅ 正しい - 各クラス内にネスト */
.title {
  font-size: 1.5rem;

  @container style(--md: true) {
    font-size: 2rem;
  }
}

.description {
  font-size: 1rem;

  @container style(--md: true) {
    font-size: 1.125rem;
  }
}

/* ❌ 間違い - まとめて外出し */
.title {
  font-size: 1.5rem;
}

.description {
  font-size: 1rem;
}

@container style(--md: true) {
  .title {
    font-size: 2rem;
  }

  .description {
    font-size: 1.125rem;
  }
}
```

#### スタイルクエリの利点

1. **変数管理**: ブレイクポイントを一箇所で管理
2. **保守性**: ブレイクポイント変更時の影響範囲が明確
3. **可読性**: `@container style(--md: true)`は意図が分かりやすい
4. **組み合わせ**: 複数のブレイクポイントを組み合わせやすい
5. **一貫性**: プロジェクト全体で同じ変数名を使用

#### ブラウザサポート

- **Chrome**: 111+
- **Safari**: 16.4+
- **Firefox**: 103+
- すべてのモダンブラウザでサポート済み（2024年時点）

#### フォールバック

非対応ブラウザ向けのフォールバックは、従来のメディアクエリを併用：

```css
/* スタイルクエリ対応ブラウザ */
@supports (container-type: inline-size) {
  @container style(--md: true) {
    .element {
      font-size: 1.25rem;
    }
  }
}

/* 非対応ブラウザ向けフォールバック */
@supports not (container-type: inline-size) {
  @media (width >= 768px) {
    .element {
      font-size: 1.25rem;
    }
  }
}
```

**ブレークポイント**:
- `--sm: true`: 480px以上（小さいタブレット）
- `--md: true`: 768px以上（タブレット）
- `--lg: true`: 1024px以上（デスクトップ）
- `--xl: true`: 1280px以上（大きいデスクトップ）
- デフォルト: モバイル（479px以下）

**理由**:
1. **一貫性**: プロジェクト全体で同じ方向を使用
2. **モバイルファースト**: 基本スタイルをモバイル向けに書き、大きい画面向けに調整
3. **パフォーマンス**: 不要なスタイルを読み込まない
4. **保守性**: チーム開発で混乱しない
5. **変数管理**: ブレイクポイントを一箇所で管理できる

### コンテナクエリ（必須）

**コンポーネントのレスポンシブデザインは、必ずContainer Queryを使用すること。**

#### 基本原則

1. **Page/Layout ModuleでContainer定義**: ページやレイアウトでコンテナを定義
2. **Component ModuleでContainer Query使用**: コンポーネント内部のレイアウト変更に使用
3. **Media Queryは例外のみ**: グローバルなレイアウト（ヘッダー、フッターなど）のみMedia Query使用

#### コンテナの定義（Page/Layout Module）

**重要**: スタイルクエリ（`@container style()`）を使用するには、必ずコンテナ定義が必要です。

```css
/* app/page.module.css */
.main {
  /* メインコンテンツエリアをコンテナとして定義 */
  container-type: inline-size;
  container-name: page-main;
}

.worksSection {
  /* セクションごとにコンテナを定義 */
  container-type: inline-size;
  container-name: works-section;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding-inline: var(--content-padding);
}

.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}
```

#### Container Queryの使用（Component Module）

```css
/* components/WorksGrid/WorksGrid.module.css */
.worksGrid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

/* ✅ 正しい - Container Queryを使用 */
@container (width > 600px) {
  .worksGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (width > 900px) {
  .worksGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ❌ 間違い - コンポーネント内でMedia Queryを使用 */
@media (width < 768px) {
  .worksGrid {
    grid-template-columns: 1fr;
  }
}
```

#### 名前付きコンテナの使用

```css
/* 特定のコンテナを指定する場合 */
@container works-section (width > 800px) {
  .workCard {
    grid-column: span 2;
  }
}

@container sidebar (width > 300px) {
  .widget {
    display: block;
  }
}
```

#### Media Query vs Container Query の使い分け

**Media Queryを使うべき場合（例外）**:

```css
/* ✅ グローバルなレイアウト変更 */
/* components/Header/Header.module.css */
.header {
  @media (width < 768px) {
    position: fixed;
    top: 0;
  }
}

/* ✅ ビューポート依存の機能 */
.mobileMenu {
  @media (width < 768px) {
    display: block;
  }
  
  @media (width >= 768px) {
    display: none;
  }
}

/* ✅ デバイス特性 */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 44px;
  }
}
```

**Container Queryを使うべき場合（原則）**:

```css
/* ✅ コンポーネントの内部レイアウト */
/* components/WorkCard/WorkCard.module.css */
.workCard {
  display: flex;
  flex-direction: column;
}

@container (width > 400px) {
  .workCard {
    flex-direction: row;
  }
}

/* ✅ 再利用可能なコンポーネント */
/* components/Card/Card.module.css */
.card {
  padding: var(--space-2);
}

@container (width > 500px) {
  .card {
    padding: var(--space-4);
  }
}
```

#### コンテナ命名規則

- `page-main`: ページのメインコンテンツエリア
- `page-sidebar`: ページのサイドバー
- `{section-name}-section`: セクション（例: `works-section`, `about-section`）
- `{component-name}-container`: コンポーネント専用コンテナ（例: `card-container`）

#### 自己完結型コンポーネント（特殊ケース）

コンポーネント自身をコンテナにする場合：

```css
/* components/ComplexCard/ComplexCard.module.css */
.complexCard {
  /* 自分自身をコンテナにする */
  container-type: inline-size;
  display: flex;
  flex-direction: column;
}

/* 自分のサイズに応じて内部レイアウトを変更 */
@container (width > 400px) {
  .complexCard__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

#### ブラウザサポート

- Chrome 105+
- Safari 16+
- Firefox 110+
- すべてのモダンブラウザでサポート済み（2024年時点）

#### フォールバック

非対応ブラウザ向けのフォールバックは不要（モダンブラウザのみサポート）。ただし、古いブラウザをサポートする場合は`@supports`を使用：

```css
/* 古いブラウザ向けフォールバック */
.worksGrid {
  grid-template-columns: 1fr;
}

@media (width >= 768px) {
  .worksGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Container Query対応ブラウザ */
@supports (container-type: inline-size) {
  .worksGrid {
    grid-template-columns: 1fr;
  }
  
  @container (width > 600px) {
    .worksGrid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
```

## 🎯 コンポーネントスタイル

### アコーディオン（details/summary）

#### ::details-content 疑似要素を使用（推奨）

```css
/* ::details-content疑似要素を使用したアニメーション */
.accordion::details-content {
  transition:
    height var(--transition-default),
    opacity var(--transition-default),
    content-visibility var(--transition-default) allow-discrete;
  height: 0;
  opacity: 0;
  overflow: clip;
}

.accordion[open]::details-content {
  opacity: 1;
  height: auto;
}
```

#### 従来の方法

```css
/* コンテンツエリアのアニメーション */
.accordion-content {
  padding-inline: var(--spacing-lg);
  padding-block: 0;
  height: 0;
  overflow: hidden;
  transition:
    height var(--transition-default),
    padding-block var(--transition-default);
}

/* 開いた時のコンテンツ */
.accordion[open] .accordion-content {
  padding-block: var(--spacing-lg);
  height: auto;
  height: calc-size(auto, size);
}
```

### ボタンコンポーネント

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.primary {
  background-image: var(--primary-gradient);
  color: white;
}

.secondary {
  background-image: var(--secondary-gradient);
  color: white;
}
```

### カードコンポーネント

```css
.card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px 0 color-mix(in oklab, #000 5%, transparent);
}
```

## 🎨 アクセシビリティ

### ホバー効果の使用ルール（必須）

**クリック・タップできない要素にホバー効果を付けてはいけない。**

```css
/* ✅ 正しい - インタラクティブ要素にホバー効果 */
.button {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-hover);
    transform: translateY(-2px);
  }
}

.link {
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
}

/* ❌ 間違い - 非インタラクティブ要素にホバー効果 */
.skillTag {
  /* クリックできないのにホバー効果がある */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-md);
  }
}

.label {
  /* 単なる表示要素なのにホバー効果がある */
  &:hover {
    background: var(--color-hover);
  }
}
```

**理由**:
1. **ユーザーの期待を裏切らない**: ホバー効果があると「クリックできる」と期待させる
2. **混乱を避ける**: 機能がないのに反応すると、ユーザーを混乱させる
3. **アクセシビリティ**: スクリーンリーダーユーザーにとって、視覚的なフィードバックだけでは意味がない
4. **UX原則**: インタラクティブ性を示唆する視覚効果は、実際にインタラクティブな要素にのみ使用する

**例外**:
- カード全体がリンクの場合は、カードにホバー効果を付けてもよい
- ツールチップを表示する要素は、ホバー効果を付けてもよい

```css
/* ✅ 例外 - カード全体がリンク */
.cardLink {
  display: block;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--shadow-lg);
  }
}

/* ✅ 例外 - ツールチップを表示 */
.tooltipTrigger {
  position: relative;
  cursor: help;

  &:hover::after {
    content: attr(data-tooltip);
    /* ツールチップのスタイル */
  }
}
```

### フォーカス状態（必須）

**すべてのインタラクティブ要素には、必ずフォーカススタイルを定義すること。**

```css
/* ✅ 正しい - 基本的なフォーカススタイル */
.button {
  /* 通常のスタイル */

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ✅ 正しい - ラッパー要素内にフォーカス可能な要素がある場合 */
.customInput {
  /* ラッパーのスタイル */

  &:focus-within {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ❌ 間違い - フォーカススタイルがない */
.button {
  &:hover {
    background: var(--color-primary);
  }
  /* :focus-visible が定義されていない */
}
```

### フォーカススタイルのチェックリスト

インタラクティブ要素を作成する際は、以下を必ず確認：

1. **`:focus-visible`を定義**
   - `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`など
   - キーボード操作でフォーカスされた時に表示される

2. **`:focus-within`を定義**（必要な場合）
   - カスタムコンポーネントで内部要素がフォーカスを受け取る場合
   - 例: `<label>`内に`<input>`がある場合

3. **アウトラインの仕様**
   - `outline: 2px solid var(--color-primary)`
   - `outline-offset: 2px`
   - 色はプライマリカラーを使用

4. **マウス操作時は非表示**
   - `:focus-visible`を使用することで、マウスクリック時は表示されない
   - キーボード操作時のみ表示される

### よくある間違いと対策

```css
/* ❌ 間違い1: outline: none を使用 */
.button {
  outline: none; /* アクセシビリティ違反 */
}

/* ✅ 正しい: デフォルトのアウトラインを上書き */
.button {
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ❌ 間違い2: :focus のみ定義（マウスクリック時も表示される） */
.button {
  &:focus {
    outline: 2px solid var(--color-primary);
  }
}

/* ✅ 正しい: :focus-visible を使用 */
.button {
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ❌ 間違い3: カスタムコンポーネントでフォーカススタイルがない */
.customColorPicker {
  /* label要素のスタイル */
  cursor: pointer;
  
  /* input要素は opacity: 0 で非表示 */
  /* フォーカススタイルが定義されていない */
}

/* ✅ 正しい: :focus-within を使用 */
.customColorPicker {
  cursor: pointer;

  &:focus-within {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

### 特殊ケース: label + input でinputを隠す場合

カスタムデザインのために、inputを`opacity: 0`で隠してlabelでボタンを表現する場合：

```tsx
// HTML構造
<label htmlFor="custom-input" className={styles.customLabel}>
  <svg>...</svg>
</label>
<input id="custom-input" type="color" className={styles.customInput} />
```

```css
/* ✅ 正しい実装 */
.customLabel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;

  /* inputにフォーカスが当たった時、labelにアウトラインを表示 */
  &:has(+ input:focus-visible) {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:hover {
    background-color: var(--color-gray-100);
  }
}

.customInput {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* labelにhoverを通す */
}
```

**重要なポイント**:

1. **`:has(+ input:focus-visible)`を使用**
   - inputにフォーカスが当たった時、labelにアウトラインを表示
   - `+`は隣接兄弟セレクタ（label の直後のinput）

2. **`pointer-events: none`を設定**
   - inputがlabelの上に重なっていても、マウスイベントをlabelに通す
   - hoverやclickがlabelで機能する

3. **`position: absolute; inset: 0;`で配置**
   - inputをlabelと同じ位置・サイズに配置
   - Tabキーでフォーカス可能な状態を維持

4. **`opacity: 0`で非表示**
   - `display: none`や`visibility: hidden`は使わない
   - フォーカス可能な状態を保つ

### アクセシビリティチェック手順

新しいインタラクティブ要素を作成したら、以下を確認：

1. **Tabキーでフォーカス可能か**
   - ブラウザでTabキーを押して、要素にフォーカスできるか確認

2. **フォーカス時にアウトラインが表示されるか**
   - キーボードでフォーカスした時に、視覚的なフィードバックがあるか
   - label + input の場合、labelにアウトラインが表示されるか

3. **マウスクリック時はアウトラインが表示されないか**
   - `:focus-visible`を使用していれば、マウス操作時は非表示

4. **hover表現が機能するか**
   - inputが上に重なっている場合、`pointer-events: none`を設定しているか

5. **カスタムコンポーネントの場合**
   - 内部要素がフォーカスを受け取る場合、`:focus-within`または`:has()`を使用しているか

### モーション配慮

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### カラーコントラスト

- 最低4.5:1のコントラスト比を維持
- カラーだけでなく、形状やテキストでも情報を伝達

### リンクスタイル（グローバル設定）

**すべてのリンク（`<a>`タグ）のスタイルは`globals.css`で統一的に定義します。**

```css
/* globals.css */

/* リンクの基本スタイル */
a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease, opacity 0.2s ease;
}

a:hover {
  color: var(--color-primary);
  opacity: 0.8;
}

a:active {
  opacity: 0.6;
}

/* フォーカススタイル */
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  a {
    transition: none;
  }
}
```

**ルール**:

1. ✅ **グローバル定義**: リンクスタイルは`globals.css`で定義
2. ✅ **color: inherit**: 親要素の色を継承（コンテキストに応じた色）
3. ✅ **ホバー時**: プライマリカラーに変化 + 透明度80%
4. ✅ **アクティブ時**: 透明度60%（押下感）
5. ✅ **トランジション**: 0.2s ease（素早く自然な変化）
6. ✅ **アクセシビリティ**: フォーカス表示とモーション削減対応
7. ❌ **個別定義禁止**: コンポーネント内で独自のリンクスタイルを定義しない

**例外**:

特別なデザインが必要な場合のみ、コンポーネント内で上書き可能：

```css
/* 特別なボタンリンク */
.buttonLink {
  color: white;
  background: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.buttonLink:hover {
  opacity: 0.9;
  color: white; /* 色を維持 */
}
```

## 📝 重要なルール

### 1. CSS Nestingを積極的に使用する（推奨）

**疑似クラス、疑似要素、メディアクエリは必ずネストして書く。**

```css
/* ✅ 正しい - CSS Nestingを使用 */
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  transition: all 0.2s;
  
  &:hover {
    background: var(--color-primary-hover);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (width < 768px) {
    padding: var(--space-2) var(--space-3);
    font-size: 0.875rem;
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
}

/* ❌ 間違い - フラットに書いている */
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  transition: all 0.2s;
}

.button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.button:active {
  transform: translateY(0);
}

@media (width < 768px) {
  .button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.875rem;
  }
}
```

**メリット**:
- 関連するスタイルが1箇所にまとまり、可読性が向上
- メンテナンスが容易（クラスを削除する際に関連スタイルも一緒に削除できる）
- コードの重複が減る
- スタイルの関係性が明確になる

### 2. 色設定ルール（必須）

```css
/* ✅ 正しい - CSS変数 + HEX形式 + color-mix()で半透明 */
:root {
  --color-primary: #3b82f6;
  --color-primary-soft: color-mix(in oklab, var(--color-primary) 20%, transparent);
}

.title {
  background-image: var(--primary-gradient);
  color: var(--text-primary);
  box-shadow: 0 4px 12px var(--color-primary-soft);
}

/* ❌ 間違い - 直接色を指定 */
.title {
  background-image: linear-gradient(in oklab to right, #3b82f6, #9333ea);
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* ❌ 間違い - rgb()形式やrgba()を使用 */
:root {
  --color-primary: rgb(59 130 246);
  --color-overlay: rgba(59, 130, 246, 0.2);
}
```

### 3. @property の使用

- ブラウザサポートが限定的なため、通常のCSSアニメーションを優先
- 必要に応じて使用する場合は、適切なフォールバックを提供
- `initial-value`でCSS変数を使用する場合は構文エラーに注意

### 4. width 設定の優先順位

- `width: 100%`の代わりに`width: stretch`を使用
- ベンダープレフィックス付きで全ブラウザ対応を確保
- マージンがある場合は特に`stretch`が有効

### 5. calc-size() 関数の活用

- アコーディオンなどの可変高さ要素のアニメーションに活用
- フォールバックとして`auto`を先に記述
- 固有サイズの変更には対応しないため注意

### 6. interpolate-size プロパティ（必須）

- `:root`で`interpolate-size: allow-keywords`を設定
- 固有サイズの設定キーワードをアニメーション可能にする
- `height: auto`などの設定キーワードがアニメーション可能になる
- アコーディオンやドロップダウンなどの可変高さ要素のアニメーションに必須

### 7. text-autospace プロパティ（必須）

- `body`に`text-autospace: normal`を設定
- 日本語と英語の間に自動的にスペースを挿入
- 手動でスペースを入れる必要がなくなり、メンテナンス性が向上
- グローバルに設定することで、プロジェクト全体で適用

### 8. text-box プロパティ（必須）

- `body`に`text-box: trim-both cap alphabetic`を設定
- テキストボックスの余白をトリミングして、より正確な配置を実現
- 行頭と行末の余白を削除し、デザインの精度を向上
- グローバルに設定することで、プロジェクト全体で適用

### 9. Container Query の使用（必須）

- **コンポーネントのレスポンシブデザインは必ずContainer Queryを使用**
- Page/Layout ModuleでContainer定義（`container-type: inline-size`）
- Component ModuleでContainer Query使用（`@container (width > 600px)`）
- Media Queryはグローバルなレイアウト変更のみ使用（ヘッダー、フッターなど）
- コンテナ名は明確に（`page-main`, `works-section`など）

### 10. 文字詰めの活用

- デフォルトではグローバル適用しない（可読性を優先）
- 見出しやUIラベルなど、強めに詰めたい箇所のみユーティリティクラスで適用
- `palt`と`pwid`は似て非なる指定。グローバル同時使用は避ける

## 🚀 ベストプラクティス

### 1. モジュラー設計

- コンポーネント単位でスタイルを分離
- 再利用可能なクラスを作成

### 2. 一貫性の維持

- デザインシステムに従う
- 命名規則を統一（camelCase）

### 3. パフォーマンス考慮

- 不要なスタイルを削除
- 効率的なセレクタを使用
- GPU加速を活用（`transform: translateZ(0)`）

### 4. メンテナンス性

- 読みやすいコードを書く
- 適切なコメントを追加
- ネストを深くしすぎない（最大3階層）

## 📋 コーディング規約

### コメント

```css
/* ===== セクション区切り ===== */

/* 説明コメント */
.button {
  /* ホバー時のアニメーション */
  transition: all 0.3s ease;
}
```

### インデント

- 2スペースでインデント
- 一貫したインデントを維持

### セレクタ順序

1. ベーススタイル
2. 状態スタイル（:hover, :focus等）
3. レスポンシブスタイル


## 📐 CSS記述順序ルール

### クラスの記述順序

**親要素から子要素へ、兄要素から弟要素へ、DOM構造に沿って記述する。**

```css
/* ✅ 正しい - DOM構造に沿った順序 */
.container {
  /* 親要素 */
}

.section {
  /* 親要素の子要素 */
}

.sectionInner {
  /* sectionの子要素 */
}

.header {
  /* 第1子 */
}

.main {
  /* 第2子（headerの弟） */
}

.footer {
  /* 第3子（mainの弟） */
}

/* ❌ 間違い - 順序がバラバラ */
.footer {
  /* 第3子が先に書かれている */
}

.container {
  /* 親要素が後に書かれている */
}

.header {
  /* 第1子が最後に書かれている */
}
```

### メディアクエリの記述順序

**クラス単位でメディアクエリをまとめて記述する。**

```css
/* ✅ 正しい - クラスごとにメディアクエリをまとめる */
.title {
  font-size: 1.5rem;
  color: var(--color-text);
}

@media (width < 768px) {
  .title {
    font-size: 1.25rem;
  }
}

@media (width >= 768px) {
  .title {
    font-size: 1.75rem;
  }
}

@media (width >= 1024px) {
  .title {
    font-size: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .title {
    transition: none;
  }
}

.description {
  font-size: 1rem;
  line-height: 1.6;
}

@media (width >= 768px) {
  .description {
    font-size: 1.125rem;
  }
}

/* ❌ 間違い - メディアクエリをまとめて記述 */
.title {
  font-size: 1.5rem;
}

.description {
  font-size: 1rem;
}

@media (width >= 768px) {
  .title {
    font-size: 1.75rem;
  }

  .description {
    font-size: 1.125rem;
  }
}
```

**メリット**:
- 同じクラスのスタイルが1箇所にまとまり、メンテナンスしやすい
- クラスを探すときに、関連するメディアクエリもすぐに見つかる
- クラスを削除するときに、関連するメディアクエリも一緒に削除できる

## 🏷️ BEM命名規則

### BEMの基本

**Block__Element--Modifier** の形式でクラス名を付ける。

- **Block**: 独立したコンポーネント（`.card`, `.button`, `.header`）
- **Element**: Blockの一部（`.card__title`, `.button__icon`）
- **Modifier**: BlockやElementのバリエーション（`.button--primary`, `.card--large`）

### Block名の命名規則（重要）

**Block名 = ファイル名 = コンポーネント名**

この原則により、以下のメリットがあります：
- ファイル名からBlock名を予測できる
- クラス名からどのファイルを修正すればいいか予測できる
- コードの可読性と保守性が向上

```
例：
- ファイル名: Header.tsx / Header.module.css
  → Block名: .header
  → Element: .header__logo, .header__iconList, .header__iconLink

- ファイル名: WorkCard.tsx / WorkCard.module.css
  → Block名: .workCard
  → Element: .workCard__image, .workCard__title, .workCard__tags

- ファイル名: Footer.tsx / Footer.module.css
  → Block名: .footer
  → Element: .footer__socialList, .footer__copyright
```

### Element命名の判断基準（重要）

**依存関係に基づいて命名方法を使い分ける：**

#### 1. `block__element` (アンダースコア2つ): 親Blockに依存する要素

親Blockなしでは意味をなさない、密接に結びついた要素に使用。

```css
/* ✅ 正しい - 親に依存する要素 */
.chatPanel { }
.chatPanel__backdrop { }          /* パネルの背景 */

.chatPanelHeader { }              /* 独立したサブコンポーネント */
.chatPanelHeader__title { }       /* ヘッダーのタイトル */
.chatPanelHeader__closeButton { } /* ヘッダーの閉じるボタン */

.chatPanelForm { }                /* 独立したサブコンポーネント */
.chatPanelForm__input { }         /* フォームの入力欄 */
.chatPanelForm__sendButton { }    /* フォームの送信ボタン */

.chatPanelMessage { }             /* 独立したサブコンポーネント */
.chatPanelMessage__content { }    /* メッセージの内容 */
.chatPanelMessage__time { }       /* メッセージの時刻 */
```

#### 2. `blockElement` (camelCase): 独立したサブコンポーネント

単独でも意味を持ち、再利用可能なサブコンポーネントに使用。

```css
/* ✅ 正しい - 独立したサブコンポーネント */
.chatPanel { }
.chatPanelHeader { }    /* ヘッダーは独立したコンポーネント */
.chatPanelMessages { }  /* メッセージエリアは独立したコンポーネント */
.chatPanelForm { }      /* フォームは独立したコンポーネント */
```

#### 3. `block--modifier` (ハイフン2つ): バリエーション

BlockやElementの状態やバリエーションを表現。

```css
/* ✅ 正しい - Modifierの使用 */
.chatPanelMessage { }
.chatPanelMessage--user { }       /* ユーザーメッセージ */
.chatPanelMessage--assistant { }  /* アシスタントメッセージ */

.button { }
.button--primary { }              /* プライマリボタン */
.button--secondary { }            /* セカンダリボタン */
```

### 実装例の比較

```css
/* ❌ 間違い - すべてBlockとして扱っている */
.chatPanel { }
.chatPanelHeader { }
.chatPanelHeaderTitle { }
.chatPanelHeaderCloseButton { }
.chatPanelMessages { }
.chatPanelMessagesEmpty { }
.chatPanelMessage { }
.chatPanelMessageContent { }
.chatPanelMessageTime { }

/* ✅ 正しい - 依存関係を明確に表現 */
.chatPanel { }
.chatPanel__backdrop { }

.chatPanelHeader { }              /* 独立したサブコンポーネント */
.chatPanelHeader__title { }       /* ヘッダーに依存 */
.chatPanelHeader__closeButton { } /* ヘッダーに依存 */

.chatPanelMessages { }            /* 独立したサブコンポーネント */
.chatPanelMessages__empty { }     /* メッセージエリアに依存 */

.chatPanelMessage { }             /* 独立したサブコンポーネント */
.chatPanelMessage--user { }       /* Modifier */
.chatPanelMessage--assistant { }  /* Modifier */
.chatPanelMessage__content { }    /* メッセージに依存 */
.chatPanelMessage__time { }       /* メッセージに依存 */
```

### CSS Modulesでの適用

CSS Modulesを使用する場合、以下のルールに従う：

```css
/* ✅ 正しい - BEM + 依存関係を明確に */
/* ファイル名: WorkCard.module.css */
.workCard {
  /* Block */
}

.workCard__image {
  /* Element: workCardに依存 */
}

.workCard__title {
  /* Element: workCardに依存 */
}

.workCard__content {
  /* Element: workCardに依存 */
}

.workCard__tags {
  /* Element: workCardに依存 */
}

.workCard--featured {
  /* Modifier: 注目作品 */
}

/* ❌ 間違い - ファイル名と一致しない */
/* ファイル名: WorkCard.module.css */
.card {
  /* Block名がファイル名と異なる */
}

.title {
  /* どのBlockのtitleか不明 */
}

.primary {
  /* 何のprimaryか不明 */
}
```

### 命名規則の例

```css
/* Button Component */
.button {
  /* Block */
}

.button__icon {
  /* Element: ボタンに依存 */
}

.button__text {
  /* Element: ボタンに依存 */
}

.button--primary {
  /* Modifier: プライマリボタン */
}

.button--secondary {
  /* Modifier: セカンダリボタン */
}

.button--large {
  /* Modifier: 大きいボタン */
}

.button--small {
  /* Modifier: 小さいボタン */
}

/* Card Component */
.card {
  /* Block */
}

.card__image {
  /* Element: カードに依存 */
}

.card__title {
  /* Element: カードに依存 */
}

.card__description {
  /* Element: カードに依存 */
}

.card--featured {
  /* Modifier: 注目カード */
}

/* Modal Component - 複雑な例 */
.modal {
  /* Block */
}

.modal__backdrop {
  /* Element: モーダルに依存 */
}

.modalContent {
  /* 独立したサブコンポーネント */
}

.modalContent__header {
  /* コンテンツに依存 */
}

.modalContent__body {
  /* コンテンツに依存 */
}

.modalContent__footer {
  /* コンテンツに依存 */
}
```

### TSXでの使用例

```tsx
// ✅ 正しい - BEM命名規則に従った使用
<div className={styles.card}>
  <img className={styles.card__image} src="..." alt="..." />
  <h3 className={styles.card__title}>Title</h3>
  <p className={styles.card__description}>Description</p>
</div>

// Modifierの適用（ハイフンを含むクラス名はブラケット記法）
<div className={`${styles.card} ${styles['card--featured']}`}>
  ...
</div>

// 独立したサブコンポーネントの例
<div className={styles.chatPanel}>
  <div className={styles.chatPanelHeader}>
    <h2 className={styles.chatPanelHeader__title}>Title</h2>
    <button className={styles.chatPanelHeader__closeButton}>×</button>
  </div>
  <div className={styles.chatPanelMessages}>
    <div className={`${styles.chatPanelMessage} ${styles['chatPanelMessage--user']}`}>
      <div className={styles.chatPanelMessage__content}>Hello</div>
      <time className={styles.chatPanelMessage__time}>12:00</time>
    </div>
  </div>
</div>

// ❌ 間違い - 汎用的すぎるクラス名
<div className={styles.card}>
  <img className={styles.image} src="..." alt="..." />
  <h3 className={styles.title}>Title</h3>
  <p className={styles.description}>Description</p>
</div>
```

### ルールまとめ

1. ✅ **Block名 = ファイル名**: Block名はファイル名と一致させる
2. ✅ **依存関係を明確に**: 
   - 親に依存する要素: `block__element` (アンダースコア2つ)
   - 独立したサブコンポーネント: `blockElement` (camelCase)
   - バリエーション: `block--modifier` (ハイフン2つ)
3. ✅ **明確な命名**: クラス名だけで何のコンポーネントか分かるようにする
4. ✅ **一貫性**: プロジェクト全体で同じ命名規則を使用
5. ✅ **フラットな構造**: セレクタのネストを避け、単一クラスで指定する
6. ✅ **最大2階層**: Elementのネストは最大2階層まで（例: `.block__element__subelement`）
7. ❌ **汎用的な名前を避ける**: `.title`, `.image`, `.button`などの単独使用は避ける
8. ❌ **詳細度を高めない**: `.photoSection .name`のようなネストセレクタは禁止

### 詳細度を高めないルール

**クラスの下にクラスを作って詳細度を高めるやり方は禁止。**

```css
/* ❌ 間違い - ネストセレクタで詳細度を高めている */
.photoSection .name {
  text-align: center;
  margin-bottom: 0;
}

.photoSection .title {
  text-align: center;
  margin-bottom: 0;
}

/* ✅ 正しい - 単一クラスで指定 */
.photoSection__name {
  text-align: center;
  margin-bottom: 0;
}

.photoSection__title {
  text-align: center;
  margin-bottom: 0;
}
```

**理由**:
- 詳細度が高くなると、上書きが困難になる
- スタイルの優先順位が複雑になり、メンテナンスしづらい
- BEMの原則に反する（フラットな構造を保つ）
- CSS Modulesの利点（スコープの分離）を活かせない

**例外**:
- 疑似要素（`::before`, `::after`）
- 疑似クラス（`:hover`, `:focus`, `:active`など）
- 子孫セレクタが必要な場合は、新しいElementクラスを作成する

### CSS Nesting（ネスト記法）

**モダンブラウザでは、疑似クラスや疑似要素をネストして書くことができます。**

```css
/* ✅ 正しい - 疑似クラスのネスト */
.button {
  background: var(--color-primary);
  transition: background 0.2s;
  
  &:hover {
    background: var(--color-primary-hover);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ✅ 正しい - 疑似要素のネスト */
.card {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
  }
  
  &::after {
    content: '';
    display: block;
  }
}

/* ✅ 正しい - メディアクエリのネスト */
.title {
  font-size: 2rem;
  
  @media (width < 768px) {
    font-size: 1.5rem;
  }
  
  @media (width >= 1024px) {
    font-size: 2.5rem;
  }
}

/* ❌ 間違い - 子孫セレクタのネスト（詳細度が上がる） */
.card {
  padding: 1rem;
  
  .title {  /* これは .card .title になり詳細度が上がる */
    font-size: 1.5rem;
  }
}

/* ✅ 正しい - BEMで明示的に定義 */
.card {
  padding: 1rem;
}

.card__title {
  font-size: 1.5rem;
}
```

**CSS Nestingのルール**:

1. ✅ **疑似クラス・疑似要素のネストはOK**: `:hover`, `:focus`, `::before`, `::after`など
2. ✅ **メディアクエリのネストはOK**: `@media`をクラス内にネスト可能
3. ✅ **`@starting-style`のネストはOK**: 初期状態の定義をクラス内にネスト可能
4. ❌ **`@supports`は必ず外出し**: ネスト不可、クラスの外に記述する
5. ❌ **`@keyframes`は必ず外出し**: ネスト不可、クラスの外に記述する
6. ❌ **子孫セレクタのネストは禁止**: 詳細度が上がるため、BEMで明示的に定義する
7. ✅ **`&`記号を使用**: 親セレクタを参照する際は`&`を使う

**ブラウザサポート**:
- Chrome 112+
- Safari 16.5+
- Firefox 117+
- すべてのモダンブラウザでサポート済み（2024年時点）

### @starting-style の使用（初期状態の定義）

**要素が初めてDOMに追加される時の初期状態を定義する。**

```css
/* ✅ 正しい - @starting-styleをネスト */
.header {
  position: fixed;
  top: 0;
  transition: translate 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  
  @starting-style {
    translate: 0 -120%;
    opacity: 0;
  }
}

/* ✅ 正しい - 複数のプロパティをアニメーション */
.modal {
  opacity: 1;
  scale: 1;
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
    scale: 0.9;
  }
}

/* ❌ 間違い - transitionがない */
.element {
  @starting-style {
    opacity: 0; /* transitionがないのでアニメーションしない */
  }
}
```

**使用例**:
- ヘッダーが画面外から登場
- モーダルがフェードイン＋スケールイン
- サイドバーがスライドイン
- 通知がポップアップ

**重要なポイント**:
- `@starting-style`は要素が**初めてDOMに追加される時**のみ適用
- 必ず`transition`と組み合わせて使用
- `@media (prefers-reduced-motion: reduce)`で無効化すること

### ✅ ネストできる特殊セレクタ

以下のセレクタは**ネスト可能**です：

```css
/* ✅ 正しい - 疑似要素のネスト */
.chatPanel {
  background: white;
  
  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
  }
  
  &::before {
    content: '';
    position: absolute;
  }
}

/* ✅ 正しい - 属性セレクタのネスト */
.chatPanel {
  opacity: 0;
  
  &[popover] {
    transition: opacity 0.3s;
    
    &:popover-open {
      opacity: 1;
    }
    
    &::backdrop {
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
  
  &[popover]:popover-open::backdrop {
    opacity: 1;
  }
}

/* ✅ 正しい - 複雑なネスト */
.modal {
  &[popover] {
    opacity: 0;
    scale: 0.95;
    
    @starting-style {
      opacity: 0;
      scale: 0.95;
    }
    
    &:popover-open {
      opacity: 1;
      scale: 1;
    }
    
    &::backdrop {
      opacity: 0;
      
      @starting-style {
        opacity: 0;
      }
    }
    
    &:popover-open::backdrop {
      opacity: 1;
    }
    
    @media (prefers-reduced-motion: reduce) {
      transition: none;
      
      &::backdrop {
        transition: none;
      }
    }
  }
}
```

**ネスト可能なセレクタ**:
- 疑似クラス（`:hover`, `:focus`, `:active`, `:popover-open`など）
- 疑似要素（`::before`, `::after`, `::backdrop`など）
- 属性セレクタ（`[popover]`, `[open]`, `[disabled]`など）
- メディアクエリ（`@media`）
- `@starting-style`

### ❌ ネストできないルール（必ず外出し）

以下のルールは**必ずクラスの外に記述**してください：

```css
/* ❌ 間違い - @supportsをネスト */
.element {
  color: red;
  
  @supports (animation-timeline: view()) {
    animation: fadeIn 1s;
  }
}

/* ✅ 正しい - @supportsを外出し */
.element {
  color: red;
}

@supports (animation-timeline: view()) {
  .element {
    animation: fadeIn 1s;
  }
}

/* ❌ 間違い - @keyframesをネスト */
.element {
  animation: fadeIn 1s;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

/* ✅ 正しい - @keyframesを外出し */
.element {
  animation: fadeIn 1s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**理由**:
- `@supports`と`@keyframes`はCSS Nestingの仕様でネストがサポートされていない
- ネストすると、ブラウザが正しく解釈できず、スタイルが適用されない
- 必ずクラスの外に記述することで、確実に動作する

## 🆕 モダンCSS記法（推奨）

### display の複数値記法（推奨）

**外側と内側のレイアウトモードを明示的に指定する。**

```css
/* ✅ 推奨 - モダンな複数値記法 */
.container {
  display: block flex; /* 外側: block、内側: flex */
}

.grid {
  display: block grid; /* 外側: block、内側: grid */
}

.inlineGrid {
  display: inline grid; /* 外側: inline、内側: grid */
}

.inlineFlex {
  display: inline flex; /* 外側: inline、内側: flex */
}

/* ✅ 従来の記法（引き続きサポート） */
.container {
  display: flex; /* 暗黙的に block flex と同じ */
}

.grid {
  display: grid; /* 暗黙的に block grid と同じ */
}

.inlineGrid {
  display: inline-grid; /* inline grid と同じ */
}

.inlineFlex {
  display: inline-flex; /* inline flex と同じ */
}
```

**複数値記法の利点**:
- **明示性**: 外側と内側のレイアウトモードが明確
- **理解しやすさ**: 要素がどのように振る舞うかが一目で分かる
- **将来性**: CSS仕様の方向性に沿った記法
- **互換性**: 非対応ブラウザでは従来の記法として解釈される

**記法の対応表**:

| 従来の記法 | モダンな複数値記法 | 意味 |
|-----------|------------------|------|
| `display: flex` | `display: block flex` | 外側はブロック、内側はフレックス |
| `display: grid` | `display: block grid` | 外側はブロック、内側はグリッド |
| `display: inline-flex` | `display: inline flex` | 外側はインライン、内側はフレックス |
| `display: inline-grid` | `display: inline grid` | 外側はインライン、内側はグリッド |
| `display: flow-root` | `display: block flow-root` | 外側はブロック、内側はフローレイアウト（BFC作成） |
| `display: contents` | `display: contents` | 単一値（外側・内側の概念なし） |

### 特殊なdisplay値の扱い

#### flow-root の複数値記法

```css
/* ✅ 推奨 - モダンな複数値記法 */
.clearfix {
  display: block flow-root; /* 外側: block、内側: flow-root（BFC作成） */
}

.inlineFlowRoot {
  display: inline flow-root; /* 外側: inline、内側: flow-root */
}

/* ✅ 従来の記法（引き続きサポート） */
.clearfix {
  display: flow-root; /* 暗黙的に block flow-root と同じ */
}
```

**flow-root の用途**:
- **BFC（Block Formatting Context）の作成**: フロートのクリアフィックス
- **マージンの相殺防止**: 子要素のマージンが親要素に影響しない
- **包含ブロックの作成**: 絶対配置要素の基準点

```css
/* フロートのクリアフィックス */
.container {
  display: block flow-root; /* 子要素のfloatを包含 */
}

.container .floated {
  float: left;
  width: 50%;
}

/* マージンの相殺防止 */
.section {
  display: block flow-root; /* 子要素のmarginが外に出ない */
}

.section .content {
  margin-top: 2rem; /* 親要素に影響しない */
}
```

#### contents の扱い

```css
/* ✅ contents は単一値のみ */
.wrapper {
  display: contents; /* 要素自体を透明化、子要素のみ表示 */
}

/* ❌ 間違い - contents に複数値記法は適用されない */
.wrapper {
  display: block contents; /* 無効な記法 */
}
```

**contents の用途**:
- **レイアウトの透明化**: 要素自体は表示せず、子要素のみ表示
- **グリッドやフレックスの階層をフラット化**: 中間要素を無視してレイアウト

```css
/* グリッドレイアウトでの使用例 */
.grid {
  display: block grid;
  grid-template-columns: repeat(3, 1fr);
}

.gridSection {
  display: contents; /* この要素は無視され、子要素が直接グリッドアイテムになる */
}

.gridItem {
  /* 直接グリッドアイテムとして扱われる */
}
```

#### その他の特殊値

```css
/* table系の複数値記法 */
.table {
  display: block table; /* 外側: block、内側: table */
}

.inlineTable {
  display: inline table; /* 外側: inline、内側: table */
}

/* list-item の複数値記法 */
.listItem {
  display: block list-item; /* 外側: block、内側: list-item */
}

.inlineListItem {
  display: inline list-item; /* 外側: inline、内側: list-item */
}

/* ruby系の複数値記法 */
.ruby {
  display: inline ruby; /* 外側: inline、内側: ruby */
}
```

**ブラウザサポート**:
- Chrome 115+
- Safari 16.4+
- Firefox 70+
- すべてのモダンブラウザでサポート済み（2024年時点）

### nth-child() の of 記法（推奨）

**特定のセレクタにマッチする要素の中での順序を指定する。**

```css
/* ✅ 推奨 - of記法を使用 */
.item:nth-child(2 of .highlight) {
  /* .highlightクラスを持つ要素の中で2番目 */
  background: var(--color-primary);
}

.card:nth-child(odd of .featured) {
  /* .featuredクラスを持つ要素の中で奇数番目 */
  margin-right: auto;
}

.button:nth-child(3n of .primary) {
  /* .primaryクラスを持つ要素の中で3の倍数番目 */
  margin-bottom: var(--space-4);
}

/* ✅ 従来の記法（引き続きサポート） */
.item:nth-child(2) {
  /* 全ての子要素の中で2番目 */
  background: var(--color-primary);
}

.card:nth-child(odd) {
  /* 全ての子要素の中で奇数番目 */
  margin-right: auto;
}
```

**of記法の利点**:
- **柔軟性**: 特定のクラスやセレクタを持つ要素のみを対象にできる
- **保守性**: HTMLの構造が変わっても、対象要素の順序は維持される
- **直感性**: 「〇〇クラスの中で△番目」という自然な表現

**使用例**:

```css
/* 特定のクラスを持つ要素の中での順序 */
.workCard:nth-child(1 of .featured) {
  /* 注目作品の中で1番目 */
  grid-column: 1 / -1;
}

.workCard:nth-child(2 of .featured) {
  /* 注目作品の中で2番目 */
  grid-row: span 2;
}

/* 複雑なセレクタとの組み合わせ */
.button:nth-child(even of .primary, .secondary) {
  /* プライマリまたはセカンダリボタンの中で偶数番目 */
  margin-left: var(--space-2);
}

/* 属性セレクタとの組み合わせ */
.input:nth-child(3 of [required]) {
  /* 必須入力フィールドの中で3番目 */
  border-color: var(--color-warning);
}
```

**ブラウザサポート**:
- Chrome 111+
- Safari 16.4+
- Firefox 113+
- すべてのモダンブラウザでサポート済み（2024年時点）

### 実装ガイドライン

**新しいコンポーネントを作成する際は、モダンな記法を優先して使用する。**

```css
/* ✅ 推奨 - モダンな記法を使用 */
.cardGrid {
  display: block grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.cardGrid .card:nth-child(1 of .featured) {
  grid-column: 1 / -1;
  display: block flex;
  flex-direction: row;
}

.cardGrid .card:nth-child(n+2 of .featured) {
  display: block flex;
  flex-direction: column;
}

/* ✅ 従来の記法も引き続き使用可能 */
.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.cardGrid .card.featured:first-child {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
}
```

### 実用的な使用例

```css
/* BFC作成によるフロートクリア */
.cardContainer {
  display: block flow-root; /* 子要素のfloatを包含 */
  padding: var(--space-4);
}

.cardContainer .card {
  float: left;
  width: calc(50% - var(--space-2));
  margin-right: var(--space-4);
}

/* グリッドレイアウトでのcontents使用 */
.worksGrid {
  display: block grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.worksCategory {
  display: contents; /* カテゴリ要素を透明化、作品が直接グリッドアイテムに */
}

.workCard {
  /* 直接グリッドアイテムとして配置される */
  padding: var(--space-4);
  border-radius: 8px;
}

/* テーブルレイアウトの複数値記法 */
.dataTable {
  display: block table;
  width: 100%;
  border-collapse: collapse;
}

.tableRow {
  display: block table-row;
}

.tableCell {
  display: block table-cell;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
}
```

**使い分けの指針**:

1. **新規作成**: モダンな記法を優先
2. **既存修正**: 従来の記法のままでも問題なし
3. **チーム統一**: プロジェクト内で記法を統一する
4. **可読性重視**: より理解しやすい記法を選択
5. **特殊値の理解**: `contents`は単一値、`flow-root`は複数値記法対応

## 📋 CSS記述ルール チェックリスト

新しいCSSファイルを作成する際は、以下を確認：

- [ ] **CSS Nesting**: 疑似クラス・疑似要素・メディアクエリをネストして記述している
- [ ] **クラスの記述順序**: 親→子、兄→弟の順番で記述している
- [ ] **BEM命名規則**: 依存関係に基づいて適切に命名している
  - [ ] Block名 = ファイル名
  - [ ] 親に依存する要素: `block__element` (アンダースコア2つ)
  - [ ] 独立したサブコンポーネント: `blockElement` (camelCase)
  - [ ] バリエーション: `block--modifier` (ハイフン2つ)
- [ ] **明確な命名**: クラス名だけで何のコンポーネントか分かる
- [ ] **一貫性**: プロジェクト全体で同じ命名規則を使用している
- [ ] **フラットな構造**: 子孫セレクタで詳細度を高めていない
- [ ] **モダンCSS記法（推奨）**:
  - [ ] displayの複数値記法を使用している（`display: block flex`など）
  - [ ] nth-child()のof記法を使用している（`:nth-child(2 of .class)`など）
- [ ] **色設定ルール（必須）**: 
  - [ ] すべての色はCSS変数で定義している
  - [ ] 色は#000000形式（6桁HEX）で定義している
  - [ ] 半透明色はcolor-mix()関数でtransparentと混ぜている
  - [ ] color-mix()ではoklab色空間を使用している
  - [ ] rgba()やrgb()形式を使用していない
- [ ] **CSS変数**: 色やスペーシングにCSS変数を使用している
- [ ] **Container Query**: コンテナ定義とスタイルクエリを適切に使用している
  - [ ] **コンテナ定義**: Page/Layout Moduleで`container-type: inline-size`を設定している
  - [ ] **スタイルクエリ**: `@container style(--md: true)`をクラス内にネストしている
  - [ ] **Media Query制限**: グローバルなレイアウトのみMedia Queryを使用している
