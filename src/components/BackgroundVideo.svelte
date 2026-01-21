<script lang="ts">
  import { onMount } from 'svelte';

  export let videoId: string;
  export let poster: string;
  export let accountId: string = '4508222237001';
  export let playerId: string = 'ryIf3h4rG';
  export let isActive: boolean = false;
  export let grayscale: boolean = false;

  let videoElement: HTMLElement | null = null;
  let player: any = null;
  let elementId = `video-${videoId}`;

  // Brightcove動画のHTML
  const videoHTML = `
    <video-js
    preload="auto"
    id="${elementId}"
    data-account="${accountId}"
    data-player="${playerId}"
    data-embed="default"
    data-video-id="${videoId}"
    data-playlist-id=""
    data-application-id=""
    class="vjs-fluid"
    muted
    loop
    playsinline
    poster="${poster}">
    </video-js>
  `;

  onMount(() => {
    // プレイヤーの初期化を待つ
    const checkPlayer = setInterval(() => {
      videoElement = document.getElementById(elementId) as any;
      if (videoElement && (videoElement as any).player) {
        player = (videoElement as any).player;

        // プレイヤーの準備ができたら設定
        player.ready(() => {
          player.muted(true);

          // アクティブな場合のみ自動再生
          if (isActive) {
            player.play().catch((error: Error) => {
              console.log('自動再生エラー:', error);
            });
          }
        });

        clearInterval(checkPlayer);
      }
    }, 100);

    // 5秒経っても初期化されない場合はクリーンアップ
    setTimeout(() => {
      clearInterval(checkPlayer);
    }, 5000);

    return () => {
      clearInterval(checkPlayer);
    };
  });

  // isActiveが変更されたら動画の再生/停止を制御
  $: if (player) {
    if (isActive) {
      player.play().catch((error: Error) => {
        console.log('再生エラー:', error);
      });
    } else {
      player.pause();
    }
  }
</script>

<div class="background-video" class:active={isActive} class:grayscale={grayscale && isActive}>
  {@html videoHTML}
</div>

<style lang="scss">
  .background-video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.6s ease, filter 0.8s ease;
    pointer-events: none;

    &.active {
      opacity: 1;
    }

    &.grayscale {
      filter: grayscale(1) brightness(0.5);
    }

    :global(.vjs-fluid) {
      padding-top: 0;
    }

    :global(.vjs-poster) {
      width: 100%;
      height: 100%;
      background-size: cover;
    }

    :global(video),
    :global(video-js) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: relative;
    }
  }
</style>
