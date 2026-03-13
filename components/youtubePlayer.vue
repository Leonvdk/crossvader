<script setup>
const props = defineProps({
   volume: { type: Number, default: 100 },
   videoId: { type: String, default: "" },
   playerId: { type: String, default: "playerA" },
   deckLabel: { type: String, default: "A" },
});

const emit = defineEmits(["ended"]);

let player;
let playbackRate = ref(1);
let deckVolume = ref(100);
let isMuted = ref(false);
let isPlaying = ref(false);
let currentTime = ref(0);
let duration = ref(0);
let isSeeking = ref(false);
let progressInterval = null;

let cuePoints = ref([null, null, null, null]);

let loopEnabled = ref(false);
let loopIn = ref(null);
let loopOut = ref(null);

let bpm = ref(null);
let bpmEditing = ref(false);
let bpmInput = ref("");
let tapTimes = [];

let applyVolume = (vol) => {
   if (!player || !player.setVolume) return;
   player.setVolume(Math.min(100, Math.max(0, vol)));
};

let computedVolume = computed(() => {
   return Math.round(props.volume * deckVolume.value / 100);
});

watchEffect(() => {
   applyVolume(computedVolume.value);
});

watch(playbackRate, (newRate) => {
   if (player && player.setPlaybackRate) {
      player.setPlaybackRate(newRate);
   }
});

watch(
   () => props.videoId,
   (newVideoId) => {
      if (!newVideoId) return;
      if (typeof window === "undefined") return;
      if (!player) {
         nextTick(() => initPlayer());
      } else if (player.loadVideoById) {
         player.loadVideoById(cleanVideoId(newVideoId));
         cuePoints.value = [null, null, null, null];
         loopEnabled.value = false;
         loopIn.value = null;
         loopOut.value = null;
         bpm.value = null;
         tapTimes = [];
      }
   }
);

let cleanVideoId = (id) => id ? id.split("?")[0].split("&")[0] : id;
let ytReady = ref(false);

if (typeof window !== "undefined") {
   if (window._ytApiReady) {
      ytReady.value = true;
   }
   if (!window._ytApiCallbacks) {
      window._ytApiCallbacks = [];
      let prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
         window._ytApiReady = true;
         if (prevCallback) prevCallback();
         window._ytApiCallbacks.forEach((cb) => cb());
         window._ytApiCallbacks = [];
      };
   }
}

let createPlayer = () => {
   if (player) return;
   let el = document.getElementById(props.playerId);
   if (!el) return;

   let vid = cleanVideoId(props.videoId);
   let opts = {
      height: "390",
      width: "640",
      playerVars: {
         playsinline: 1,
         controls: 0,
         iv_load_policy: 3,
      },
      events: {
         onReady: (e) => {
            if (vid) {
               e.target.playVideo();
            }
            e.target.setPlaybackRate(playbackRate.value);
            applyVolume(computedVolume.value);
            startProgressTracking();
         },
         onStateChange: onPlayerStateChange,
      },
   };
   if (vid) {
      opts.videoId = vid;
      opts.playerVars.autoplay = 1;
   }
   player = new YT.Player(props.playerId, opts);
};

let initPlayer = () => {
   if (player) return;
   if (typeof window === "undefined") return;
   if (window._ytApiReady) {
      createPlayer();
   } else {
      window._ytApiCallbacks.push(() => {
         nextTick(() => createPlayer());
      });
   }
};

let onPlayerStateChange = (event) => {
   isPlaying.value = event.data === YT.PlayerState.PLAYING;
   if (event.data === YT.PlayerState.PLAYING) {
      duration.value = player.getDuration();
   }
   if (event.data === YT.PlayerState.ENDED) {
      emit("ended");
   }
};

let startProgressTracking = () => {
   if (progressInterval) clearInterval(progressInterval);
   progressInterval = setInterval(() => {
      if (!player || !player.getCurrentTime) return;
      if (!isSeeking.value) {
         currentTime.value = player.getCurrentTime();
      }
      if (player.getDuration) {
         duration.value = player.getDuration();
      }
      applyVolume(computedVolume.value);
      if (loopEnabled.value && loopIn.value !== null && loopOut.value !== null) {
         if (currentTime.value >= loopOut.value) {
            player.seekTo(loopIn.value, true);
         }
      }
   }, 250);
};

let toggleVideoPlay = () => {
   if (!player || !player.getPlayerState) return;
   if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
   } else {
      player.playVideo();
   }
};

let toggleMute = () => {
   if (!player) return;
   if (player.isMuted()) {
      player.unMute();
      isMuted.value = false;
   } else {
      player.mute();
      isMuted.value = true;
   }
};

let seekTo = (seconds) => {
   if (player && player.seekTo) {
      player.seekTo(seconds, true);
   }
};

let onSeek = (event) => {
   let seekTime = parseFloat(event.target.value);
   currentTime.value = seekTime;
   seekTo(seekTime);
};

let resetPitch = () => {
   playbackRate.value = 1;
};

let handleCueClick = (index, event) => {
   if (event.shiftKey || cuePoints.value[index] === null) {
      cuePoints.value[index] = currentTime.value;
   } else {
      seekTo(cuePoints.value[index]);
   }
};

let jumpToCue = (index) => {
   if (cuePoints.value[index] !== null) {
      seekTo(cuePoints.value[index]);
   }
};

let setLoopIn = () => {
   loopIn.value = currentTime.value;
};

let setLoopOut = () => {
   loopOut.value = currentTime.value;
};

let toggleLoop = () => {
   if (loopIn.value !== null && loopOut.value !== null) {
      loopEnabled.value = !loopEnabled.value;
   }
};

let clearLoop = () => {
   loopEnabled.value = false;
   loopIn.value = null;
   loopOut.value = null;
};

let formatTime = (seconds) => {
   if (!seconds || isNaN(seconds)) return "0:00";
   let mins = Math.floor(seconds / 60);
   let secs = Math.floor(seconds % 60);
   return `${mins}:${secs.toString().padStart(2, "0")}`;
};

let handleTap = () => {
   let now = performance.now();
   if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
      tapTimes = [];
   }
   tapTimes.push(now);
   if (tapTimes.length > 8) tapTimes.shift();
   if (tapTimes.length >= 2) {
      let total = 0;
      for (let i = 1; i < tapTimes.length; i++) {
         total += tapTimes[i] - tapTimes[i - 1];
      }
      bpm.value = Math.round(60000 / (total / (tapTimes.length - 1)));
   }
};

let startBpmEdit = () => {
   bpmEditing.value = true;
   bpmInput.value = bpm.value ? String(bpm.value) : "";
};

let finishBpmEdit = () => {
   let val = parseInt(bpmInput.value);
   if (val > 0 && val <= 300) {
      bpm.value = val;
   }
   bpmEditing.value = false;
};

defineExpose({
   togglePlay: toggleVideoPlay,
   getPlaybackRate: () => playbackRate.value,
   setPlaybackRate: (rate) => {
      playbackRate.value = rate;
   },
   getBpm: () => bpm.value,
   seekTo,
   jumpToCue,
});

onMounted(() => {
   if (props.videoId) {
      nextTick(() => initPlayer());
   }
});

onUnmounted(() => {
   if (progressInterval) clearInterval(progressInterval);
});
</script>

<template>
   <div class="deck">
      <div class="deck-label-badge">{{ deckLabel }}</div>

      <div class="player-container">
         <img src="assets/images/8bit-tv.png" class="player-tv" />
         <div :id="props.playerId" class="player"></div>
         <button @click="toggleVideoPlay" class="play-button"
            :class="{ playing: isPlaying }"></button>
         <button @click="toggleMute" class="mute-button"
            :class="{ muted: isMuted }">M</button>
      </div>

      <div class="mobile-transport">
         <button @click="toggleVideoPlay" class="transport-btn"
            :class="{ playing: isPlaying }">{{ isPlaying ? 'PAUSE' : 'PLAY' }}</button>
         <button @click="toggleMute" class="transport-btn"
            :class="{ muted: isMuted }">{{ isMuted ? 'UNMUTE' : 'MUTE' }}</button>
      </div>

      <div class="progress-container">
         <span class="time-display">{{ formatTime(currentTime) }}</span>
         <input
            type="range"
            class="progress-bar"
            min="0"
            :max="duration || 1"
            :value="currentTime"
            step="0.5"
            @input="onSeek"
            @mousedown="isSeeking = true"
            @touchstart="isSeeking = true"
            @mouseup="isSeeking = false"
            @touchend="isSeeking = false"
         />
         <span class="time-display">{{ formatTime(duration) }}</span>
      </div>

      <div class="controls-panel">
         <div class="control-row">
            <span class="ctrl-label">VOL</span>
            <input type="range" class="ctrl-slider" min="0" max="100"
               v-model.number="deckVolume" />
            <span class="ctrl-value">{{ deckVolume }}</span>
         </div>

         <div class="control-row">
            <span class="ctrl-label">PITCH</span>
            <input type="range" class="ctrl-slider" min="0.5" max="1.5"
               step="0.02" v-model.number="playbackRate" />
            <span class="ctrl-value">{{ playbackRate.toFixed(2) }}x</span>
            <button class="ctrl-btn" @click="resetPitch">RST</button>
         </div>

         <div class="control-row">
            <span class="ctrl-label">BPM</span>
            <button class="ctrl-btn tap-btn" @click="handleTap">TAP</button>
            <span
               v-if="!bpmEditing"
               class="bpm-display"
               @click="startBpmEdit"
               title="Click to type BPM"
            >{{ bpm || '--' }}</span>
            <input
               v-else
               type="number"
               class="bpm-input"
               v-model="bpmInput"
               @blur="finishBpmEdit"
               @keyup.enter="finishBpmEdit"
               min="1"
               max="300"
               ref="bpmInputRef"
            />
         </div>

         <div class="control-row">
            <span class="ctrl-label">CUE</span>
            <div class="cue-group">
               <button
                  v-for="(cue, i) in cuePoints"
                  :key="i"
                  class="ctrl-btn cue-btn"
                  :class="{ 'cue-set': cue !== null }"
                  :title="cue !== null ? formatTime(cue) + ' (Shift+click to re-set)' : 'Click to set'"
                  @click="handleCueClick(i, $event)"
               >{{ i + 1 }}</button>
            </div>
         </div>

         <div class="control-row">
            <span class="ctrl-label">LOOP</span>
            <button class="ctrl-btn" :class="{ active: loopIn !== null }"
               @click="setLoopIn">IN</button>
            <button class="ctrl-btn" :class="{ active: loopOut !== null }"
               @click="setLoopOut">OUT</button>
            <button class="ctrl-btn" :class="{ active: loopEnabled }"
               :disabled="loopIn === null || loopOut === null"
               @click="toggleLoop">{{ loopEnabled ? "ON" : "OFF" }}</button>
            <button class="ctrl-btn" @click="clearLoop">CLR</button>
         </div>
      </div>
   </div>
</template>

<style>
.deck {
   display: flex;
   flex-direction: column;
   align-items: center;
   position: relative;
   width: 100%;
   max-width: 350px;
}

.deck-label-badge {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 1rem;
   color: #C10AD7;
   text-shadow: 0 0 6px #C10AD7, 1px 1px #000;
   margin-bottom: 4px;
   letter-spacing: 2px;
}

.player-container {
   height: 300px;
   width: 300px;
   padding: 30px 25px;
   position: relative;
   display: flex;
   justify-content: center;
   align-items: center;
   transform-origin: top center;
   transform: scale(0.5);
   margin-bottom: -160px;

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

   .play-button {
      position: absolute;
      right: 60px;
      top: 125px;
      height: 32px;
      width: 32px;
      cursor: pointer;
      background-image: url(assets/images/play-pause.png);
      background-size: 45%;
      background-position: center;
      background-repeat: no-repeat;
      background-color: #2a1d5c;
      border: none;
      border-radius: 0;
      box-shadow:
         -2px 0 0 0 #6a5aad,
         2px 0 0 0 #2a1d3a,
         0 -2px 0 0 #6a5aad,
         0 2px 0 0 #2a1d3a;
      image-rendering: pixelated;
      display: none;
      filter: grayscale(100%) brightness(150%);

      &:active {
         box-shadow:
            -2px 0 0 0 #2a1d3a,
            2px 0 0 0 #6a5aad,
            0 -2px 0 0 #2a1d3a,
            0 2px 0 0 #6a5aad;
      }

      &.playing {
         background-color: #0a6e5c;
         box-shadow:
            -2px 0 0 0 #0ad7a7,
            2px 0 0 0 #043d33,
            0 -2px 0 0 #0ad7a7,
            0 2px 0 0 #043d33;
         filter: none;
      }
   }

   .mute-button {
      position: absolute;
      right: 60px;
      top: 175px;
      height: 32px;
      width: 32px;
      cursor: pointer;
      background-color: #2a1d5c;
      border: none;
      border-radius: 0;
      box-shadow:
         -2px 0 0 0 #6a5aad,
         2px 0 0 0 #2a1d3a,
         0 -2px 0 0 #6a5aad,
         0 2px 0 0 #2a1d3a;
      font-family: "Pixeloid", Arial, Helvetica, sans-serif;
      font-size: 0.4rem;
      color: #e2e2e2;
      font-weight: 700;
      display: none;

      &:active {
         box-shadow:
            -2px 0 0 0 #2a1d3a,
            2px 0 0 0 #6a5aad,
            0 -2px 0 0 #2a1d3a,
            0 2px 0 0 #6a5aad;
      }

      &.muted {
         background-color: #6e1a1a;
         box-shadow:
            -2px 0 0 0 #d44a4a,
            2px 0 0 0 #3a0a0a,
            0 -2px 0 0 #d44a4a,
            0 2px 0 0 #3a0a0a;
         color: #fff;
      }
   }
}

.mobile-transport {
   display: flex;
   gap: 8px;
   margin-top: -10px;
   margin-bottom: 4px;
   z-index: 2;
}

.transport-btn {
   background: #2a1d5c;
   color: #e2e2e2;
   border: 2px solid;
   border-color: #6a5aad #2a1d3a #2a1d3a #6a5aad;
   padding: 8px 16px;
   min-height: 44px;
   min-width: 80px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.5rem;
   cursor: pointer;
   text-transform: uppercase;
   letter-spacing: 1px;
   transition: background 0.15s;
   touch-action: manipulation;

   &:active {
      border-color: #2a1d3a #6a5aad #6a5aad #2a1d3a;
   }

   &.playing {
      background: #0a6e5c;
      border-color: #0ad7a7 #043d33 #043d33 #0ad7a7;
      color: #fff;
      text-shadow: 0 0 3px #0ad7a7;
   }

   &.muted {
      background: #6e1a1a;
      border-color: #d44a4a #3a0a0a #3a0a0a #d44a4a;
      color: #fff;
      text-shadow: 0 0 3px #d44a4a;
   }
}

.progress-container {
   display: flex;
   align-items: center;
   gap: 6px;
   width: min(260px, calc(100vw - 40px));
   margin-top: 0;
   position: relative;
   z-index: 2;
}

.time-display {
   font-family: "Pixeloid", monospace;
   font-size: 0.55rem;
   color: #9fb5c3;
   min-width: 36px;
   text-align: center;
   text-shadow: 1px 1px 2px #000;
}

.progress-bar {
   flex: 1;
   height: 28px;
   -webkit-appearance: none;
   appearance: none;
   background: transparent;
   cursor: pointer;
   margin: 0;
   touch-action: manipulation;

   &:focus { outline: none; }

   &::-webkit-slider-runnable-track {
      height: 6px;
      background: #3a2d6d;
      border: 1px solid #555;
      border-radius: 0;
   }

   &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 12px;
      background: #C10AD7;
      border: 1px solid #fff;
      margin-top: -8px;
      cursor: pointer;
   }

   &::-moz-range-track {
      height: 6px;
      background: #3a2d6d;
      border: 1px solid #555;
      border-radius: 0;
   }

   &::-moz-range-thumb {
      height: 20px;
      width: 12px;
      background: #C10AD7;
      border: 1px solid #fff;
      border-radius: 0;
      cursor: pointer;
   }
}

.controls-panel {
   width: min(260px, calc(100vw - 40px));
   display: flex;
   flex-direction: column;
   gap: 6px;
   padding: 8px 12px;
   background-color: #020030bf;
   border-radius: 10px;
   border: 1px solid #ffffff30;
   margin-top: 4px;
}

.control-row {
   display: flex;
   align-items: center;
   gap: 6px;
   flex-wrap: wrap;
}

.ctrl-label {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.55rem;
   color: #9fb5c3;
   min-width: 34px;
   text-shadow: 1px 1px 2px #000;
   letter-spacing: 1px;
}

.ctrl-slider {
   flex: 1;
   height: 28px;
   -webkit-appearance: none;
   appearance: none;
   background: transparent;
   cursor: pointer;
   margin: 0;
   touch-action: manipulation;

   &:focus { outline: none; }

   &::-webkit-slider-runnable-track {
      height: 8px;
      background: #3a2d6d;
      border: 1px solid #555;
      border-radius: 2px;
   }

   &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 22px;
      width: 16px;
      background: #787B9B;
      border: 1px solid #aaa;
      border-radius: 2px;
      margin-top: -8px;
      cursor: pointer;
   }

   &::-moz-range-track {
      height: 8px;
      background: #3a2d6d;
      border: 1px solid #555;
      border-radius: 2px;
   }

   &::-moz-range-thumb {
      height: 22px;
      width: 16px;
      background: #787B9B;
      border: 1px solid #aaa;
      border-radius: 2px;
      cursor: pointer;
   }
}

.ctrl-value {
   font-family: "Pixeloid", monospace;
   font-size: 0.5rem;
   color: #e2e2e2;
   min-width: 30px;
   text-align: right;
   text-shadow: 1px 1px 2px #000;
}

.ctrl-btn {
   background: #2a1d5c;
   color: #e2e2e2;
   border: 2px solid;
   border-color: #6a5aad #2a1d3a #2a1d3a #6a5aad;
   padding: 6px 10px;
   min-height: 34px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.5rem;
   cursor: pointer;
   text-transform: uppercase;
   letter-spacing: 1px;
   transition: background 0.15s;

   &:active {
      border-color: #2a1d3a #6a5aad #6a5aad #2a1d3a;
   }

   &.active {
      background: #8a0a97;
      border-color: #c10ad7 #4a0552 #4a0552 #c10ad7;
      color: #fff;
      text-shadow: 0 0 4px #ff6aff;
   }

   &:disabled {
      opacity: 0.35;
      cursor: default;
   }
}

.cue-group {
   display: flex;
   gap: 4px;
}

.cue-btn {
   min-width: 34px;
   text-align: center;
   padding: 6px 8px;

   &.cue-set {
      background: #0a6e5c;
      border-color: #0ad7a7 #043d33 #043d33 #0ad7a7;
      color: #fff;
      text-shadow: 0 0 3px #0ad7a7;
   }
}

.tap-btn {
   min-width: 44px;
   background: #1a3d5c;
   border-color: #3a8abf #0a1d3a #0a1d3a #3a8abf;

   &:active {
      background: #2a5d8c;
      border-color: #0a1d3a #3a8abf #3a8abf #0a1d3a;
   }
}

.bpm-display {
   font-family: "Pixeloid", monospace;
   font-size: 0.6rem;
   color: #ff9a00;
   min-width: 38px;
   text-align: center;
   cursor: pointer;
   padding: 4px 6px;
   border: 1px dashed #ffffff30;
   border-radius: 3px;
   text-shadow: 0 0 4px #ff9a00;

   &:hover {
      border-color: #ffffff60;
   }
}

.bpm-input {
   font-family: "Pixeloid", monospace;
   font-size: 0.6rem;
   color: #ff9a00;
   background: #0a0030;
   border: 1px solid #ff9a00;
   border-radius: 3px;
   width: 50px;
   padding: 4px 6px;
   text-align: center;
   outline: none;

   &::-webkit-inner-spin-button,
   &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      appearance: none;
      margin: 0;
   }
}

@media (max-width: 374px) {
   .player-container {
      transform: scale(0.4);
      margin-bottom: -190px;
   }
}

@media (min-width: 768px) {
   .player-container {
      transform: none;
      margin-bottom: 0;

      .play-button {
         display: block;
      }

      .mute-button {
         display: block;
      }
   }

   .progress-container {
      margin-top: -20px;
   }

   .mobile-transport {
      display: none;
   }
}
</style>
