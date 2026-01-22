# waza-pk 実装計画

## このドキュメントについて

agentモードでコードを改修する際には、このplan.madを参照して整合性を確認した上で実行してください。
重要な仕様変更や、修正・更新があった場合、適宜plan.madを更新してください

---

## プロジェクト概要

縦スクロール型クイズSPAの開発プロジェクト。Vite + Svelte + TypeScriptで構築し、Brightcove動画を背景に使用した没入感のあるユーザー体験を提供する。

---

## 技術構成

- **フレームワーク**: Svelte 5.46.0
- **ビルドツール**: Vite 6.3.1
- **言語**: TypeScript
- **スタイリング**: SCSS
- **動画プラットフォーム**: Brightcove Player

---

## 実装フェーズ

### フェーズ1: 基盤構築 ✓

- [x] Vite + Svelte + TypeScript環境のセットアップ
- [x] SCSS導入と基本スタイル設定
- [x] プロジェクト構造の構築
- [x] 基本的なコンポーネント構造の設計

### フェーズ2: コアコンポーネント開発 ✓

- [x] BackgroundVideo コンポーネント
  - Brightcove Player統合
  - 自動再生/一時停止制御
  - モバイル対応（poster画像フォールバック）
- [x] QuizSection コンポーネント
  - 選択肢UI
  - 回答状態管理
  - スコア計算ロジック

### フェーズ3: メインアプリケーション開発 ✓

- [x] App.svelte - メインレイアウト
  - 初回訪問時のロゴ演出
  - IntersectionObserver実装
  - スクロール連動の背景切り替え
  - セクション管理

### フェーズ4: スタイリングと演出 🔄

- [x] グローバルスタイル設定
- [x] レスポンシブデザイン
- [ ] アニメーション最適化
- [ ] パフォーマンスチューニング

### フェーズ5: テストとデバッグ

- [ ] クロスブラウザテスト
- [ ] モバイルデバイステスト
- [ ] パフォーマンス測定
- [ ] アクセシビリティチェック

### フェーズ6: デプロイ準備

- [ ] 本番環境設定
- [ ] ビルド最適化
- [ ] CDN設定（Brightcove動画）
- [ ] ドキュメント整備

---

## 主要機能の実装詳細

### 1. 初回ロゴ演出

**実装済み**
- sessionStorageで初回訪問判定
- タイムライン: 0.5秒後フェードイン → 3秒表示 → フェードアウト → 3.6秒時点でコンテンツ表示
- リロード時のスキップ機能

### 2. スクロール連動背景切り替え

**実装済み**
- IntersectionObserver（threshold: 0.5）
- 単一背景コンテナで複数背景を管理
- opacity切り替え（0.6秒トランジション）
- 背景漏れ防止機構

### 3. Brightcove動画統合

**実装済み**
- BackgroundVideoコンポーネント
- 動画ID、poster、アカウント情報をProps管理
- isActiveによる再生/一時停止制御
- モバイルフォールバック

### 4. クイズ機能

**実装済み**
- QuizSectionコンポーネント
- 複数選択肢サポート
- 回答状態の保存と管理
- スコア計算

---

## ディレクトリ構造

```
waza-pk/
├── public/
│   └── images/          # 静的画像アセット
├── src/
│   ├── components/
│   │   ├── BackgroundVideo.svelte  # 背景動画コンポーネント
│   │   └── QuizSection.svelte      # クイズセクションコンポーネント
│   ├── styles/
│   │   ├── global.scss             # グローバルスタイル
│   │   └── mixins.scss             # SCSSミキシン
│   ├── App.svelte                  # メインアプリケーション
│   ├── main.ts                     # エントリーポイント
│   └── vite-env.d.ts              # 型定義
├── index.html
├── package.json
├── vite.config.js
├── svelte.config.js
├── tsconfig.json
├── SPECIFICATION.md                 # 仕様書
├── README.md                        # セットアップ手順
└── plan.md                          # 本ドキュメント
```

---

## 今後の改善案

### パフォーマンス最適化
- [ ] 動画の遅延読み込み
- [ ] 使用していない背景動画のアンロード
- [ ] 画像の最適化（WebP形式、適切なサイズ）

### ユーザー体験向上
- [ ] プログレスバー追加
- [ ] スクロールヒント表示
- [ ] タッチジェスチャーのサポート強化

### アクセシビリティ
- [ ] キーボードナビゲーション
- [ ] スクリーンリーダー対応
- [ ] カラーコントラスト改善

### 機能拡張
- [ ] 結果シェア機能
- [ ] 解説コンテンツの追加
- [ ] マルチ言語対応

---

## 開発メモ

### IntersectionObserverの調整
- 現在のthreshold: 0.5（50%表示で切り替え）
- 必要に応じて調整可能

### Brightcove設定
- アカウントID: 4508222237001
- プレイヤーID: ryIf3h4rG
- 本番環境では適切な値に変更すること

### セッション管理
- sessionStorageで初回訪問を判定
- タブを閉じるとリセット
- 永続化が必要な場合はlocalStorageへの変更を検討

---

## 参考リソース

- [Svelte公式ドキュメント](https://svelte.dev/)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [Brightcove Player Documentation](https://player.support.brightcove.com/)
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
