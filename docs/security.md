# Security and Environment Variables

## ローカル開発

```bash
cp .env.example .env.local
```

- `.env.local` は `.gitignore` 対象 — Git にコミットしない
- `.env.example` にはプレースホルダのみ

## 本番（Cloud Run）

- シークレットは **GCP Secret Manager** に保存
- Cloud Run 起動時に `--set-secrets` で注入（`cloudbuild.yaml` 参照）
- コードは `process.env.VARIABLE_NAME` のみ

## GCP プロジェクト

| 項目 | 値 |
|------|-----|
| プロジェクト ID | `home-items-app` |
| プロジェクト番号 | `714015956955` |

## Secret Manager に登録するもの（MVP）

| Secret Name | 用途 |
|-------------|------|
| Secret Manager 名 | Cloud Run 環境変数 | 用途 |
|-------------------|-------------------|------|
| `OPEN_AI_API_KEY` | `OPENAI_API_KEY` | OpenAI API キー（**秘密情報**） |

OpenAI キーのリソースパス: `projects/714015956955/secrets/OPEN_AI_API_KEY`

アプリは `process.env.OPENAI_API_KEY` を参照。本番では `--set-secrets` でマッピング（`cloudbuild.yaml`）。

### Secret Manager に入れないもの

バケット名・Firestore DB ID・プロジェクト ID は **非秘密** のため、`cloudbuild.yaml` の `substitutions` / `--set-env-vars` で渡します。

| 環境変数 | 例 | 設定場所 |
|---------|-----|---------|
| `GCS_BUCKET_NAME` | `home-items-app-grow-log-photos` | `_GCS_BUCKET_NAME`（Cloud Build） |
| `FIRESTORE_DATABASE_ID` | `grow-log-db` | `_FIRESTORE_DATABASE_ID` |
| `GCP_PROJECT_ID` | `home-items-app` | `${PROJECT_ID}` |

### OpenAI シークレットの作成例（未作成の場合）

```bash
gcloud config set project home-items-app
echo -n "sk-..." | gcloud secrets create OPEN_AI_API_KEY --data-file=-
```

### 更新・反映

```bash
echo -n "new-value" | gcloud secrets versions add OPEN_AI_API_KEY --data-file=-

gcloud run services update grow-log-web --region=asia-northeast1
```

## Cloud Run サービスアカウント権限（最小限）

デフォルト Compute SA: `714015956955-compute@developer.gserviceaccount.com`

```bash
# Secret Manager 読み取り
gcloud projects add-iam-policy-binding home-items-app \
  --member="serviceAccount:714015956955-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Firestore
gcloud projects add-iam-policy-binding home-items-app \
  --member="serviceAccount:714015956955-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"

# Cloud Storage（バケット単位で付与推奨）
```

## コード上の注意

```typescript
// ✅
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

// ✅ ログはマスク
console.log('OpenAI configured:', !!process.env.OPENAI_API_KEY);

// ❌ シークレットの直書き・ログ出力・デフォルト値への埋め込み
```

## 禁止事項

- `.env.local` の Git コミット
- Dockerfile への `.env` コピー
- シークレットのハードコード
- エラーメッセージへの内部詳細の露出

## セキュリティヘッダー

`next.config.ts` で設定済み（`X-Frame-Options`, `HSTS`, `Referrer-Policy` 等）。

## インシデント時

1. Secret Manager で該当バージョンを無効化
2. 新バージョンを追加
3. Cloud Run を再デプロイ
4. Cloud Logging でアクセスログを確認

```bash
gcloud run services logs read grow-log-web \
  --region=asia-northeast1 \
  --filter="severity>=ERROR" \
  --limit=50
```

## チェックリスト

**開発開始前**

- [ ] `.env.local` が gitignore されている
- [ ] Firestore は名前付き DB を使う
- [ ] OpenAI キーは Secret Manager（本番）/ `.env.local`（ローカル）のみ

**デプロイ前**

- [ ] シークレットがイメージに含まれていない
- [ ] `npm audit` でクリティカルな脆弱性がない
