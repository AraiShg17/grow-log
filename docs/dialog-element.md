# `<dialog>` 要素 実装ガイド

このドキュメントは、モーダルダイアログを実装する際に、`<dialog>`要素を使用する方法を定義します。

## 概要

`<dialog>`要素は、モーダルダイアログやダイアログボックスを実装するためのネイティブHTML要素です。Popover APIと比較して、より強制力のあるUIを実現します。

## `<dialog>` vs Popover API

### 使い分けの基準

| 項目 | `<dialog>` | Popover API |
|------|-----------|-------------|
| **主目的** | モーダル（重要な操作を行うためのUI） | 付随的なポップアップ（ツールチップ、メニューなど） |
| **背景操作** | `showModal()`で不可になる（モーダル） | 基本的に背景操作できる |
| **表示制御** | JSメソッド（`show()`, `showModal()`, `close()`）が主 | HTML属性だけでも開閉できる |
| **フォーカストラップ** | あり（モーダル中はフォーカスが逃げない） | なし（通常の要素と同じ） |
| **用途の強さ** | 強制力のあるUI | 補助的で軽いUI |
| **代表的な用途** | 削除確認、ログインモーダル、フォーム | メニュー、ドロップダウン、吹き出し、ツールチップ |

### `<dialog>`を使うべき場合

- ✅ ユーザーに**必ず見てもらいたい・操作してもらいたい**とき
- ✅ 背景を管理し、UIを一時的にロックしたいとき
- ✅ 削除確認、ログインフォームなど**重要度の高いUI**
- ✅ 「今はこのダイアログに集中してほしい」という用途

### Popover APIを使うべき場合

- ✅ ユーザーの作業を止めずに情報を補足したいとき
- ✅ ある要素に紐づいてポップアップを出したいとき
- ✅ ツールチップ、メニュー、詳細表示など**軽いUI**を作りたいとき
- ✅ 特定の要素に関連した「小さくて軽い」UI

## `<dialog>`の利点

### 1. 自動フォーカス管理（モーダル時）

```tsx
// ✅ dialog要素 - 自動でフォーカストラップ
<dialog ref={dialogRef}>
  <form method="dialog">
    <input type="text" />
    <button>閉じる</button>
  </form>
</dialog>

// showModal()を呼ぶと、自動的にフォーカストラップが有効になる
dialogRef.current?.showModal();
```

### 2. 背景の自動inert化（モーダル時）

```tsx
// ✅ dialog要素 - showModal()で背景操作不可
dialogRef.current?.showModal();
// 背景の要素は自動的にinert（操作不可）になる
```

### 3. Escapeキーで自動的に閉じる

```tsx
// ✅ dialog要素 - Escapeキーで自動的に閉じる
<dialog ref={dialogRef}>
  {/* Escapeキーで自動的に閉じる */}
</dialog>
```

### 4. ネイティブ::backdrop疑似要素

```css
/* ✅ dialog要素 - ::backdrop疑似要素で背景を制御 */
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}
```

### 5. アクセシビリティの自動対応

```tsx
// ✅ dialog要素 - ブラウザが自動的にARIA属性を管理
<dialog>
  {/* role="dialog"、aria-modal="true"が自動設定 */}
</dialog>
```

## 基本的な実装パターン

### 1. モーダルダイアログ（推奨）

```tsx
'use client';

import { useRef } from 'react';
import styles from './ConfirmDialog.module.css';

export function ConfirmDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button onClick={openDialog}>削除</button>

      <dialog ref={dialogRef} className={styles.dialog}>
        <div className={styles.dialogContent}>
          <h2>確認</h2>
          <p>本当に削除しますか？</p>
          <div className={styles.dialogActions}>
            <button onClick={closeDialog}>キャンセル</button>
            <button onClick={() => {
              // 削除処理
              closeDialog();
            }}>
              削除
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
```

### 2. CSS実装

```css
/* dialog要素 */
.dialog {
  width: min(90vw, 480px);
  max-height: 80vh;
  background: var(--color-surface);
  border-radius: 16px;
  border: none;
  padding: 0;
  box-shadow: 0 8px 32px var(--shadow-xl);
  
  /* 中央配置 */
  position: fixed;
  inset: unset;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  
  /* スクロールチェーン回避（必須） */
  overscroll-behavior: contain;
}

/* Backdrop */
.dialog::backdrop {
  background: color-mix(in oklab, var(--color-background) 20%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* スクロールチェーン回避（必須） */
  overflow: hidden;
  overscroll-behavior: contain;
}

/* アニメーション */
.dialog {
  opacity: 0;
  scale: 0.95;
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  /* スクロールチェーン回避（必須） */
  overscroll-behavior: contain;
  
  @starting-style {
    opacity: 0;
    scale: 0.95;
  }
}

.dialog[open] {
  opacity: 1;
  scale: 1;
}

.dialog::backdrop {
  opacity: 0;
  transition:
    opacity 0.3s ease,
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  /* スクロールチェーン回避（必須） */
  overflow: hidden;
  overscroll-behavior: contain;
  
  @starting-style {
    opacity: 0;
  }
}

.dialog[open]::backdrop {
  opacity: 1;
}

/* モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  .dialog,
  .dialog::backdrop {
    transition: none;
  }
  
  @starting-style {
    .dialog[open] {
      opacity: 1;
      scale: 1;
    }
    
    .dialog[open]::backdrop {
      opacity: 1;
    }
  }
}
```

### 3. コンテンツのスタイル

```css
.dialogContent {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dialogActions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}
```

## show() vs showModal()

### showModal()（推奨）

```tsx
// ✅ 推奨 - モーダルとして表示
dialogRef.current?.showModal();
```

**特徴**:
- 背景が自動的にinert（操作不可）になる
- フォーカストラップが有効になる
- Escapeキーで閉じられる
- `::backdrop`疑似要素が表示される
- モーダルダイアログとして動作

### show()（非推奨）

```tsx
// ❌ 非推奨 - 非モーダルとして表示
dialogRef.current?.show();
```

**特徴**:
- 背景は操作可能
- フォーカストラップなし
- `::backdrop`疑似要素が表示されない
- 非モーダルダイアログとして動作
- **ほとんどの場合、Popover APIの方が適している**

**ルール**: 非モーダルダイアログが必要な場合は、`show()`ではなくPopover APIを使用すること。

## form method="dialog"

```tsx
// ✅ 推奨 - form method="dialog"を使用
<dialog ref={dialogRef}>
  <form method="dialog">
    <h2>確認</h2>
    <p>本当に削除しますか？</p>
    <div>
      <button value="cancel">キャンセル</button>
      <button value="confirm">削除</button>
    </div>
  </form>
</dialog>
```

**特徴**:
- フォーム送信時に自動的にダイアログが閉じる
- `returnValue`プロパティでボタンの値を取得できる
- `close`イベントで結果を処理できる

```tsx
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  const handleClose = () => {
    if (dialog.returnValue === 'confirm') {
      // 削除処理
    }
  };

  dialog.addEventListener('close', handleClose);
  return () => dialog.removeEventListener('close', handleClose);
}, []);
```

## イベント処理

### closeイベント

```tsx
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  const handleClose = () => {
    console.log('Dialog closed');
  };

  dialog.addEventListener('close', handleClose);
  return () => dialog.removeEventListener('close', handleClose);
}, []);
```

### cancelイベント（Escapeキー）

```tsx
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  const handleCancel = (e: Event) => {
    // Escapeキーで閉じる前の処理
    console.log('Dialog cancelled');
    // e.preventDefault()で閉じるのを防ぐこともできる
  };

  dialog.addEventListener('cancel', handleCancel);
  return () => dialog.removeEventListener('cancel', handleCancel);
}, []);
```

## アニメーションパターン

### フェードイン・スケールイン

```css
.dialog {
  opacity: 0;
  scale: 0.95;
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  /* スクロールチェーン回避（必須） */
  overscroll-behavior: contain;
  
  @starting-style {
    opacity: 0;
    scale: 0.95;
  }
}

.dialog[open] {
  opacity: 1;
  scale: 1;
}

.dialog::backdrop {
  /* スクロールチェーン回避（必須） */
  overflow: hidden;
  overscroll-behavior: contain;
}
```

### スライドイン（下から）

```css
.dialog {
  opacity: 0;
  translate: 0 100%;
  transition:
    opacity 0.3s ease,
    translate 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  /* スクロールチェーン回避（必須） */
  overscroll-behavior: contain;
  
  @starting-style {
    opacity: 0;
    translate: 0 100%;
  }
}

.dialog[open] {
  opacity: 1;
  translate: 0 0;
}

.dialog::backdrop {
  /* スクロールチェーン回避（必須） */
  overflow: hidden;
  overscroll-behavior: contain;
}
```

## スクロールチェーン（連鎖）の回避（必須）

### 問題

モーダルが開いている間、ダイアログ内でスクロールすると、背景のページまでスクロールしてしまう問題（スクロールチェーン）が発生します。

### 解決方法（Chrome 144+）

```css
/* ✅ 必須 - スクロールチェーン回避 */
.dialog {
  overscroll-behavior: contain;
}

.dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

**重要なポイント**:

1. **`dialog`に`overscroll-behavior: contain`を設定**
   - ダイアログ内のスクロールが背景に伝播しないようにする

2. **`::backdrop`に`overflow: hidden`を設定（必須）**
   - `::backdrop`をスクロール不可のスクロールコンテナにする
   - これがないとスクロールチェーン回避が機能しない

3. **`::backdrop`に`overscroll-behavior: contain`を設定**
   - 背景のスクロールを完全にブロック

### ブラウザサポート

- **Chrome**: 144+
- **Edge**: 144+
- **Safari**: 未対応（2024年12月時点）
- **Firefox**: 未対応（2024年12月時点）

### フォールバック（古いブラウザ向け）

古いブラウザでは、JavaScriptで`body`のスクロールを無効化する必要があります：

```tsx
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  const handleOpen = () => {
    // モーダルが開いたらbodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    // モーダルが閉じたらbodyのスクロールを復元
    document.body.style.overflow = '';
  };

  dialog.addEventListener('open', handleOpen);
  dialog.addEventListener('close', handleClose);

  return () => {
    dialog.removeEventListener('open', handleOpen);
    dialog.removeEventListener('close', handleClose);
    document.body.style.overflow = ''; // クリーンアップ
  };
}, []);
```

**注意**: Chrome 144+では、CSSだけで解決できるため、JavaScriptによるフォールバックは不要です。

## レスポンシブ対応

### モバイルでフルスクリーン

```css
.dialog {
  width: min(90vw, 480px);
  max-height: 80vh;
}

@media (width < 768px) {
  .dialog {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    top: 0;
    left: 0;
    translate: 0 0;
  }
}
```

## トラブルシューティング

### ダイアログが開かない

1. **refの確認**: `useRef<HTMLDialogElement>(null)`を使用しているか
2. **showModal()の確認**: `show()`ではなく`showModal()`を使用しているか
3. **クライアントコンポーネント**: `'use client'`を追加しているか

### アニメーションが動作しない

1. **[open]セレクタの確認**: `[open]`セレクタが正しく記述されているか
2. **transitionの確認**: `overlay`と`display`に`allow-discrete`が設定されているか
3. **@starting-styleの確認**: `@starting-style`が正しく記述されているか

### フォーカスが移動しない

1. **showModal()の確認**: `show()`ではなく`showModal()`を使用しているか
2. **フォーカス可能な要素**: ダイアログ内にフォーカス可能な要素があるか

## 禁止事項

❌ **やってはいけないこと：**

- 非モーダルダイアログに`show()`を使用する（Popover APIを使用すること）
- 手動でフォーカストラップを実装する（`showModal()`が自動処理）
- 手動でEscapeキーのハンドリングを実装する（`showModal()`が自動処理）
- backdrop要素を手動で作成する（`::backdrop`疑似要素を使用）
- z-indexで最上位に配置する（Top Layerが自動処理）
- `role="dialog"`や`aria-modal`を手動で設定する（ブラウザが自動設定）
- **`::backdrop`に`overflow: hidden`を設定しない**（スクロールチェーン回避に必須）
- **`dialog`と`::backdrop`に`overscroll-behavior: contain`を設定しない**（スクロールチェーン回避に必須）

## ベストプラクティス

### 1. showModal()を優先

```tsx
// ✅ 推奨 - モーダルとして表示
dialogRef.current?.showModal();

// ❌ 非推奨 - 非モーダルとして表示
dialogRef.current?.show();
```

### 2. form method="dialog"を活用

```tsx
// ✅ 推奨 - form method="dialog"を使用
<dialog ref={dialogRef}>
  <form method="dialog">
    <button value="cancel">キャンセル</button>
    <button value="confirm">確認</button>
  </form>
</dialog>
```

### 3. スクロールチェーン回避は必須

```css
/* ✅ 必須 - スクロールチェーン回避 */
.dialog {
  overscroll-behavior: contain;
}

.dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}

/* ❌ 間違い - スクロールチェーン回避なし */
.dialog {
  /* overscroll-behaviorがないと、背景がスクロールする */
}

.dialog::backdrop {
  /* overflow: hiddenがないと、スクロールチェーン回避が機能しない */
}
```

### 4. アニメーションは必須

```css
/* ✅ 推奨 - アニメーションを設定 */
.dialog {
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
}

/* ❌ 非推奨 - アニメーションなし */
.dialog {
  /* アニメーションがないと、突然表示される */
}
```

### 4. モーション削減対応

```css
/* ✅ 必須 - モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  .dialog,
  .dialog::backdrop {
    transition: none;
  }
  
  @starting-style {
    .dialog[open] {
      opacity: 1;
      scale: 1;
    }
  }
}
```

### 5. 明確な閉じるボタン

```tsx
// ✅ 推奨 - 明確な閉じるボタン
<dialog ref={dialogRef}>
  <button onClick={() => dialogRef.current?.close()}>
    ×
  </button>
  {/* コンテンツ */}
</dialog>
```

## ブラウザサポート

- **Chrome**: 37+
- **Edge**: 79+
- **Safari**: 15.4+
- **Firefox**: 98+

すべてのモダンブラウザでサポート済み（2024年時点）。

## まとめ

`<dialog>`要素を使用することで、以下のメリットがあります：

- ✅ **コードの簡素化**: 複雑なフォーカストラップやEscapeキーのハンドリングが不要
- ✅ **アクセシビリティ**: ブラウザが自動的にARIA属性を管理
- ✅ **パフォーマンス**: Top Layerによる効率的なレンダリング
- ✅ **保守性**: ブラウザネイティブ機能のため、将来的なアップデートに対応
- ✅ **一貫性**: すべてのモーダルダイアログで同じパターンを使用

モーダルダイアログを実装する際は、必ず`<dialog>`要素を使用してください。非モーダルダイアログが必要な場合は、Popover APIを使用してください。
