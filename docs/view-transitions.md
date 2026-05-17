# View Transitions API 実装ガイド

このドキュメントは、Next.js App Routerで View Transitions API を実装する方法を定義します。

## 概要

View Transitions API は、ページ遷移時に滑らかなアニメーションを提供するネイティブブラウザAPIです。`next-view-transitions`ライブラリを使用してNext.jsで簡単に実装できます。

## インストール

```bash
npm install next-view-transitions
```

## 実装手順

### 1. ViewTransitionsコンポーネントの作成

`components/ViewTransitions/ViewTransitions.tsx`を作成：

```tsx
'use client';

import { ViewTransitions as NextViewTransitions } from 'next-view-transitions';

/**
 * View Transitions API を Next.js App Router で有効化
 * next-view-transitions ライブラリを使用
 */
export function ViewTransitions({ children }: { children: React.ReactNode }) {
  return <NextViewTransitions>{children}</NextViewTransitions>;
}
```

### 2. RootLayoutに追加

`app/layout.tsx`で`<body>`の内側をラップ：

```tsx
import { ViewTransitions } from '@/components/ViewTransitions/ViewTransitions';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ViewTransitions>
          {/* ヘッダー、メインコンテンツ、フッターなど */}
          {children}
        </ViewTransitions>
      </body>
    </html>
  );
}
```

**重要**: `<html>`タグの外側ではなく、`<body>`の**内側**にラップすること。

### 3. Linkコンポーネントの作成

`components/Link/Link.tsx`を作成：

```tsx
'use client';

import { Link as NextViewTransitionsLink } from 'next-view-transitions';
import type { ComponentProps } from 'react';

/**
 * View Transitions対応のLinkコンポーネント
 * next-view-transitionsのLinkを使用
 */
export function Link(props: ComponentProps<typeof NextViewTransitionsLink>) {
  return <NextViewTransitionsLink {...props} />;
}
```

### 4. 既存のLinkを置き換え

全てのコンポーネントで`next/link`を`next-view-transitions`に置き換え：

```tsx
// ❌ 間違い - next/linkを使用
import Link from 'next/link';

// ✅ 正しい - next-view-transitionsを使用
import { Link } from 'next-view-transitions';
```

**重要なルール**:

1. **内部リンクは必ず`next-view-transitions`のLinkを使用**
   ```tsx
   import { Link } from 'next-view-transitions';
   
   <Link href="/about">About</Link>
   <Link href="/works/my-project">View Project</Link>
   ```

2. **外部リンクは通常の`<a>`タグを使用**
   ```tsx
   <a href="https://example.com" target="_blank" rel="noopener noreferrer">
     External Link
   </a>
   ```

3. **ダウンロードリンクは通常の`<a>`タグを使用**
   ```tsx
   <a href="/files/document.pdf" download>
     Download PDF
   </a>
   ```

4. **プログラムによるナビゲーション**
   ```tsx
   'use client';
   
   import { useRouter } from 'next/navigation';
   
   export function BackButton() {
     const router = useRouter();
     
     const handleClick = () => {
       router.back(); // View Transitionsは自動的に適用される
       // または
       router.push('/'); // View Transitionsは自動的に適用される
     };
     
     return <button onClick={handleClick}>戻る</button>;
   }
   ```

5. **すべてのページで統一**
   - プロジェクト全体で一貫して`next-view-transitions`のLinkを使用
   - 混在させない（一部で`next/link`、一部で`next-view-transitions`は禁止）

### 5. CSSアニメーションの定義

`app/globals.css`にアニメーションを定義：

```css
/* View Transitions */
@view-transition {
  navigation: auto;
}

/* デフォルトのページ遷移（フェードイン・フェードアウト） */
::view-transition-old(root) {
  animation: fade-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

::view-transition-new(root) {
  animation: fade-in 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
  }
}
```

## カスタムアニメーション

### スライドアニメーション

```css
::view-transition-old(root) {
  animation: slide-out-left 0.3s cubic-bezier(0.4, 0, 1, 1);
}

::view-transition-new(root) {
  animation: slide-in-right 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100px);
    opacity: 0;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### スケールアニメーション

```css
::view-transition-old(root) {
  animation: scale-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

::view-transition-new(root) {
  animation: scale-in 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

@keyframes scale-in {
  from {
    transform: scale(1.05);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 特定要素のトランジション

特定の要素（画像など）を共有してアニメーションさせる場合：

### 1. CSS Modulesで`view-transition-name`を設定

```css
/* PlantCard.module.css */
.cardImage {
  view-transition-name: work-image;
}

/* WorkDetail.module.css */
.mainImage {
  view-transition-name: work-image;
}
```

### 2. トランジションをカスタマイズ

```css
/* globals.css */
::view-transition-old(work-image),
::view-transition-new(work-image) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. レスポンシブ対応

モバイルでは無効化する場合：

```css
@media (width < 768px) {
  .cardImage,
  .mainImage {
    view-transition-name: none;
  }
}
```

## ブラウザサポート

- **Chrome**: 111+
- **Edge**: 111+
- **Safari**: 18+
- **Firefox**: 未対応（2024年12月時点）

非対応ブラウザでは自動的にアニメーションなしで動作します（プログレッシブエンハンスメント）。

## 禁止事項

❌ **やってはいけないこと：**

- `next/link`と`next-view-transitions`のLinkを混在させる
- 内部リンクに通常の`<a>`タグを使用する
- `next/link`を直接インポートして使用する
- ViewTransitionsを`<html>`タグの外側に配置する
- 複数の要素に同じ`view-transition-name`を設定する
- アクセシビリティ対応（`prefers-reduced-motion`）を省略する

## トラブルシューティング

### アニメーションが動作しない

1. **ViewTransitionsの配置を確認**
   - `<body>`の内側に配置されているか
   - `<html>`の外側に配置していないか

2. **Linkコンポーネントを確認**
   - `next/link`ではなく`next-view-transitions`のLinkを使用しているか
   - プロジェクト全体で統一されているか

3. **ブラウザのサポートを確認**
   - Chrome 111+、Safari 18+を使用しているか
   - 開発者ツールのコンソールにエラーが出ていないか

4. **CSSの記述を確認**
   - `@view-transition`が正しく記述されているか
   - アニメーション名が正しいか

5. **インポート文を確認**
   ```tsx
   // ❌ 間違い
   import Link from 'next/link';
   
   // ✅ 正しい
   import { Link } from 'next-view-transitions';
   ```

### パフォーマンス問題

1. **アニメーション時間を短縮**
   ```css
   ::view-transition-old(root),
   ::view-transition-new(root) {
     animation-duration: 0.2s; /* 0.3s → 0.2s */
   }
   ```

2. **複雑なアニメーションを避ける**
   - フェード、スライド、スケールなどシンプルなアニメーションを使用
   - 複数の要素に`view-transition-name`を設定しすぎない

3. **モバイルでは無効化**
   ```css
   @media (width < 768px) {
     ::view-transition-old(root),
     ::view-transition-new(root) {
       animation: none;
     }
   }
   ```

## ベストプラクティス

### 1. Linkコンポーネントの統一（必須）

```tsx
// ✅ 正しい - プロジェクト全体で統一
import { Link } from 'next-view-transitions';

// すべての内部リンクで使用
<Link href="/">Home</Link>
<Link href="/about">About</Link>
<Link href="/works/project-1">Project</Link>
```

### 2. アクセシビリティ対応は必須

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
  }
}
```

### 3. アニメーション時間は短く

- **推奨**: 0.2s - 0.3s
- **最大**: 0.5s
- 長すぎるとユーザー体験が悪化

### 4. イージング関数を適切に選択

- **フェードアウト**: `cubic-bezier(0.4, 0, 1, 1)` (ease-in)
- **フェードイン**: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
- **両方**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)

### 5. `view-transition-name`は慎重に使用

- 同じ名前を複数の要素に設定しない
- ページ間で共有する要素のみに使用
- 一意な名前を使用（例: `work-image-${id}`）

### 6. フォールバックを考慮

- 非対応ブラウザでも動作するように設計
- アニメーションがなくても使いやすいUI

### 7. 外部リンクとの使い分け

```tsx
// ✅ 内部リンク - next-view-transitions
import { Link } from 'next-view-transitions';
<Link href="/about">About</Link>

// ✅ 外部リンク - 通常の<a>タグ
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External
</a>

// ✅ ダウンロード - 通常の<a>タグ
<a href="/files/doc.pdf" download>Download</a>
```

## 参考リソース

- [View Transitions API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [next-view-transitions - GitHub](https://github.com/shuding/next-view-transitions)
- [Can I Use: View Transitions](https://caniuse.com/view-transitions)

## まとめ

View Transitions APIを使用することで、JavaScriptをほとんど書かずに滑らかなページ遷移を実装できます。`next-view-transitions`ライブラリを使用すれば、Next.js App Routerでも簡単に導入可能です。

アクセシビリティとパフォーマンスに配慮しながら、ユーザー体験を向上させましょう。
