# 縦スクロール型クイズSPA仕様書

## 概要
Vite + Svelte + TypeScriptで構築された、縦スクロール型のシングルページウェブアプリケーション。選択型クイズとテキストコンテンツをメインとし、各セクションに全画面背景動画（Brightcove）または画像が設定されています。

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| **フレームワーク** | Svelte 5.46.0 |
| **ビルドツール** | Vite 6.3.1 |
| **言語** | TypeScript |
| **スタイリング** | SCSS (sass 1.97.1) |
| **動画プラットフォーム** | Brightcove Player |

---

## 主要機能

### 1. 初回ロゴ演出

**実装箇所**: [src/App.svelte](src/App.svelte)

- 初回訪問時のみ、ページ読み込み後0.5秒後にロゴがフェードイン
- 3秒間表示後、フェードアウト
- ロゴ消失後、3.6秒時点でクイズコンテンツが表示
- 途中リロード時（セッション継続中）はロゴをスキップし、すぐにコンテンツを表示
- **判定方法**: `sessionStorage.getItem('hasVisited')` で初回訪問を判定

```typescript
// 初回訪問判定の実装例
const hasVisited = sessionStorage.getItem('hasVisited');
if (!hasVisited) {
  sessionStorage.setItem('hasVisited', 'true');
  // ロゴアニメーション実行
}
```

---

### 2. スクロール連動の背景切り替え

**実装箇所**: [src/App.svelte](src/App.svelte)

- **単一背景コンテナ** (`.background-container`) で全ての背景動画/画像を一元管理
- `IntersectionObserver` で各セクションの表示を検知（threshold: 0.5 = 50%表示）
- `activeSection` 状態変数でアクティブなセクションを管理
- アクティブな背景のみ `opacity: 1`、それ以外は `opacity: 0` に設定
- トランジション時間: 0.6秒（ease）
- **背景漏れ防止**: 複数背景が重なり合い、一方が必ず `opacity: 1` を維持

```typescript
// IntersectionObserverの設定（調整可能）
const INTERSECTION_THRESHOLD = 0.5;

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: INTERSECTION_THRESHOLD
};
```

**背景動画の設定**:
```typescript
const backgrounds = [
  {
    id: 'hero',
    videoId: '6375289208112',
    poster: 'https://example.com/poster1.webp'
  },
  // 追加のセクション...
];
```

---

### 3. Brightcove動画の統合

**実装箇所**: [src/components/BackgroundVideo.svelte](src/components/BackgroundVideo.svelte)

- **Props**:
  - `videoId`: Brightcove動画ID（必須）
  - `poster`: フォールバック画像URL（必須）
  - `accountId`: BrightcoveアカウントID（デフォルト: '4508222237001'）
  - `playerId`: BrightcoveプレイヤーID（デフォルト: 'ryIf3h4rG'）
  - `isActive`: アクティブ状態（true/false）

- **動画の自動再生制御**:
  - `isActive === true` のときのみ動画を再生
  - `isActive === false` になると動画を一時停止（パフォーマンス最適化）
  - ミュート状態、ループ再生、インライン再生を設定

- **モバイル対応**:
  - `poster` 属性で画像フォールバックを設定
  - `playsinline` 属性でインライン再生を有効化

```svelte
<BackgroundVideo
  videoId="6375289208112"
  poster="https://example.com/poster.webp"
  isActive={activeSection === 'hero'}
/>
```

---

### 4. 選択型クイズシステム

**実装箇所**: [src/components/QuizSection.svelte](src/components/QuizSection.svelte)

- **Props**:
  - `title`: クイズタイトル（heroセクションのみ）
  - `questionText`: 質問文
  - `choices`: 選択肢の配列（例: `['選択肢A', '選択肢B']`）
  - `explanations`: 各選択肢に対応する解説文の配列
  - `explanationImages`: 各選択肢に対応する解説画像のURLの配列
  - `show`: クイズの表示/非表示
  - `isHero`: heroセクションかどうか（タイトル表示の有無）
  - `onAnswerShown`: 解説表示時に実行されるコールバック（背景グレーアウト用）

- **機能**:
  - 2択（または複数選択肢）のクイズUI
  - 選択後、選択された選択肢以外は半透明になる
  - 300ms後に解説モーダルが表示される
  - 解説表示中は背景がグレースケール + 暗く調整
  - モーダル外クリックで解説を閉じる

```svelte
<QuizSection
  title="コンテンツタイトル"
  questionText="あなたはどちらを選びますか？"
  choices={['選択肢A', '選択肢B']}
  explanations={['選択肢Aの解説', '選択肢Bの解説']}
  explanationImages={['images/a.png', 'images/b.png']}
  show={showQuestion}
  isHero={true}
  onAnswerShown={() => { showAnswerHero = true; }}
/>
```

---

### 5. 背景のグレーアウト効果

**実装箇所**: [src/App.svelte](src/App.svelte) の `.background-container`

- クイズ解説表示時（`showAnswerHero || showAnswer1 || showAnswer2`）に背景をグレーアウト
- CSS Filter: `grayscale(1) brightness(0.5)`
- トランジション時間: 0.8秒（ease）

```scss
.background-container {
  transition: filter 0.8s ease;

  &.grayscale {
    filter: grayscale(1) brightness(0.5);
  }
}
```

---

## プロジェクト構成

```
waza-pk/
├── src/
│   ├── App.svelte                    # メインアプリケーションコンポーネント
│   ├── main.ts                       # エントリーポイント
│   ├── components/
│   │   ├── BackgroundVideo.svelte    # Brightcove動画背景コンポーネント
│   │   └── QuizSection.svelte        # クイズUIコンポーネント
│   └── styles/
│       ├── global.scss               # グローバルスタイル
│       └── mixins.scss               # レスポンシブmixin等
├── public/
│   └── images/                       # 画像アセット
├── index.html
├── package.json
├── vite.config.js
├── tsconfig.json
└── SPECIFICATION.md                  # 本ファイル
```

---

## セクション構成

各セクションは以下の構成要素を持ちます：

1. **クイズセクション** (`QuizSection.svelte`)
   - 質問文
   - 選択肢（2択）
   - 解説（選択後に表示）

2. **テキストコンテンツ**
   - 本文テキスト (`.hero-text` / `.content-block-text`)
   - 画像 (`.hero-text-image` / `.content-block-text-image`)

3. **背景動画/画像**
   - 全画面固定（`position: fixed`）
   - スクロール位置に応じて切り替え

---

## カスタマイズ方法

### 1. IntersectionObserverのthresholdを調整

[src/App.svelte](src/App.svelte) の `INTERSECTION_THRESHOLD` を変更：

```typescript
// 0.5 = 50%表示で切り替え
// 0.3 = 30%表示で切り替え（早め）
// 0.7 = 70%表示で切り替え（遅め）
const INTERSECTION_THRESHOLD = 0.5;
```

### 2. アニメーション速度の調整

[src/App.svelte](src/App.svelte) のSCSS変数を変更：

```scss
$fade-duration: 0.4s;  // フェードイン/アウトの速度
$fade-easing: ease;    // イージング関数
```

### 3. 新しいセクションの追加

1. [src/App.svelte](src/App.svelte) の `backgrounds` 配列に背景情報を追加：

```typescript
const backgrounds = [
  // 既存のセクション...
  {
    id: 'section3',  // ユニークなID
    videoId: 'YOUR_BRIGHTCOVE_VIDEO_ID',
    poster: 'https://example.com/poster3.webp'
  }
];
```

2. HTML部分にセクションを追加：

```svelte
<section class="content-block" data-section-id="section3" bind:this={sectionElements.section3}>
  <div class="content-block-contents">
    <QuizSection
      questionText="新しい質問"
      choices={['選択肢1', '選択肢2']}
      explanations={['解説1', '解説2']}
      explanationImages={['images/1.png', 'images/2.png']}
      show={showQuestion3}
    />
    <!-- テキストコンテンツ -->
  </div>
</section>
```

3. 状態変数を追加：

```typescript
let showQuestion3 = false;
let showAnswer3 = false;
```

4. `sectionElements` に追加：

```typescript
let sectionElements: { [key: string]: HTMLElement | null } = {
  hero: null,
  section1: null,
  section2: null,
  section3: null  // 追加
};
```

### 4. Brightcove動画IDの変更

各セクションの `videoId` を変更するだけです：

```typescript
const backgrounds = [
  {
    id: 'hero',
    videoId: 'NEW_VIDEO_ID_HERE',  // ← ここを変更
    poster: 'https://example.com/new-poster.webp'
  }
];
```

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## ブラウザ対応

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- モバイルブラウザ（iOS Safari、Chrome for Android）

**注意**: Brightcove動画の自動再生はブラウザの制限により、モバイルでは制限される場合があります。`poster` 属性で画像フォールバックを必ず設定してください。

---

## パフォーマンス最適化

1. **動画の遅延読み込み**: アクティブな背景のみ再生、非表示時は一時停止
2. **画像の遅延読み込み**: `loading="lazy"` 属性を使用
3. **SCSS のグローバルインポート**: Vite設定で `mixins.scss` を自動インポート
4. **本番ビルド時の最適化**: console/debugger の自動削除

---

## トラブルシューティング

### 動画が自動再生されない

- ブラウザの自動再生ポリシーを確認
- `muted` 属性が設定されているか確認
- `poster` 属性でフォールバック画像を設定

### 背景が切り替わらない

- `data-section-id` が正しく設定されているか確認
- `sectionElements` に対応するキーが存在するか確認
- ブラウザのコンソールで IntersectionObserver のエラーを確認

### ロゴが毎回表示される

- `sessionStorage` がブロックされていないか確認（プライベートブラウジングモード等）
- ブラウザのコンソールで `sessionStorage.getItem('hasVisited')` を確認

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026年1月21日 | 初版作成（ロゴ判定、背景切り替え、コンポーネント分割実装） |

---

## ライセンス・著作権

プロジェクトの著作権情報をここに記載してください。
