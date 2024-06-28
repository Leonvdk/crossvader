TODO:
- play / pause button
- show video duration
- create cue
- add video to cue func.
- play next / prev
- 

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
      (newVideoId) => {
         setVideoId(newVideoId);
      }
   );

   let player;
   let playbackRate = ref(1);

   let onYouTubeIframeAPIReady = () => {
      player = new YT.Player(props.playerId, {
         height: "390",
         width: "640",
         videoId: props.videoId,
         playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 0,
            iv_load_policy: 3,
         },
         events: {
            onReady: (e) => {
               e.target.playVideo();
               e.target.setPlaybackRate(playbackRate.value);
            },
            onStateChange: onPlayerStateChange,
         },
      });
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

   let setPlaybackRate = (event) => {
      let newPlaybackRate = Number(event.target.value);
      player.setPlaybackRate(newPlaybackRate);
   };

   onMounted(() => {
      onYouTubeIframeAPIReady();
   });
</script>
<template>
   <div class="player-sliders-container">
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
      <div class="sliders-container">
         <div class="slider-container">
            <p class="slider-label">Pitch</p>
            <input
               class="playbackrate-slider"
               v-model="playbackRate"
               type="range"
               min="0.5"
               max="1.5"
               step="0.02"
               :oninput="(e) => setPlaybackRate(e)"
            />
         </div>
      </div>
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
   .player-sliders-container {
      display: flex;
      flex-direction: column;
   }
   .sliders-container {
      height: 50px;
      position: relative;
      z-index: 4;
      display: flex;
      justify-content: flex-end;
      padding: 30px 30px;
      padding-right: 80px;
      background-color: #020030bf;
      border-radius: 20px;
      display: none;
   }
   .slider-container {
      display: flex;
      align-items: flex-start;
      position: relative;
   }
   .slider-label {
      margin: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 500;
      color: #fff;
      text-shadow: 1px 1px 3px #000;
   }
   .playbackrate-slider {
      transform: scale(0.7) translate(-20%);
      position: relative;
      top: -30px;
   }
</style>
