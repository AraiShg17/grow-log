# ディレクトリ設計方針：コンポーネント単位での分割

## 基本思想

このプロジェクトでは **コンポーネント単位** でディレクトリを構成する。各コンポーネントは独立したフォルダを持ち、そのコンポーネント専用のAPI・Hooks・型定義などを内包する。

### 目標

- **高凝集**: 同じコンポーネントに属するコードは、同じフォルダに集約する
- **低結合**: コンポーネント間の依存は最小限にし、明示的な境界を持たせる
- **明確な責務**: 各コンポーネントフォルダを見れば、そのコンポーネントの全体像が把握できる

## トップレベルのディレクトリ構造

トップレベルは以下のように技術要素ごとに分割する（これは許容される）：

```
/components     # すべてのUIコンポーネント
/lib            # インフラ層・共通ユーティリティ
/app            # Next.js App Router（ページ）
/public         # 静的ファイル
/styles         # グローバルスタイル
```

### ❌ NG：コンポーネント専用のコードをトップレベルに配置

特定のコンポーネント専用のAPI・Hooksをトップレベルに配置するのは禁止：

```
/hooks
  usePlantForm.ts       ← PlantForm 専用なのにトップレベルは NG
/api
  createPlant.ts        ← コンポーネント専用なのにトップレベルは NG
```

### 理由

- コンポーネントの変更に必要なファイルが、ディレクトリツリーのあちこちに散らばる
- 「このコンポーネントはどこを見ればいいか」が直感的にわからない
- コンポーネント追加時に複数のディレクトリを横断して編集が必要になる

## ✅ OK：コンポーネント単位での分割

コンポーネントごとにフォルダを作成し、そのコンポーネント専用のAPI・Hooks・型定義などを内包する。

### 基本構造

```
/components
  /PlantCard
    PlantCard.tsx
    PlantCard.module.css

  /PlantForm
    PlantForm.tsx
    PlantForm.module.css

  /LogForm
    LogForm.tsx
    LogForm.module.css

  /AppHeader
    AppHeader.tsx
    AppHeader.module.css
```

**ポイント**:

- コンポーネントに必要なすべてのコードを **同じコンポーネントフォルダに集約** する
- `api/` や `hooks/` フォルダは、そのコンポーネント専用のものがある場合のみ作成する
- 型定義が複雑な場合は `types.ts` を作成し、シンプルな場合はコンポーネントファイル内に定義する

### 共通コンポーネントの扱い

複数のコンポーネントで使用される汎用的なコンポーネントは、`components/` 直下に配置する。

```
/components
  /Button                    # 汎用ボタンコンポーネント
    Button.tsx
    Button.module.css
    Button.test.tsx

  /Modal                     # 汎用モーダルコンポーネント
    Modal.tsx
    Modal.module.css
    /hooks
      useModal.ts

  /PlantCard                 # アプリ固有のコンポーネント
    PlantCard.tsx
    PlantCard.module.css
```

**判断基準**:

- **汎用的**: 複数の場所で使われる、デザインシステム的なコンポーネント → `components/` 直下
- **固有的**: 特定の画面や機能に紐づくコンポーネント → `components/` 直下（同じ扱い）

このプロジェクトでは、すべてのコンポーネントを `components/` 直下に配置し、フラットな構造を維持する。

## 共通ユーティリティとライブラリ

コンポーネントに属さない共通のユーティリティやライブラリは、`lib/` ディレクトリに配置する。

```
/lib
  /firestore              # Firestoreサービス
    index.ts
    types.ts
  /storage                # Cloud Storageサービス
    index.ts
  /auth                   # 認証関連
    index.ts
  /utils                  # 汎用ユーティリティ
    formatDate.ts
    slugify.ts
  types.ts                # グローバル型定義
```

**ポイント**:

- データベース、ストレージ、認証などのインフラ層は `lib/` に配置
- 複数のコンポーネントで使用される汎用的なユーティリティ関数も `lib/utils/` に配置
- グローバルな型定義は `lib/types.ts` に配置

## ドキュメントの扱い

ドキュメントは **コードと同じくコンポーネント単位でカプセル化** する。

- 複雑なコンポーネントには `README.md` を配置し、使い方や仕様を記述する
- プロジェクト全体のドキュメントは `docs/` に配置する

**「ドキュメント専用ディレクトリ」を分けて作るのではなく、各コンポーネントフォルダの中に置く。**

## 守ってほしいルール（要約）

1. **コンポーネント単位でフォルダを作成する**
   - すべてのコンポーネントは `components/` 直下に配置
   - コンポーネント名のフォルダを作成し、関連ファイルをすべて内包する

2. **コンポーネント専用のAPI・Hooksは、コンポーネントフォルダ内にサブフォルダを作成する**
   - `ComponentName/api/` - コンポーネント専用のAPI関数
   - `ComponentName/hooks/` - コンポーネント専用のカスタムHooks
   - `ComponentName/types.ts` - コンポーネント専用の型定義（必要な場合）

3. **共通のコードは適切なトップレベルフォルダに配置する**
   - ✅ `lib/` - インフラ層・共通ユーティリティ・グローバル型定義
   - ✅ `components/` - すべてのUIコンポーネント
   - ❌ コンポーネント専用のコードをトップレベルに配置しない

4. **インフラ層やグローバルユーティリティは `lib/` に配置**
   - データベース、ストレージ、認証などのサービス
   - 複数のコンポーネントで使用される汎用的なユーティリティ関数
   - グローバルな型定義
   - 複数のコンポーネントで使用される共通Hooks

5. **ドキュメントもコンポーネントフォルダに内包する**
   - 複雑なコンポーネントには `README.md` を追加
   - プロジェクト全体のドキュメントは `docs/` に配置

## 実装時の判断フロー

新しいコンポーネント・Hook・API関数などを作成する際:

```
1. これはどのコンポーネントに属するか？
   ↓
2. 特定のコンポーネント専用か？
   YES → そのコンポーネントフォルダ内に配置
         - API関数 → ComponentName/api/
         - Hooks → ComponentName/hooks/
         - 型定義 → ComponentName/types.ts
   NO  → 次へ
   ↓
3. 複数のコンポーネントで使用される汎用的なものか？
   YES → lib/ に配置
         - ユーティリティ関数 → lib/utils/
         - サービス層 → lib/serviceName/
         - グローバル型 → lib/types.ts
   NO  → 新しいコンポーネントを作成
```

## プロジェクト構造の全体像

```
grow-log/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # 植物一覧
│   │   ├── actions/plants.ts     # Server Actions
│   │   ├── globals.css
│   │   └── plants/
│   │       ├── new/page.tsx
│   │       └── [plantId]/
│   │           ├── page.tsx
│   │           └── logs/new/page.tsx
│   │
│   ├── components/
│   │   ├── AppHeader/
│   │   ├── PlantCard/
│   │   ├── PlantForm/
│   │   ├── PlantDetail/
│   │   ├── LogForm/
│   │   ├── Button/
│   │   └── PageShell/
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   ├── firestore/
│   │   ├── storage/
│   │   ├── openai/
│   │   └── utils/
│   │
│   └── types/
│       └── plant.ts
│
├── docs/                         # 開発ガイドライン
├── public/
├── cloudbuild.yaml
└── Dockerfile
```

## ベストプラクティス

### 1. コンポーネントの粒度

- **小さすぎる**: 1つのコンポーネントに1つのファイルだけ → 過度な分割
- **適切**: 関連するファイルが3-10個程度 → 管理しやすい
- **大きすぎる**: 20個以上のファイル → サブコンポーネントへの分割を検討

### 2. API関数の配置

```typescript
// ✅ 正しい - コンポーネント専用のAPI
app / actions / plants.ts; // 複数ページで使う Server Actions

// ✅ 正しい - サービス層
lib / firestore / plants.ts;

// ❌ 間違い - コンポーネント専用なのにトップレベル
api / createPlant.ts;
```

### 3. Hooksの配置

```typescript
// ✅ 正しい - コンポーネント専用のHook
components / PlantForm / hooks / usePlantForm.ts;

// ✅ 正しい - 複数コンポーネントで使う Hook
lib / hooks / useMediaQuery.ts;

// ❌ 間違い
hooks / usePlantForm.ts;
```

### 4. 型定義の配置

```typescript
// ✅ 正しい - コンポーネント専用の型
src / types / plant.ts;

// ✅ 正しい - コンポーネント専用（複雑な場合）
components / PlantForm / types.ts;

// ❌ 間違い
types / plantFormOnly.ts;
```
