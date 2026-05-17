# Popover API 実装ガイド（Invoker Commands対応）

このドキュメントは、モーダル・ダイアログ・ドロップダウンなどのオーバーレイUIを実装する際に、Popover APIとInvoker Commands APIを使用する方法を定義します。

## 概要

Popover APIは、オーバーレイUI（モーダル、ダイアログ、ドロップダウンなど）をネイティブブラウザ機能で実装するためのAPIです。最新のInvoker Commands API（`command`/`commandfor`属性）と組み合わせることで、JavaScriptを使わずにHTML属性のみで制御できます。

## Invoker Commands APIを使うべきケース（推奨）

以下のUIコンポーネントを実装する際は、**Invoker Commands APIを使用すること**：

1. **モーダル・ダイアログ**
   - チャットパネル
   - 確認ダイアログ
   - フォームダイアログ
   - 画像ビューア

2. **ドロップダウン・メニュー**
   - ナビゲーションメニュー
   - コンテキストメニュー
   - セレクトメニュー

3. **ツールチップ・ポップオーバー**
   - ヘルプツールチップ（`interestfor`属性使用）
   - 情報ポップオーバー
   - アクションメニュー

4. **サイドパネル・ドロワー**
   - サイドバー
   - 設定パネル
   - フィルターパネル

## Popover APIの利点

### 1. 自動フォーカス管理

```tsx
// ❌ 手動実装 - 複雑なフォーカストラップが必要
useEffect(() => {
  if (!isOpen || !panelRef.current) return;

  const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen, messages]);

// ✅ Popover API - 自動でフォーカストラップ
<div popover="auto">
  {/* ブラウザが自動的にフォーカスを管理 */}
</div>
```

### 2. Escapeキーで自動的に閉じる

```tsx
// ❌ 手動実装 - Escapeキーのハンドリングが必要
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);

// ✅ Popover API - 自動でEscapeキーに対応
<div popover="auto">
  {/* Escapeキーで自動的に閉じる */}
</div>
```

### 3. Top Layer（最上位レイヤー）

```css
/* ❌ 手動実装 - z-indexの管理が必要 */
.modal {
  position: fixed;
  z-index: 9999; /* 他の要素より上に表示されるか不確実 */
  isolation: isolate;
}

.backdrop {
  position: fixed;
  z-index: 9998;
}

/* ✅ Popover API - Top Layerで自動的に最上位に表示 */
.modal[popover] {
  /* z-indexの指定不要、常に最上位に表示される */
}
```

### 4. ネイティブbackdrop要素

```tsx
// ❌ 手動実装 - backdrop要素を手動で作成
<>
  <div className={styles.backdrop} onClick={onClose} />
  <div className={styles.modal}>
    {/* コンテンツ */}
  </div>
</>

// ✅ Popover API - ::backdrop疑似要素で自動生成
<div popover="auto" className={styles.modal}>
  {/* コンテンツ */}
</div>

/* CSS */
.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}
```

### 5. アクセシビリティの自動対応

```tsx
// ❌ 手動実装 - ARIA属性を手動で管理
<div
  role="dialog"
  aria-modal="true"
  aria-label="チャットボット"
  aria-hidden={!isOpen}
>
  {/* コンテンツ */}
</div>

// ✅ Popover API - ブラウザが自動的にARIA属性を管理
<div popover="auto">
  {/* ブラウザが適切なARIA属性を自動設定 */}
</div>
```

## 基本的な実装パターン

### 1. モーダル・ダイアログ

```tsx
// トリガーボタン（command属性を使用）
<button command="show-popover modal-id" interestfor="modal-id">
  モーダルを開く
</button>

// Popover要素
<div id="modal-id" popover="auto" className={styles.modal}>
  <div className={styles.modalHeader}>
    <h2>タイトル</h2>
    <button command="hide-popover modal-id" interestfor="modal-id">
      ×
    </button>
  </div>
  <div className={styles.modalContent}>
    {/* コンテンツ */}
  </div>
</div>
```

### 2. CSS実装

```css
/* Popover要素 */
.modal {
  width: min(90vw, 480px);
  max-height: 80vh;
  background: var(--color-surface);
  border-radius: 16px;
  border: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 8px 32px var(--shadow-xl);
  
  /* 中央配置 */
  position: fixed;
  inset: unset;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}

/* Backdrop */
.modal::backdrop {
  background: color-mix(in oklab, var(--color-background) 20%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* アニメーション */
.modal[popover] {
  opacity: 0;
  scale: 0.95;
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
    scale: 0.95;
  }
}

.modal[popover]:popover-open {
  opacity: 1;
  scale: 1;
}

.modal[popover]::backdrop {
  opacity: 0;
  transition:
    opacity 0.3s ease,
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
  }
}

.modal[popover]:popover-open::backdrop {
  opacity: 1;
}

/* モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  .modal[popover],
  .modal[popover]::backdrop {
    transition: none;
  }
  
  @starting-style {
    .modal[popover]:popover-open {
      opacity: 1;
      scale: 1;
    }
    
    .modal[popover]:popover-open::backdrop {
      opacity: 1;
    }
  }
}
```

### 3. TypeScript型定義

```tsx
// React 18.3時点では、command/interestfor属性の型定義がないため、@ts-expect-errorを使用
<div
  // @ts-expect-error - popover is not yet in React types
  popover="auto"
  id="modal-id"
>
  {/* コンテンツ */}
</div>

<button
  // @ts-expect-error - command is not yet in React types
  command="show-popover modal-id"
  // @ts-expect-error - interestfor is not yet in React types
  interestfor="modal-id"
>
  開く
</button>
```

## Popover属性の種類

### popover属性

- `popover="auto"`: 自動的に他のpopoverを閉じる（推奨）
- `popover="manual"`: 手動で閉じる必要がある（特殊ケースのみ）

```tsx
// ✅ 推奨 - auto（他のpopoverを自動的に閉じる）
<div popover="auto">
  {/* 他のpopoverが開いている場合、自動的に閉じる */}
</div>

// ⚠️ 特殊ケース - manual（手動で閉じる必要がある）
<div popover="manual">
  {/* 複数のpopoverを同時に開きたい場合のみ使用 */}
</div>
```

### popoverTarget属性

- トリガーボタンに設定する属性
- 対象のpopover要素のIDを指定

```tsx
<button popoverTarget="modal-id">
  開く
</button>

<div id="modal-id" popover="auto">
  {/* コンテンツ */}
</div>
```

### popoverTargetAction属性

- `show`: popoverを開く（デフォルト）
- `hide`: popoverを閉じる
- `toggle`: popoverを開閉する

```tsx
// 開くボタン
<button popoverTarget="modal-id" popoverTargetAction="show">
  開く
</button>

// 閉じるボタン
<button popoverTarget="modal-id" popoverTargetAction="hide">
  閉じる
</button>

// トグルボタン（デフォルト）
<button popoverTarget="modal-id">
  開閉
</button>
```

## JavaScriptでの制御

### toggle イベント

```tsx
useEffect(() => {
  const panel = panelRef.current;
  if (!panel) return;

  const handleToggle = (e: Event) => {
    const popoverEvent = e as ToggleEvent;
    if (popoverEvent.newState === 'open') {
      // Popoverが開いた時の処理
      console.log('Popover opened');
    } else if (popoverEvent.newState === 'closed') {
      // Popoverが閉じた時の処理
      console.log('Popover closed');
    }
  };

  panel.addEventListener('toggle', handleToggle);
  return () => panel.removeEventListener('toggle', handleToggle);
}, []);
```

### プログラムで開閉

```tsx
const panelRef = useRef<HTMLDivElement>(null);

// 開く
const openPopover = () => {
  panelRef.current?.showPopover();
};

// 閉じる
const closePopover = () => {
  panelRef.current?.hidePopover();
};

// トグル
const togglePopover = () => {
  panelRef.current?.togglePopover();
};
```

## アニメーションパターン

### フェードイン・スケールイン

```css
.modal[popover] {
  opacity: 0;
  scale: 0.95;
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
    scale: 0.95;
  }
}

.modal[popover]:popover-open {
  opacity: 1;
  scale: 1;
}
```

### スライドイン（下から）

```css
.modal[popover] {
  opacity: 0;
  translate: 0 100%;
  transition:
    opacity 0.3s ease,
    translate 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
    translate: 0 100%;
  }
}

.modal[popover]:popover-open {
  opacity: 1;
  translate: 0 0;
}
```

### スライドイン（右から）

```css
.drawer[popover] {
  opacity: 0;
  translate: 100% 0;
  transition:
    opacity 0.3s ease,
    translate 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
  
  @starting-style {
    opacity: 0;
    translate: 100% 0;
  }
}

.drawer[popover]:popover-open {
  opacity: 1;
  translate: 0 0;
}
```

## レスポンシブ対応

### モバイルでフルスクリーン

```css
.modal {
  width: min(90vw, 480px);
  max-height: 80vh;
}

@media (width < 768px) {
  .modal {
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

## ブラウザサポート

- **Chrome**: 114+
- **Edge**: 114+
- **Safari**: 17+
- **Firefox**: 125+

### フォールバック

非対応ブラウザ向けのフォールバックは、`@supports`を使用：

```css
/* Popover API非対応ブラウザ向けフォールバック */
@supports not (selector([popover])) {
  .modal {
    display: none;
  }
  
  .modal.is-open {
    display: flex;
  }
}
```

## トラブルシューティング

### Popoverが開かない

1. **ID属性の確認**: `popoverTarget`と`id`が一致しているか
2. **popover属性の確認**: `popover="auto"`または`popover="manual"`が設定されているか
3. **ブラウザサポート**: 対応ブラウザを使用しているか

### アニメーションが動作しない

1. **手動のdisplay制御を削除**（最重要）
   ```css
   /* ❌ 間違い - この記述を削除する */
   .modal:not(:popover-open) {
     display: none;
     pointer-events: none;
   }
   
   /* ✅ 正しい - Popover APIに任せる */
   .modal[popover] {
     animation: modalFadeIn 0.3s backwards;
   }
   ```

2. **@keyframesを使用**
   - `@starting-style`と`transition`ではなく`@keyframes`を使用
   - `backwards`キーワードで初期状態を適用

3. **ブラウザのサポートを確認**
   - Chrome 114+、Safari 17+を使用しているか
   - 開発者ツールのコンソールにエラーが出ていないか

4. **セレクタの確認**
   ```css
   /* ✅ 正しい */
   .modal[popover] {
     animation: modalFadeIn 0.3s backwards;
   }
   
   /* ❌ 間違い */
   .modal:popover-open {
     animation: modalFadeIn 0.3s backwards;
   }
   ```

### フォーカスが移動しない

1. **popover="auto"の確認**: `popover="manual"`ではフォーカス管理が自動化されない
2. **toggle イベントの確認**: `toggle`イベントで手動フォーカスを設定しているか

## 禁止事項

❌ **やってはいけないこと：**

- 手動でフォーカストラップを実装する（Popover APIが自動処理）
- 手動でEscapeキーのハンドリングを実装する（Popover APIが自動処理）
- backdrop要素を手動で作成する（`::backdrop`疑似要素を使用）
- z-indexで最上位に配置する（Top Layerが自動処理）
- `role="dialog"`や`aria-modal`を手動で設定する（ブラウザが自動設定）
- React stateで開閉状態を管理する（Popover APIが自動管理）
- **手動でdisplay制御を行う**（Popover APIの自動処理と競合）

```css
/* ❌ 間違い - Popover APIと競合してアニメーションが動かない */
.modal:not(:popover-open) {
  display: none;
  pointer-events: none;
}

/* ✅ 正しい - Popover APIに任せる */
.modal[popover] {
  animation: modalFadeIn 0.3s backwards;
  /* displayの制御はPopover APIが自動で行う */
}
```

## ベストプラクティス

### 1. popover="auto"を優先

```tsx
// ✅ 推奨
<div popover="auto">
  {/* 他のpopoverを自動的に閉じる */}
</div>

// ❌ 非推奨（特殊ケースのみ）
<div popover="manual">
  {/* 手動で閉じる必要がある */}
</div>
```

### 2. アニメーションは必須

```css
/* ✅ 推奨 - アニメーションを設定 */
.modal[popover] {
  transition:
    opacity 0.3s ease,
    scale 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;
}

/* ❌ 非推奨 - アニメーションなし */
.modal[popover] {
  /* アニメーションがないと、突然表示される */}
```

### 3. モーション削減対応

```css
/* ✅ 必須 - モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  .modal[popover],
  .modal[popover]::backdrop {
    transition: none;
  }
  
  @starting-style {
    .modal[popover]:popover-open {
      opacity: 1;
      scale: 1;
    }
  }
}
```

### 4. TypeScript型定義

```tsx
// ✅ 推奨 - @ts-expect-errorで型エラーを抑制
<div
  // @ts-expect-error - popover is not yet in React types
  popover="auto"
>
  {/* コンテンツ */}
</div>

// ❌ 非推奨 - 型エラーを無視
<div popover="auto">
  {/* TypeScriptエラーが表示される */}
</div>
```

## まとめ

Popover APIを使用することで、以下のメリットがあります：

- ✅ **コードの簡素化**: 複雑なフォーカストラップやEscapeキーのハンドリングが不要
- ✅ **アクセシビリティ**: ブラウザが自動的にARIA属性を管理
- ✅ **パフォーマンス**: Top Layerによる効率的なレンダリング
- ✅ **保守性**: ブラウザネイティブ機能のため、将来的なアップデートに対応
- ✅ **一貫性**: すべてのオーバーレイUIで同じパターンを使用

モーダル・ダイアログ・ドロップダウンなどのオーバーレイUIを実装する際は、必ずPopover APIを使用してください。
