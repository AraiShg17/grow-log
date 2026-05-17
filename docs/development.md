---
inclusion: always
---

# Development Guidelines

## 開発環境

- **Node.js**: 20+（LTS 推奨）
- **npm**: 10+
- **Git**: 最新版
- **エディタ**: VS Code（ESLint / Prettier / CSS Modules 推奨）

## 初回セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local を編集
npm run dev
```

## 環境変数（`.env.local`）

```bash
GCP_PROJECT_ID=home-items-app
FIRESTORE_DATABASE_ID=grow-log-db
GCS_BUCKET_NAME=home-items-app-grow-log-photos

# ローカル: gcloud auth application-default login でも可
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

本番の Secret Manager 名は `OPEN_AI_API_KEY`（`projects/714015956955/secrets/OPEN_AI_API_KEY`）。Cloud Run では `OPENAI_API_KEY` として注入されます。

詳細は [security.md](./security.md)。

## ブランチ・コミット

```bash
git checkout -b feature/feature-name
git checkout -b fix/bug-name
```

コミット例:

```
feat: Add plant log form
fix: Handle missing plant photo
docs: Update deployment guide
test: Add formatDate tests
```

## 品質チェック（コミット前）

```bash
npm run type-check
npm run lint
npm run format:check
npm test
```

## コーディング規約

### TypeScript

- Props は `interface` で型定義
- `strict` モードを維持

### CSS Modules

- クラス名は **camelCase**（`.plantCard`, `.sectionInner`）
- 1 コンポーネント = 1 `.module.css`
- ネストは最大 3 段階

### コンポーネント配置

- UI: `src/components/ComponentName/`
- インフラ: `src/lib/`
- ページ: `src/app/`

詳細は [directory-structure.md](./directory-structure.md)、[structure.md](./structure.md)。

### Server / Client

- デフォルトは Server Component
- フォーム・ブラウザ API は `'use client'`

## テスト

```bash
npm test
npm run test:watch
npm test -- src/lib/utils/formatDate.test.ts
```

Vitest + Testing Library。ユーティリティと UI の重要パスを優先。

## トラブルシューティング

```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json && npm install

# Next.js キャッシュ
rm -rf .next && npm run dev

# ポート占有
lsof -i :3000
```

## CI/CD

**Cloud Build**（`master` への push）が正本です。`cloudbuild.yaml` 参照。

ローカルでは上記の品質チェックを手動実行してください。

## 関連ドキュメント

- [product.md](./product.md)
- [tech.md](./tech.md)
- [security.md](./security.md)
- [deployment.md](./deployment.md)
