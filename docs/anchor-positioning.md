# Anchor Positioning API 実装ガイド

このドキュメントは、要素を別の要素に対して相対的に配置する際に、Anchor Positioning APIを使用する方法を定義します。

## 概要

Anchor Positioning APIは、ある要素（アンカー）を基準に別の要素を配置するためのネイティブCSS機能です。従来の絶対配置やJavaScriptによる位置計算と比較して、以下の利点があります。

## Anchor Positioning APIを使うべきケース

以下のUIコンポーネントを実装する際は、Anchor Positioning APIの使用を検討すること：

1. **ツールチップ・ポップオーバー**
   - ボタンに対するツールチップ
   - 入力フィールドに対するヘルプテキスト
   - アイコンに対する説明

2. **ドロップダウン・メニュー**
   - ボタンに対するドロップダウン
   - セレクトメニュー
   - コンテキストメニュー

3. **Popoverとの組み合わせ**
   - FABボタンに対するチャットパネル
   - アクションボタンに対するモーダル
   - トリガー要素に対するダイアログ

4. **フローティングUI**
   - 固定要素に対する相対配置
   - スクロール時も追従する要素

## Anchor Positioning APIの利点

### 1. 自動位置計算

```css
/* ❌ 手動実装 - JavaScriptで位置を計算 */
const button = document.getElementById('button');
const tooltip = document.getElementById('tooltip');
const rect = button.getBoundingClientRect();
tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
tooltip.style.left = `${rect.left}px`;

/* ✅ Anchor Positioning API - CSSで自動計算 */
.tooltip {
  position: fixed;
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px);
  left: anchor(left);
}
```

### 2. レスポンシブ対応

```css
/* ✅ 画面サイズに応じて自動調整 */
.tooltip {
  position-anchor: --button-anchor;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0; /* 中央揃え */
}

/* 画面外にはみ出す場合は自動調整 */
@supports (anchor-name: --test) {
  .tooltip {
    position-try-fallbacks: flip-block, flip-inline;
  }
}
```

### 3. スクロール追従

```css
/* ✅ アンカー要素がスクロールしても自動追従 */
.tooltip {
  position: fixed;
  position-anchor: --button-anchor;
  /* アンカーが移動すると自動的に追従 */
}
```

## 基本的な実装パターン

### 1. アンカー要素の定義

```tsx
// React: インラインスタイルで定義（型定義の問題を回避）
<button
  id="anchor-button"
  style={{ anchorName: '--button-anchor' } as React.CSSProperties}
>
  ボタン
</button>

// または CSS Modulesで定義
<button id="anchor-button" className={styles.button}>
  ボタン
</button>
```

```css
/* CSS Modules */
.button {
  anchor-name: --button-anchor;
}
```

### 2. 配置される要素の定義

```css
.tooltip {
  position: fixed;
  position-anchor: --button-anchor;
  
  /* アンカーの上に配置 */
  bottom: calc(anchor(top) + 8px);
  left: anchor(left);
}
```

### 3. Popover APIとの組み合わせ

```tsx
// FABボタン（アンカー）
<button
  id="chat-fab"
  popoverTarget="chat-panel"
  style={{ anchorName: '--chat-fab-anchor' } as React.CSSProperties}
>
  <Icon name="chat" />
</button>

// チャットパネル（Popover + Anchor Positioning）
<div id="chat-panel" popover="auto" className={styles.chatPanel}>
  {/* コンテンツ */}
</div>
```

```css
.chatPanel {
  position: fixed;
  position-anchor: --chat-fab-anchor;
  inset: unset;
  
  /* FABボタンの上に、右端を揃えて配置 */
  bottom: calc(anchor(top) + var(--space-2));
  right: anchor(right);
}
```

## anchor()関数の使い方

### 基本構文

```css
anchor(<anchor-side>)
anchor(<anchor-side>, <fallback>)
```

### アンカーサイド

- `top`: アンカーの上端
- `bottom`: アンカーの下端
- `left`: アンカーの左端
- `right`: アンカーの右端
- `center`: アンカーの中央
- `start`: アンカーの開始位置（書字方向に依存）
- `end`: アンカーの終了位置（書字方向に依存）

### 配置パターン

#### 上に配置

```css
.tooltip {
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px); /* ボタンの上に8px空けて配置 */
  left: anchor(left);
}
```

#### 下に配置

```css
.tooltip {
  position-anchor: --button-anchor;
  top: calc(anchor(bottom) + 8px); /* ボタンの下に8px空けて配置 */
  left: anchor(left);
}
```

#### 右に配置

```css
.tooltip {
  position-anchor: --button-anchor;
  left: calc(anchor(right) + 8px); /* ボタンの右に8px空けて配置 */
  top: anchor(top);
}
```

#### 左に配置

```css
.tooltip {
  position-anchor: --button-anchor;
  right: calc(anchor(left) + 8px); /* ボタンの左に8px空けて配置 */
  top: anchor(top);
}
```

#### 中央揃え

```css
.tooltip {
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px);
  left: anchor(center);
  translate: -50% 0; /* 自身の幅の半分だけ左に移動 */
}
```

## 実装例

### 1. ツールチップ

```tsx
// HTML
<button
  id="help-button"
  style={{ anchorName: '--help-anchor' } as React.CSSProperties}
>
  ?
</button>

<div className={styles.tooltip}>
  ヘルプテキスト
</div>
```

```css
/* CSS */
.tooltip {
  position: fixed;
  position-anchor: --help-anchor;
  
  /* ボタンの上に中央揃えで配置 */
  bottom: calc(anchor(top) + 8px);
  left: anchor(center);
  translate: -50% 0;
  
  /* スタイル */
  background: var(--color-surface);
  padding: var(--space-2);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-md);
  white-space: nowrap;
}
```

### 2. ドロップダウンメニュー

```tsx
// HTML
<button
  id="menu-button"
  popoverTarget="menu"
  style={{ anchorName: '--menu-anchor' } as React.CSSProperties}
>
  メニュー
</button>

<div id="menu" popover="auto" className={styles.menu}>
  <ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
  </ul>
</div>
```

```css
/* CSS */
.menu {
  position: fixed;
  position-anchor: --menu-anchor;
  inset: unset;
  
  /* ボタンの下に、左端を揃えて配置 */
  top: calc(anchor(bottom) + 4px);
  left: anchor(left);
  
  /* スタイル */
  min-width: anchor-size(width); /* アンカーと同じ幅 */
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-md);
}
```

### 3. チャットパネル（FABボタン基準）

```tsx
// HTML
<button
  id="chat-fab"
  popoverTarget="chat-panel"
  style={{ anchorName: '--chat-fab-anchor' } as React.CSSProperties}
>
  <Icon name="chat" />
</button>

<div id="chat-panel" popover="auto" className={styles.chatPanel}>
  {/* チャットUI */}
</div>
```

```css
/* CSS */
.chatPanel {
  position: fixed;
  position-anchor: --chat-fab-anchor;
  inset: unset;
  
  /* FABボタンの上に、右端を揃えて配置 */
  bottom: calc(anchor(top) + var(--space-2));
  right: anchor(right);
  
  /* サイズ */
  width: min(90vw, 480px);
  max-height: min(80vh, 600px);
}
```

## anchor-size()関数

アンカー要素のサイズを取得する関数。

```css
/* アンカーと同じ幅にする */
.dropdown {
  min-width: anchor-size(width);
}

/* アンカーと同じ高さにする */
.sidebar {
  height: anchor-size(height);
}

/* アンカーの幅の2倍にする */
.expanded {
  width: calc(anchor-size(width) * 2);
}
```

## フォールバック対応

### @supportsを使用

```css
/* Anchor Positioning API対応ブラウザ */
@supports (anchor-name: --test) {
  .tooltip {
    position: fixed;
    position-anchor: --button-anchor;
    bottom: calc(anchor(top) + 8px);
    left: anchor(left);
  }
}

/* 非対応ブラウザ向けフォールバック */
@supports not (anchor-name: --test) {
  .tooltip {
    position: fixed;
    bottom: 100px; /* 固定位置 */
    left: 20px;
  }
}
```

### フォールバック値

```css
/* anchor()関数の第2引数にフォールバック値を指定 */
.tooltip {
  bottom: anchor(top, 100px); /* アンカーがない場合は100px */
  left: anchor(left, 20px);   /* アンカーがない場合は20px */
}
```

## position-try-fallbacks（自動調整）

画面外にはみ出す場合の自動調整。

```css
.tooltip {
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px);
  left: anchor(center);
  translate: -50% 0;
  
  /* 画面外にはみ出す場合は反転 */
  position-try-fallbacks: flip-block, flip-inline;
}
```

### フォールバックオプション

- `flip-block`: 上下反転
- `flip-inline`: 左右反転
- `flip-start`: 開始位置に反転
- カスタム位置: `@position-try`で定義

```css
/* カスタムフォールバック */
@position-try --bottom-left {
  top: calc(anchor(bottom) + 8px);
  left: anchor(left);
}

.tooltip {
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px);
  right: anchor(right);
  
  position-try-fallbacks: --bottom-left, flip-block;
}
```

## レスポンシブ対応

```css
/* デスクトップ */
.tooltip {
  position-anchor: --button-anchor;
  bottom: calc(anchor(top) + 8px);
  left: anchor(center);
  translate: -50% 0;
}

/* モバイル */
@media (width < 768px) {
  .tooltip {
    /* モバイルでは左端揃え */
    left: anchor(left);
    translate: 0 0;
  }
}
```

## ブラウザサポート

- **Chrome**: 125+
- **Edge**: 125+
- **Safari**: 未対応（2024年12月時点）
- **Firefox**: 未対応（2024年12月時点）

### 重要な注意点

- **Safari非対応**: 必ずフォールバックを実装すること
- **プログレッシブエンハンスメント**: 基本機能は非対応ブラウザでも動作するように

## トラブルシューティング

### アンカーが効かない

1. **anchor-nameの確認**: アンカー要素に`anchor-name`が設定されているか
2. **position-anchorの確認**: 配置される要素に`position-anchor`が設定されているか
3. **position: fixedの確認**: 配置される要素が`position: fixed`になっているか
4. **ブラウザサポート**: 対応ブラウザを使用しているか

### 位置がずれる

1. **inset: unsetの確認**: 他の位置指定をリセットしているか
2. **calc()の使用**: スペースを追加する場合は`calc()`を使用
3. **translate**: 中央揃えの場合は`translate`を使用

### Reactで型エラーが出る

```tsx
// ✅ 正しい - as React.CSSPropertiesでキャスト
<button
  style={{ anchorName: '--button-anchor' } as React.CSSProperties}
>
  ボタン
</button>

// ❌ 間違い - 型エラーが発生
<button
  style={{ anchorName: '--button-anchor' }}
>
  ボタン
</button>
```

## 禁止事項

❌ **やってはいけないこと：**

- JavaScriptで位置を計算する（Anchor Positioning APIが自動処理）
- `position: absolute`を使用する（`position: fixed`を使用）
- `inset`を設定したまま`anchor()`を使用する（`inset: unset`でリセット）
- Safari非対応を無視する（必ずフォールバックを実装）
- アンカー名を動的に変更する（パフォーマンス低下の原因）

## ベストプラクティス

### 1. Popover APIと組み合わせる

```tsx
// ✅ 推奨 - Popover + Anchor Positioning
<button
  popoverTarget="menu"
  style={{ anchorName: '--menu-anchor' } as React.CSSProperties}
>
  メニュー
</button>

<div id="menu" popover="auto" className={styles.menu}>
  {/* コンテンツ */}
</div>
```

### 2. フォールバックを必ず実装

```css
/* ✅ 必須 - フォールバック実装 */
@supports not (anchor-name: --test) {
  .tooltip {
    position: fixed;
    bottom: 100px;
    left: 20px;
  }
}
```

### 3. calc()でスペースを追加

```css
/* ✅ 推奨 - calc()でスペースを追加 */
.tooltip {
  bottom: calc(anchor(top) + 8px);
}

/* ❌ 非推奨 - marginは効かない場合がある */
.tooltip {
  bottom: anchor(top);
  margin-bottom: 8px;
}
```

### 4. 命名規則

```css
/* ✅ 推奨 - 明確な命名 */
anchor-name: --button-anchor;
anchor-name: --menu-trigger-anchor;
anchor-name: --chat-fab-anchor;

/* ❌ 非推奨 - 曖昧な命名 */
anchor-name: --anchor;
anchor-name: --a1;
```

## まとめ

Anchor Positioning APIを使用することで、以下のメリットがあります：

- ✅ **コードの簡素化**: JavaScriptによる位置計算が不要
- ✅ **自動追従**: アンカー要素がスクロールしても自動追従
- ✅ **レスポンシブ対応**: 画面サイズに応じて自動調整
- ✅ **パフォーマンス**: ブラウザネイティブ機能のため高速
- ✅ **保守性**: CSSのみで完結するため、メンテナンスが容易

ツールチップ、ドロップダウン、Popoverなどの相対配置が必要なUIを実装する際は、Anchor Positioning APIの使用を検討してください。ただし、Safari非対応のため、必ずフォールバックを実装すること。
