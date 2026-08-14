# Grow Log (plant-observation-app)

植物の育成記録と AI アドバイスを管理する Next.js アプリです。

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- Firestore / Cloud Storage / Firebase Admin SDK
- OpenAI API（育成方法・写真解析アドバイス）
- Cloud Build → Cloud Run

## 画面

| パス                         | 内容                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `/`                          | 植物一覧。検索・日照タグ絞り込み・並び替え・一括お手入れ |
| `/plants/new`                | 植物登録。名前と写真から AI が育成ガイドを生成           |
| `/plants/[plantId]`          | 植物詳細。育成ガイド、観察年表、写真、植物別 AI チャット |
| `/plants/[plantId]/logs/new` | 観察記録追加。写真またはメモを保存                       |
| `/gallery`                   | 投稿写真ギャラリー。追加、拡大表示、複数削除             |
| `/archive`                   | アーカイブした植物一覧。削除せず後から見返せる           |

## 主な機能

- 植物登録時に、写真から種類を補助推定して育成ガイドと推奨日照タグを生成
- 観察記録は写真付き・メモのみのどちらでも保存可能
- 観察記録に写真がある場合のみ、写真と過去ログを使って AI アドバイスを生成
- 植物詳細では、登録時の写真と観察写真をまとめてスライダー表示
- 一覧から水やり・肥料やりを複数植物にまとめて記録
- 植物ごとの AI チャットで、登録情報と直近ログを前提に質問可能
- ギャラリーには植物に紐づかない写真を投稿可能
- 枯れた植物などをアーカイブし、通常一覧から外して保存可能。詳細ページから復元できる

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local を編集
npm run dev
```

### GCP プロジェクト

| 項目             | 値               |
| ---------------- | ---------------- |
| プロジェクト ID  | `home-items-app` |
| プロジェクト番号 | `714015956955`   |

### 必須環境変数

- `GCP_PROJECT_ID`（`home-items-app`）
- `FIRESTORE_DATABASE_ID`（専用 DB: `grow-log-db`）
- `GCS_BUCKET_NAME`（専用バケット: `home-items-app-grow-log-photos`）
- `OPENAI_API_KEY`（ローカル。本番は Secret Manager `OPEN_AI_API_KEY` を Cloud Run で `OPENAI_API_KEY` にマッピング）
- `OPENAI_MODEL`（任意。未設定時はコード上のデフォルトを使用）

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
  name: string
  photoUrls: string[]              # 登録時の写真 URL。最大10枚
  aiPhotoIndex: number             # 登録時に AI 分析へ使った写真の index
  careGuide: string                # 登録時に生成した Markdown
  sunlightTag: "full_sun" | "partial_sun" | "shade"
  archived: boolean                # true のとき通常一覧から外し、/archive に表示
  archivedAt: timestamp            # アーカイブした日時。archived=true のときだけ保存
  createdAt: timestamp
  updatedAt: timestamp

plants/{plantId}/logs/{logId}
  photoUrls: string[]              # 観察写真 URL。最大3枚。メモのみ記録では空配列
  aiPhotoIndex: number             # 後方互換・表示用の代表 index
  aiPhotoIndices: number[]         # AI 分析に使った写真 index。写真付きログで使用
  memo: string
  aiAdvice: string                 # 写真付きログで生成。メモのみ記録では空文字
  visualSnapshot: string           # 次回比較用の写真状態メモ。生成できた場合のみ
  observedAt: timestamp
  createdAt: timestamp

plants/{plantId}/chatMessages/{messageId}
  role: "user" | "assistant"
  content: string
  createdAt: timestamp

galleryPhotos/{photoId}
  photoUrl: string
  createdAt: timestamp
```

旧データ互換として `plants/{plantId}.typeName` を読む型は残っていますが、新規登録では保存しません。既存データには `archived` が存在しないことがありますが、コード上は `archived !== true` を通常表示として扱います。アーカイブ時に `archived: true` と `archivedAt` を追加し、復元時は `archived: false` に戻して `archivedAt` を削除します。

Cloud Storage のオブジェクトは用途別に `plants/`, `logs/`, `gallery/` 配下へ保存します。植物やログ、ギャラリー写真を削除すると、対応する Storage オブジェクトも削除します。

認証導入後は `users/{userId}/plants/...` への移行を想定しています。
