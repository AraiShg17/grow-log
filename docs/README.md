# Grow Log ドキュメント

植物観察アプリ（`plant-observation-app`）の開発ガイド一覧です。

## 必読（プロジェクト共通）

| ドキュメント                                       | 内容                                       |
| -------------------------------------------------- | ------------------------------------------ |
| [product.md](./product.md)                         | プロダクト概要・MVP 画面・データ設計       |
| [tech.md](./tech.md)                               | 技術スタック・GCP・コマンド                |
| [development.md](./development.md)                 | セットアップ・開発フロー・コーディング規約 |
| [security.md](./security.md)                       | 環境変数・Secret Manager・セキュリティ     |
| [deployment.md](./deployment.md)                   | Cloud Build → Cloud Run デプロイ           |
| [directory-structure.md](./directory-structure.md) | ディレクトリ設計（コンポーネント単位）     |
| [structure.md](./structure.md)                     | コンポーネント・レイアウト・HTML 構造      |

## CSS（必要なときだけ参照）

| ドキュメント                                       | 内容                                            |
| -------------------------------------------------- | ----------------------------------------------- |
| [css-styling-rules.md](./css-styling-rules.md)     | CSS Modules・デザイントークン・詳細スタイル     |
| [css-layout-rules.md](./css-layout-rules.md)       | レイアウト安全性（safe center、isolation など） |
| [liquid-glass-design.md](./liquid-glass-design.md) | Liquid Glass 効果の実装                         |
| [view-transitions.md](./view-transitions.md)       | View Transitions API                            |

## UI パターン（必要なときだけ参照）

| ドキュメント                                     | 内容                   |
| ------------------------------------------------ | ---------------------- |
| [dialog-element.md](./dialog-element.md)         | `<dialog>` モーダル    |
| [popover-api.md](./popover-api.md)               | Popover API            |
| [anchor-positioning.md](./anchor-positioning.md) | CSS Anchor Positioning |

## 読む順序（初めての場合）

1. `product.md` → 何を作るか
2. `tech.md` → 何で作るか
3. `development.md` → ローカル起動
4. `directory-structure.md` + `structure.md` → コードの置き方
5. `deployment.md` → GCP へのデプロイ
