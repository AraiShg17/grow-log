# Deployment（Cloud Build → Cloud Run）

GCP プロジェクト **home-items-app** に Grow Log を新規デプロイする手順です。

## 前提

| 項目               | 値                |
| ------------------ | ----------------- |
| プロジェクト ID    | `home-items-app`  |
| リージョン         | `asia-northeast1` |
| Cloud Run サービス | `grow-log-web`    |
| Artifact Registry  | `grow-log`        |

## 1. API の有効化

```bash
gcloud config set project home-items-app

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

## 2. Artifact Registry

```bash
gcloud artifacts repositories create grow-log \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Grow Log container images"
```

## 3. Firestore（専用 DB）

Grow Log 専用の名前付き DB（**作成済み**）:

| 項目        | 値                                              |
| ----------- | ----------------------------------------------- |
| Database ID | `grow-log-db`                                   |
| リソース    | `projects/home-items-app/databases/grow-log-db` |
| リージョン  | `asia-northeast1`                               |

Cloud Run 環境変数: `FIRESTORE_DATABASE_ID=grow-log-db`（`cloudbuild.yaml` の `_FIRESTORE_DATABASE_ID`）

未作成の場合:

```bash
gcloud firestore databases create \
  --database=grow-log-db \
  --location=asia-northeast1 \
  --type=firestore-native \
  --project=home-items-app
```

## 4. Cloud Storage（専用バケット）

植物写真用バケット（**作成済み**）:

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| バケット名 | `home-items-app-grow-log-photos`      |
| URI        | `gs://home-items-app-grow-log-photos` |
| リージョン | `asia-northeast1`                     |

バケット名は Secret ではなく `cloudbuild.yaml` の `_GCS_BUCKET_NAME` から環境変数として注入します。

未作成の場合:

```bash
gcloud storage buckets create gs://home-items-app-grow-log-photos \
  --project=home-items-app \
  --location=asia-northeast1 \
  --uniform-bucket-level-access
```

## 5. Secret Manager

[security.md](./security.md) を参照。OpenAI キーのみ Secret Manager（`OPEN_AI_API_KEY`）。`GCS_BUCKET_NAME` などは `cloudbuild.yaml` の `substitutions` で設定します。

## 6. Cloud Build トリガー

`master`（または `main`）への push で `cloudbuild.yaml` を実行:

```bash
gcloud builds triggers create github \
  --name=grow-log-deploy \
  --repo-name=grow-log \
  --repo-owner=YOUR_GITHUB_ORG \
  --branch-pattern=^master$ \
  --build-config=cloudbuild.yaml
```

`substitutions` は `cloudbuild.yaml` 内のデフォルトを使用するか、トリガー側で上書き:

| 変数                     | 例                               |
| ------------------------ | -------------------------------- |
| `_FIRESTORE_DATABASE_ID` | `grow-log-db`                    |
| `_GCS_BUCKET_NAME`       | `home-items-app-grow-log-photos` |
| `_SERVICE_NAME`          | `grow-log-web`                   |
| `_ARTIFACT_REPO`         | `grow-log`                       |
| `_OPENAI_MODEL`          | `gpt-4o-mini`                    |

## 7. Cloud Build サービスアカウント権限

Cloud Build SA に以下を付与:

- `roles/run.admin`
- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser`（Cloud Run 実行 SA の指定用）

## パイプライン概要

```
npm ci → format:check → lint → type-check → test
  → docker build → push Artifact Registry
  → gcloud run deploy grow-log-web
```

## 手動デプロイ（検証用）

```bash
gcloud builds submit --config=cloudbuild.yaml
```

## ログ確認

```bash
gcloud run services describe grow-log-web --region=asia-northeast1
gcloud run services logs read grow-log-web --region=asia-northeast1 --limit=50
```
