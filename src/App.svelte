<script lang="ts">
  import { onMount } from 'svelte';
  import BackgroundVideo from './components/BackgroundVideo.svelte';
  import QuizSection from './components/QuizSection.svelte';

  // 背景動画の設定
  const backgrounds = [
    {
      id: 'hero',
      videoId: '6375289208112',
      poster: 'https://www.asahicom.jp/special/waza-racewalking/images/intro-bg.webp'
    },
    {
      id: 'section1',
      videoId: '6385342241112',
      poster: 'https://www.asahicom.jp/special/waza-racewalking/images/intro-bg.webp'
    },
    {
      id: 'section2',
      videoId: '6385340500112',
      poster: 'https://www.asahicom.jp/special/waza-racewalking/images/intro-bg.webp'
    },
    {
      id: 'section3',
      videoId: '6377678680112',
      poster: 'https://www.asahicom.jp/special/waza-racewalking/images/intro-bg.webp'
    }
  ];

  // アニメーション制御用の変数
  let showH1 = false;
  let showQuestion = false;
  let showQuestion1 = false;
  let showQuestion2 = false;
  let showQuestion3 = false;

  // 現在アクティブなセクション
  let activeSection = 'hero';

  // クイズ解説表示時の背景グレーアウト
  let showAnswerHero = false;
  let showAnswer1 = false;
  let showAnswer2 = false;
  let showAnswer3 = false;

  // IntersectionObserverのthreshold（調整可能）
  const INTERSECTION_THRESHOLD = 0.3;

  // セクション要素の参照
  let sectionElements: { [key: string]: HTMLElement | null } = {
    hero: null,
    section1: null,
    section2: null,
    section3: null
  };

  onMount(() => {
    // Brightcoveスクリプトを動的に読み込む
    const script = document.createElement('script');
    script.src = 'https://players.brightcove.net/4508222237001/ryIf3h4rG_default/index.min.js';
    document.head.appendChild(script);

    // ページロード時に毎回ロゴアニメーション実行
    // 1. 少し待ってからh1をフェードイン
    setTimeout(() => {
      showH1 = true;
    }, 500);

    // 2. 2秒表示後にh1をフェードアウト
    setTimeout(() => {
      showH1 = false;
    }, 3000);

    // 3. h1のフェードアウト後にquestionをフェードイン（ロゴ表示中はクイズ非表示）
    setTimeout(() => {
      showQuestion = true;
      showQuestion1 = true;
      showQuestion2 = true;
      showQuestion3 = true;
    }, 3600);

    // IntersectionObserverでセクションの表示を検知
    // 各セクションの表示状態を記録
    const sectionVisibility: { [key: string]: number } = {
      hero: 0,
      section1: 0,
      section2: 0,
      section3: 0
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    };

    const observer = new IntersectionObserver((entries) => {
      // 各セクションの表示率を更新
      entries.forEach(entry => {
        const sectionId = entry.target.getAttribute('data-section-id');
        if (sectionId) {
          sectionVisibility[sectionId] = entry.intersectionRatio;
        }
      });

      // 最も表示率が高いセクションを見つける
      let maxRatio = 0;
      let targetSection = 'hero';

      Object.keys(sectionVisibility).forEach(key => {
        if (sectionVisibility[key] > maxRatio) {
          maxRatio = sectionVisibility[key];
          targetSection = key;
        }
      });

      // アクティブセクションを更新
      activeSection = targetSection;
    }, observerOptions);

    // 各セクションを監視
    Object.keys(sectionElements).forEach(key => {
      const element = sectionElements[key];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<main>
  <!-- 単一背景コンテナ -->
  <div class="background-container">
    <BackgroundVideo
      videoId={backgrounds[0].videoId}
      poster={backgrounds[0].poster}
      isActive={activeSection === 'hero'}
      grayscale={showAnswerHero}
    />
    <BackgroundVideo
      videoId={backgrounds[1].videoId}
      poster={backgrounds[1].poster}
      isActive={activeSection === 'section1'}
      grayscale={showAnswer1}
    />
    <BackgroundVideo
      videoId={backgrounds[2].videoId}
      poster={backgrounds[2].poster}
      isActive={activeSection === 'section2'}
      grayscale={showAnswer2}
    />
    <BackgroundVideo
      videoId={backgrounds[3].videoId}
      poster={backgrounds[3].poster}
      isActive={activeSection === 'section3'}
      grayscale={showAnswer3}
    />
  </div>

  <section class="hero" data-section-id="hero" bind:this={sectionElements.hero}>
    <h1 class:show={showH1}>
      <span><img src="https://www.asahicom.jp/special/waza-racewalking/images/project-title-logo.svg" width="600" height="96" alt="技-THE TECHNIQUE" /></span>
    </h1>

    <div class="hero-contents">
      <QuizSection
        title="コンテンツタイトル"
        questionText="あなたはどちらを選びますか？"
        choices={['すぐに蹴る', '待ってから蹴る']}
        explanations={['すぐに蹴ると〓', '待ってから蹴ると〓']}
        explanationImages={['images/d_1.png', 'images/d_1.png']}
        show={showQuestion}
        isHero={true}
        onAnswerShown={() => { showAnswerHero = true; }}
        onAnswerHidden={() => { showAnswerHero = false; }}
      />

      <div class="hero-text">
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
      </div>
      <div class="hero-text-image">
        <img src="images/d_1.png" loading="lazy" alt="" />
      </div>
    </div>
  </section>

  <section class="content-block" data-section-id="section1" bind:this={sectionElements.section1}>
    <div class="content-block-contents">
      <QuizSection
        questionText="2つ目の質問：あなたはどちらを選びますか？"
        choices={['選択肢1-1', '選択肢1-2']}
        explanations={['選択肢1-1を選ぶと〓', '選択肢1-2を選ぶと〓']}
        explanationImages={['images/d_1.png', 'images/d_1.png']}
        show={showQuestion1}
        onAnswerShown={() => { showAnswer1 = true; }}
        onAnswerHidden={() => { showAnswer1 = false; }}
      />

      <div class="content-block-text">
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
      </div>
      <div class="content-block-text-image">
        <img src="images/d_1.png" loading="lazy" alt="" />
      </div>
    </div>
  </section>

  <section class="content-block" data-section-id="section2" bind:this={sectionElements.section2}>
    <div class="content-block-contents">
      <QuizSection
        questionText="3つ目の質問：あなたはどちらを選びますか？"
        choices={['選択肢2-1', '選択肢2-2']}
        explanations={['選択肢2-1を選ぶと〓', '選択肢2-2を選ぶと〓']}
        explanationImages={['images/d_1.png', 'images/d_1.png']}
        show={showQuestion2}
        onAnswerShown={() => { showAnswer2 = true; }}
        onAnswerHidden={() => { showAnswer2 = false; }}
      />

      <div class="content-block-text">
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
      </div>
      <div class="content-block-text-image">
        <img src="images/d_1.png" loading="lazy" alt="" />
      </div>
    </div>
  </section>

  <section class="content-block" data-section-id="section3" bind:this={sectionElements.section3}>
    <div class="content-block-contents">
      <QuizSection
        questionText="4つ目の質問：あなたはどちらを選びますか？"
        choices={['選択肢3-1', '選択肢3-2']}
        explanations={['選択肢3-1を選ぶと〓', '選択肢3-2を選ぶと〓']}
        explanationImages={['images/d_1.png', 'images/d_1.png']}
        show={showQuestion3}
        onAnswerShown={() => { showAnswer3 = true; }}
        onAnswerHidden={() => { showAnswer3 = false; }}
      />

      <div class="content-block-text">
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
        <p>テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト</p>
      </div>
      <div class="content-block-text-image">
        <img src="images/d_1.png" loading="lazy" alt="" />
      </div>
    </div>
  </section>
</main>

<style lang="scss">
  // アニメーション設定（ここで調整可能）
  $fade-duration: 0.4s;
  $fade-easing: ease;

  main {
    width: 100%;
    position: relative;
  }

  // 単一背景コンテナ
  .background-container {
    width: 100%;
    height: 100vh;
    height: 100lvh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: hidden;
  }

  .hero {
    width: 100%;
    min-height: 100vh;
    min-height: 100lvh;
    position: relative;

    > h1 {
      display: block;
      max-width: 460px;
      width: 86%;
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;

      // 初期状態：非表示
      opacity: 0;
      visibility: hidden;
      transition: opacity $fade-duration $fade-easing,
                  visibility 0s $fade-duration;

      // .showクラスが追加されたらフェードイン
      &.show {
        opacity: 1;
        visibility: visible;
        transition: opacity $fade-duration $fade-easing,
                    visibility 0s 0s;
      }

      img {
        width: 100%;
        height: auto;
        line-height: 0;
      }
    }

    .hero-contents {
      width: 100%;
      min-height: 100vh;
      min-height: 100lvh;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      margin-top: 35vh;
      margin-top: 35lvh;

      .hero-text {
        max-width: 720px;
        width: 90%;
        margin: 4em auto;
        text-align: left;
        p {
          color: #fff;
          font-size: 1.125rem;
          line-height: 1.85;
          font-weight: bold;
          margin-bottom: 1rem;
        }
      }

      .hero-text-image {
        width: 90%;
        max-width: 720px;
        margin-bottom: 8rem;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }

  .content-block {
    width: 100%;
    min-height: 100vh;
    min-height: 100lvh;
    position: relative;

    .content-block-contents {
      width: 100%;
      min-height: 100vh;
      min-height: 100lvh;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      margin-top: 35vh;
      margin-top: 35lvh;

      .content-block-text {
        max-width: 720px;
        width: 90%;
        margin: 4em auto;
        text-align: left;
        p {
          color: #fff;
          font-size: 1.125rem;
          line-height: 1.85;
          font-weight: bold;
          margin-bottom: 1rem;
        }
      }

      .content-block-text-image {
        width: 90%;
        max-width: 720px;
        margin-bottom: 8rem;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }
  }
</style>
