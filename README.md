# Grow Log (plant-observation-app)

植物の育成記録と AI アドバイスを管理する Next.js アプリです。

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- Firestore / Cloud Storage / Firebase Admin SDK
- OpenAI API（育成方法・写真解析アドバイス）
- Cloud Build → Cloud Run

## 画面

| パス | 内容 |
|------|------|
| `/` | 植物一覧 |
| `/plants/new` | 植物登録 |
| `/plants/[plantId]` | 植物詳細 |
| `/plants/[plantId]/logs/new` | 観察記録追加 |

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local を編集
npm run dev
```

### GCP プロジェクト

| 項目 | 値 |
|------|-----|
| プロジェクト ID | `home-items-app` |
| プロジェクト番号 | `714015956955` |

### 必須環境変数

- `GCP_PROJECT_ID`（`home-items-app`）
- `FIRESTORE_DATABASE_ID`（専用 DB: `grow-log-db`）
- `GCS_BUCKET_NAME`（専用バケット: `home-items-app-grow-log-photos`）
- `OPENAI_API_KEY`（ローカル。本番は Secret Manager `OPEN_AI_API_KEY` を Cloud Run で `OPENAI_API_KEY` にマッピング）

ローカルでは `gcloud auth application-default login` で ADC を使うか、`FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` を設定してください。

## コマンド

```bash
npm run dev
npm run build
npm run type-check
npm run lint
npm run format:check
npm test
```

## デプロイ

`home-items-app` プロジェクト上の Cloud Run（`grow-log-web`）へ、`master` push で Cloud Build がデプロイします。手順は [docs/deployment.md](docs/deployment.md) を参照。

1. `npm ci` / format / lint / typecheck / test
2. Docker build & push（Artifact Registry: `grow-log`）
3. Cloud Run deploy

## Firestore 設計（MVP）

```
plants/{plantId}
  name, typeName, firstPhotoUrl, careGuide, createdAt, updatedAt

plants/{plantId}/logs/{logId}
  photoUrl, memo, aiAdvice, observedAt, createdAt
```

認証導入後は `users/{userId}/plants/...` への移行を想定しています。
