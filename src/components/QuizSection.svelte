<script lang="ts">
  export let title: string = '';
  export let questionText: string;
  export let choices: string[];
  export let explanations: string[];
  export let explanationImages: string[];
  export let show: boolean = false;
  export let isHero: boolean = false;
  export let onAnswerShown: (() => void) | null = null;

  let selectedChoice: number | null = null;
  let showAnswer = false;

  // 選択肢をクリックしたときの処理
  function handleChoiceClick(choiceIndex: number) {
    // 既に選択済みの場合は何もしない
    if (selectedChoice !== null) return;

    selectedChoice = choiceIndex;
    // 少し待ってからanswerをフェードイン
    setTimeout(() => {
      showAnswer = true;
      if (onAnswerShown) {
        onAnswerShown();
      }
    }, 300);
  }
</script>

<div class="quiz-section {isHero ? 'hero-quiz' : 'content-quiz'}" class:show>
  {#if title && isHero}
    <div class="quiz-section__main-title">
      <h1>{title}</h1>
    </div>
  {/if}

  <div class="quiz-section__text">
    <p>{questionText}</p>
  </div>

  <div class="quiz-section__choices" class:has-selection={selectedChoice !== null}>
    <ul>
      {#each choices as choice, index}
        <li
          on:click={() => handleChoiceClick(index)}
          class:selected={selectedChoice === index}
        >
          {choice}
        </li>
      {/each}
    </ul>
  </div>

  <!-- 解説をインライン展開 -->
  {#if showAnswer && selectedChoice !== null}
    <div class="quiz-section__answer" class:show={showAnswer}>
      <h2>
        {explanations[selectedChoice]}
      </h2>
      {#if explanationImages[selectedChoice]}
        <div class="quiz-section__answer-image">
          <img src={explanationImages[selectedChoice]} loading="lazy" alt="" />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  $fade-duration: 0.4s;
  $fade-easing: ease;

  .quiz-section {
    width: 90%;
    max-width: 720px;
    color: #fff;
    margin: 0 0 50vh;
    margin: 0 0 50lvh;

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

    .quiz-section__main-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 2em;
    }

    .quiz-section__text {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 2rem;
    }

    .quiz-section__choices {
      width: 100%;

      // 選択済みの場合のスタイル
      &.has-selection ul li {
        cursor: default;
      }

      &.has-selection ul li:not(.selected) {
        opacity: 0.5;
      }

      ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1em;
        font-size: 1.2rem;

        li {
          width: calc(50% - 0.5em);
          border: 2px solid #fff;
          padding: 0.5em 1em;
          border-radius: 0.5em;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s, color 0.3s;

          &.selected {
            background: rgba(255, 255, 255, 0.9);
            color: #000;
            cursor: default;
          }
        }
      }
    }
  }

  .quiz-section__answer {
    margin-top: 3rem;
    padding: 2rem 0;
    color: #fff;

    // 初期状態：非表示（高さなし）
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    transition: max-height $fade-duration $fade-easing,
                opacity $fade-duration $fade-easing,
                visibility 0s $fade-duration;

    // .showクラスが追加されたらフェードイン
    &.show {
      max-height: 2000px; // 十分な高さを確保
      opacity: 1;
      visibility: visible;
      transition: max-height $fade-duration $fade-easing,
                  opacity $fade-duration $fade-easing,
                  visibility 0s 0s;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
    }

    .quiz-section__answer-image {
      margin-bottom: 1.5rem;

      img {
        width: 100%;
        height: auto;
        line-height: 0;
      }
    }
  }
</style>
