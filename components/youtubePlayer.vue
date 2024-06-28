<script setup>
   const props = defineProps({
      volume: { type: Number },
      videoId: { type: String, default: "rViZf2t7BKo?si=Ska5TBE71mvbaLl6" },
      playerId: { type: String, default: "playerA" },
   });

   watch(
      () => props.volume,
      (newVolume) => {
         setVolume(newVolume);
      }
   );

   watch(
      () => props.videoId,
      (newVideoId, oldVideoId) => {
         setVideoId(newVideoId);
         oldVideoId.concat(newVideoId);
      }
   );

   let player;
   let onYouTubeIframeAPIReady = () => {
      player = new YT.Player(props.playerId, {
         height: "390",
         width: "640",
         videoId: props.videoId,
         playerVars: {
            playsinline: 1,
         },
         events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
         },
      });
   };

   let onPlayerReady = (event) => {
      event.target.playVideo();
   };

   let done = false;
   let onPlayerStateChange = (event) => {
      if (event.data == YT.PlayerState.PLAYING && !done) {
         //does nothing for now
      }
   };
   let stopVideo = () => {
      player.stopVideo();
   };

   let muteVideo = () => {
      player.isMuted() ? player.unMute() : player.mute();
   };

   let setVolume = (volume) => {
      if (volume > 100) {
         player.setVolume(100);
         return;
      }
      player.setVolume(volume * 2);
   };
   let setVideoId = (videoId) => {
      player.loadVideoById(videoId);
   };

   onMounted(() => {
      onYouTubeIframeAPIReady();
   });
</script>
<template>
   <div class="player-container">
      <img
         src="assets/images/8bit-tv.png"
         class="player-tv"
      />
      <div
         :id="props.playerId"
         class="player"
      ></div>
   </div>
</template>

<style>
   .player-container {
      height: 300px;
      width: 300px;
      padding: 30px 25px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      /* border-radius: 40px; */
      /* background-color: #525252; */
   }
   .player-tv {
      width: 100%;
      height: 100%;
      z-index: -1;
      position: absolute;
   }
   .player {
      position: absolute;
      height: 152px;
      width: 46%;
      max-width: 160px;
      left: 14%;
      top: 118px;
      border-radius: 15%;
      box-sizing: border-box;
      background-color: rgba(128, 128, 128, 0.117);
   }
</style>
