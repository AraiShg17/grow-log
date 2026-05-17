---
inclusion: always
---

# Tech Stack

## Core Technologies

- **Framework**: Next.js 15+ (App Router)
- **React**: 19+
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Pure CSS + CSS Modules only
- **Node.js**: 20+
- **Test**: Vitest
- **AI**: OpenAI API
- **Backend**: Firebase Admin SDK（Firestore）、Cloud Storage

## Styling Constraints

### Allowed

- CSS Modules (`ComponentName.module.css`)
- Native CSS / モダン仕様
- SVG Filters（Liquid Glass 用）

### Forbidden

- Tailwind, Chakra UI, MUI, Bootstrap
- styled-components, emotion 等の CSS-in-JS
- GSAP（特別な理由がない限り）
- jQuery

## Design System

- **Color**: OKLab（`linear-gradient(135deg in oklab, ...)`）
- **Variables**: 色・タイポ・スペーシングは CSS Variables
- **Grid**: 8pt スペーシング
- **Responsive**: モバイルファースト（<768 / 768–1024 / ≥1024）

詳細は [css-styling-rules.md](./css-styling-rules.md)、レイアウト安全性は [css-layout-rules.md](./css-layout-rules.md)。

## Commands

```bash
npm run dev
npm run build
npm start
npm run type-check
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm test
npm run test:watch
npm run test:coverage
```

## Google Cloud Platform

### Project

| 項目 | 値 |
|------|-----|
| プロジェクト名 | home-items-app |
| プロジェクト ID | `home-items-app` |
| プロジェクト番号 | `714015956955` |

### 利用サービス

- **Cloud Run**: Web アプリ（本リポジトリを新規デプロイ）
- **Cloud Build**: `master` push で CI/CD（`cloudbuild.yaml`）
- **Firestore**: 植物・観察ログ（名前付き DB）
- **Cloud Storage**: 植物写真
- **Secret Manager**: 本番シークレット

### Firestore

- **`(default)` は使わない** — `FIRESTORE_DATABASE_ID` で明示指定
- 専用 DB: `grow-log-db`（`projects/home-items-app/databases/grow-log-db`）
- 専用バケット: `home-items-app-grow-log-photos`（Cloud Build の環境変数 `GCS_BUCKET_NAME`。Secret 不要）

### OpenAI

- **Provider**: OpenAI API（Vertex AI は使わない）
- **環境変数**: `OPENAI_API_KEY`（本番: Secret `OPEN_AI_API_KEY` → `projects/714015956955/secrets/OPEN_AI_API_KEY`）, `OPENAI_MODEL`（例: `gpt-4o-mini`）
- 画像入力・写真解析は OpenAI 側で実施

### Cloud Run（想定）

| 項目 | 値 |
|------|-----|
| リージョン | `asia-northeast1` |
| サービス名 | `grow-log-web`（`cloudbuild.yaml` の `_SERVICE_NAME`） |
| Artifact Registry | `grow-log` リポジトリ |

## Browser Support

- モダン evergreen ブラウザ
- Safari: `-webkit-backdrop-filter` プレフィックス
- 未対応機能は `@supports` でフォールバック
