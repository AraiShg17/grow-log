---
inclusion: always
---

# Product Overview

**Grow Log** — 植物の育成記録と AI アドバイスを管理する Web アプリ。

## 目的

- 植物を登録し、写真とメモで観察記録を残す
- OpenAI API で育成方法・アドバイスを生成する
- 将来 Firebase Authentication を追加し、ユーザーごとにデータを分離する

## MVP 画面

| パス | 内容 |
|------|------|
| `/` | 植物一覧 |
| `/plants/new` | 植物登録（名前・種類・写真 → AI 育成方法） |
| `/plants/[plantId]` | 植物詳細（基本情報・育成方法・タイムライン・メモ） |
| `/plants/[plantId]/logs/new` | 観察記録追加（写真・メモ → AI アドバイス） |

## AI の使い方

### 植物登録時

**入力**: 植物名、種類、写真  
**出力**: 育成方法（水やり、日当たり、置き場所、肥料、注意点、季節ごとの管理）

### 観察記録追加時

**入力**: 植物名、過去の育成方法、今回の写真・メモ、過去ログ数件  
**出力**: 現在の状態、気になる点、やること、様子見でよいこと、次回確認ポイント

## Firestore 設計（MVP・認証なし）

```
plants/{plantId}
  name: string
  typeName: string
  firstPhotoUrl: string
  careGuide: string
  createdAt: timestamp
  updatedAt: timestamp

plants/{plantId}/logs/{logId}
  photoUrl: string
  memo: string
  aiAdvice: string
  observedAt: timestamp
  createdAt: timestamp
```

認証導入後の想定:

```
users/{userId}/plants/{plantId}/logs/{logId}
```

## インフラ概要

```
GitHub (master push)
  └ Cloud Build
      ├ npm ci / format / lint / typecheck / test
      ├ docker build
      └ Cloud Run deploy (home-items-app)
```

- **写真**: Cloud Storage
- **データ**: Firestore 専用 DB `grow-log-db`（`(default)` は使わない）
- **写真**: Cloud Storage 専用バケット `home-items-app-grow-log-photos`
- **AI**: OpenAI API（画像入力対応モデル。MVP は `gpt-4o-mini` 等、必要に応じて上位モデルへ）

## デザイン方針

- Apple HIG インスパイア（明確さ・コンテンツ優先・階層）
- CSS Modules のみ（Tailwind / CSS-in-JS 禁止）
- 必要に応じて Liquid Glass・View Transitions を採用（詳細は各 CSS ドキュメント）
