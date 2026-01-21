<script lang="ts">
  export let title: string = '';
  export let questionText: string;
  export let choices: string[];
  export let explanations: string[];
  export let explanationImages: string[];
  export let show: boolean = false;
  export let isHero: boolean = false;
  export let onAnswerShown: (() => void) | null = null;
  export let onAnswerHidden: (() => void) | null = null;

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

  // オーバーレイクリックで解説を閉じる
  function closeAnswer() {
    showAnswer = false;
    selectedChoice = null;
    if (onAnswerHidden) {
      onAnswerHidden();
    }
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

  <!-- 解説モーダルオーバーレイ -->
  {#if showAnswer}
    <div class="modal-overlay" on:click={closeAnswer}>
      <div class="quiz-section__answer show" on:click|stopPropagation>
        <h2>
          {explanations[selectedChoice ?? 0]}
        </h2>
        {#if explanationImages[selectedChoice ?? 0]}
          <div class="quiz-section__answer-image">
            <img src={explanationImages[selectedChoice ?? 0]} loading="lazy" alt="" />
          </div>
        {/if}
        <button class="close-button" on:click={closeAnswer}>閉じる</button>
      </div>
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

  // モーダルオーバーレイ
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.25);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  .quiz-section__answer {
    // background: rgba(0, 0, 0, 0.95);
    // border: 2px solid #fff;
    // border-radius: 1rem;
    padding: 2rem;
    max-width: 720px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    color: #fff;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
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

    .close-button {
      display: block;
      margin: 2rem auto 0;
      padding: 0.75em 2em;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 0.5em;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s, color 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }
</style>
