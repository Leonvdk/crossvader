<script setup>
let playerARef = ref(null);
let playerBRef = ref(null);

let sliderValue = ref(50);
let crossfadeCurve = ref("equalPower");
let autoTransitionActive = ref(false);
let autoTransitionDuration = ref(8);
let animationFrameId = null;

const curveLabels = {
   linear: "LIN",
   equalPower: "EQ",
   hardCut: "CUT",
   slowFade: "FADE",
};

let deckA = reactive({
   id: "playerA",
   videoId: "oAZBKlVSLkU",
   title: "",
   queue: [],
});
let deckB = reactive({
   id: "playerB",
   videoId: "",
   title: "",
   queue: [],
});

let crossfadeVolumes = computed(() => {
   let pos = sliderValue.value / 100;
   let volA, volB;

   switch (crossfadeCurve.value) {
      case "linear":
         volA = (1 - pos) * 100;
         volB = pos * 100;
         break;
      case "equalPower":
         volA = Math.cos(pos * Math.PI / 2) * 100;
         volB = Math.sin(pos * Math.PI / 2) * 100;
         break;
      case "hardCut":
         volA = pos <= 0.5 ? 100 : 0;
         volB = pos >= 0.5 ? 100 : 0;
         break;
      case "slowFade":
         volA = Math.pow(1 - pos, 0.5) * 100;
         volB = Math.pow(pos, 0.5) * 100;
         break;
      default:
         volA = (1 - pos) * 100;
         volB = pos * 100;
   }

   return { a: Math.round(volA), b: Math.round(volB) };
});

let onCrossfaderInput = () => {
   let val = sliderValue.value;
   if (val >= 47 && val <= 53) {
      sliderValue.value = 50;
   }
};

let setVideo = (videoId, playerId, title) => {
   if (playerId === "playerA") {
      deckA.videoId = videoId;
      deckA.title = title || "";
   } else {
      deckB.videoId = videoId;
      deckB.title = title || "";
   }
};

let addToQueue = (videoId, playerId, title) => {
   let deck = playerId === "playerA" ? deckA : deckB;
   deck.queue.push({ videoId, title: title || "Untitled" });
};

let onDeckEnded = (deckId) => {
   let deck = deckId === "playerA" ? deckA : deckB;
   if (deck.queue.length > 0) {
      let next = deck.queue.shift();
      deck.videoId = next.videoId;
      deck.title = next.title;
   }
};

let playNext = (deckId) => {
   onDeckEnded(deckId);
};

let removeFromQueue = (deckId, index) => {
   let deck = deckId === "playerA" ? deckA : deckB;
   deck.queue.splice(index, 1);
};

let startAutoTransition = () => {
   if (autoTransitionActive.value) {
      autoTransitionActive.value = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      return;
   }

   autoTransitionActive.value = true;
   let startValue = sliderValue.value;
   let targetValue = startValue <= 50 ? 100 : 0;
   let startTime = performance.now();
   let durationMs = autoTransitionDuration.value * 1000;

   let animate = (now) => {
      if (!autoTransitionActive.value) return;
      let elapsed = now - startTime;
      let progress = Math.min(elapsed / durationMs, 1);
      sliderValue.value = Math.round(
         startValue + (targetValue - startValue) * progress
      );
      if (progress < 1) {
         animationFrameId = requestAnimationFrame(animate);
      } else {
         autoTransitionActive.value = false;
      }
   };

   animationFrameId = requestAnimationFrame(animate);
};

let syncAtoB = () => {
   if (!playerARef.value || !playerBRef.value) return;
   let bpmA = playerARef.value.getBpm();
   let bpmB = playerBRef.value.getBpm();
   if (bpmA && bpmB) {
      let effectiveBpmA = bpmA * playerARef.value.getPlaybackRate();
      let newRateB = effectiveBpmA / bpmB;
      newRateB = Math.max(0.5, Math.min(1.5, Math.round(newRateB * 50) / 50));
      playerBRef.value.setPlaybackRate(newRateB);
   } else {
      playerBRef.value.setPlaybackRate(playerARef.value.getPlaybackRate());
   }
};

let syncBtoA = () => {
   if (!playerARef.value || !playerBRef.value) return;
   let bpmA = playerARef.value.getBpm();
   let bpmB = playerBRef.value.getBpm();
   if (bpmA && bpmB) {
      let effectiveBpmB = bpmB * playerBRef.value.getPlaybackRate();
      let newRateA = effectiveBpmB / bpmA;
      newRateA = Math.max(0.5, Math.min(1.5, Math.round(newRateA * 50) / 50));
      playerARef.value.setPlaybackRate(newRateA);
   } else {
      playerARef.value.setPlaybackRate(playerBRef.value.getPlaybackRate());
   }
};

let onKeydown = (e) => {
   if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

   switch (e.key) {
      case "q":
         playerARef.value?.togglePlay();
         break;
      case "w":
         playerBRef.value?.togglePlay();
         break;
      case "ArrowLeft":
         e.preventDefault();
         sliderValue.value = Math.max(0, sliderValue.value - 2);
         break;
      case "ArrowRight":
         e.preventDefault();
         sliderValue.value = Math.min(100, sliderValue.value + 2);
         break;
      case "1": case "2": case "3": case "4":
         playerARef.value?.jumpToCue(parseInt(e.key) - 1);
         break;
      case "5": case "6": case "7": case "8":
         playerBRef.value?.jumpToCue(parseInt(e.key) - 5);
         break;
   }
};

onMounted(() => {
   window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
   window.removeEventListener("keydown", onKeydown);
   if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<template>
   <h1>Crossfader</h1>

   <div id="deck-container">
      <div class="deck-wrapper">
         <YoutubePlayer
            ref="playerARef"
            :volume="crossfadeVolumes.a"
            :videoId="deckA.videoId"
            :playerId="deckA.id"
            deckLabel="A"
            @ended="onDeckEnded('playerA')"
         />
         <div v-if="deckA.queue.length" class="queue-list">
            <div class="queue-header">
               <span class="queue-title-label">UP NEXT</span>
               <button class="queue-next-btn" @click="playNext('playerA')">SKIP</button>
            </div>
            <div v-for="(item, i) in deckA.queue" :key="i" class="queue-item">
               <span class="queue-item-title">{{ item.title }}</span>
               <button class="queue-remove-btn" @click="removeFromQueue('playerA', i)">x</button>
            </div>
         </div>
      </div>

      <div class="mixer-panel">
         <div class="crossfader-row">
            <span class="mixer-label">A</span>
            <input
               class="crossfader"
               type="range"
               min="0"
               max="100"
               v-model.number="sliderValue"
               @input="onCrossfaderInput"
            />
            <span class="mixer-label">B</span>
         </div>

         <div class="curve-selector">
            <button
               v-for="(label, key) in curveLabels"
               :key="key"
               class="curve-btn"
               :class="{ active: crossfadeCurve === key }"
               @click="crossfadeCurve = key"
            >{{ label }}</button>
         </div>

         <div class="mixer-row">
            <button class="mixer-btn" :class="{ active: autoTransitionActive }"
               @click="startAutoTransition">
               {{ autoTransitionActive ? "STOP" : "AUTO" }}
            </button>
            <select v-model.number="autoTransitionDuration" class="duration-select">
               <option :value="4">4s</option>
               <option :value="8">8s</option>
               <option :value="16">16s</option>
            </select>
         </div>

         <div class="mixer-row">
            <span class="mixer-small-label">SYNC</span>
            <button class="mixer-btn" @click="syncAtoB" title="Match B's tempo to A (set BPM on both decks first)">A&gt;B</button>
            <button class="mixer-btn" @click="syncBtoA" title="Match A's tempo to B (set BPM on both decks first)">B&gt;A</button>
         </div>

         <div class="shortcuts-hint">
            <p>Q/W play</p>
            <p>1-4 cue A</p>
            <p>5-8 cue B</p>
         </div>
      </div>

      <div class="deck-wrapper">
         <YoutubePlayer
            ref="playerBRef"
            :volume="crossfadeVolumes.b"
            :videoId="deckB.videoId"
            :playerId="deckB.id"
            deckLabel="B"
            @ended="onDeckEnded('playerB')"
         />
         <div v-if="deckB.queue.length" class="queue-list">
            <div class="queue-header">
               <span class="queue-title-label">UP NEXT</span>
               <button class="queue-next-btn" @click="playNext('playerB')">SKIP</button>
            </div>
            <div v-for="(item, i) in deckB.queue" :key="i" class="queue-item">
               <span class="queue-item-title">{{ item.title }}</span>
               <button class="queue-remove-btn" @click="removeFromQueue('playerB', i)">x</button>
            </div>
         </div>
      </div>
   </div>

   <YoutubeSearch @setVideo="setVideo" @addToQueue="addToQueue" />
</template>

<style>
@font-face {
   font-family: "Pixeloid";
   src: url("assets/fonts/PressStart.ttf");
}

html {
   background-color: #1E1451;
   background-image: url(assets/images/retro-pixel-landscape-background.webp);
   background-size: cover;
   background-repeat: no-repeat;
   overflow-x: hidden;
}

h1 {
   text-align: center;
   margin-bottom: 8px;
   margin-top: 8px;
   color: #e2e2e2;
   font-family: Pixeloid, Arial, Helvetica, sans-serif;
   font-size: 1.1rem;
   font-weight: 600;
   text-shadow: 1px 2px 0px #C10AD7;
}

#deck-container {
   display: flex;
   align-items: center;
   justify-content: center;
   flex-direction: column;
   gap: 4px;
   padding: 0 10px;
   box-sizing: border-box;
   width: 100%;
}

.deck-wrapper {
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 100%;
   max-width: 350px;
}

/* --- Mixer panel --- */

.mixer-panel {
   display: flex;
   flex-direction: row;
   flex-wrap: wrap;
   align-items: center;
   justify-content: center;
   gap: 10px;
   padding: 12px 16px;
   background: #020030bf;
   border-radius: 12px;
   border: 1px solid #ffffff30;
   align-self: center;
   width: min(300px, calc(100vw - 40px));
   box-sizing: border-box;
}

.crossfader-row {
   display: flex;
   align-items: center;
   gap: 8px;

   .crossfader {
      width: min(200px, 50vw);
   }
}

.mixer-label {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.7rem;
   color: #C10AD7;
   text-shadow: 0 0 4px #C10AD7, 1px 1px #000;
}

.mixer-small-label {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.5rem;
   color: #9fb5c3;
   text-shadow: 1px 1px 2px #000;
   letter-spacing: 1px;
}

.curve-selector {
   display: flex;
   gap: 4px;
}

.curve-btn {
   background: #2a1d5c;
   color: #9fb5c3;
   border: 2px solid;
   border-color: #6a5aad #2a1d3a #2a1d3a #6a5aad;
   padding: 6px 8px;
   min-height: 34px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.45rem;
   cursor: pointer;
   letter-spacing: 1px;
   transition: background 0.15s;

   &:active { border-color: #2a1d3a #6a5aad #6a5aad #2a1d3a; }

   &.active {
      background: #8a0a97;
      border-color: #c10ad7 #4a0552 #4a0552 #c10ad7;
      color: #fff;
      text-shadow: 0 0 4px #ff6aff;
   }
}

.mixer-row {
   display: flex;
   align-items: center;
   gap: 6px;
}

.mixer-btn {
   background: #2a1d5c;
   color: #e2e2e2;
   border: 2px solid;
   border-color: #6a5aad #2a1d3a #2a1d3a #6a5aad;
   padding: 6px 10px;
   min-height: 34px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.5rem;
   cursor: pointer;
   letter-spacing: 1px;
   transition: background 0.15s;

   &:active { border-color: #2a1d3a #6a5aad #6a5aad #2a1d3a; }

   &.active {
      background: #8a0a97;
      border-color: #c10ad7 #4a0552 #4a0552 #c10ad7;
      color: #fff;
      text-shadow: 0 0 4px #ff6aff;
   }
}

.duration-select {
   background: #2a1d5c;
   color: #e2e2e2;
   border: 1px solid #6a5aad;
   padding: 6px 8px;
   min-height: 34px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.45rem;
   cursor: pointer;
}

.shortcuts-hint {
   display: none;
   margin-top: 4px;

   p {
      font-family: "Pixeloid", Arial, Helvetica, sans-serif;
      font-size: 0.35rem;
      color: #ffffff40;
      text-align: center;
      margin: 2px 0;
      letter-spacing: 1px;
   }
}

/* --- Crossfader slider --- */

.crossfader {
   height: 44px;
   -webkit-appearance: none;
   appearance: none;
   margin: 4px 0;
   width: 100%;
   background-color: #00000000;
   touch-action: manipulation;

   &:focus { outline: none; }

   &::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      box-shadow: 1px 1px 1px #557F2F;
      background: #787B9B;
      border-radius: 2px;
      border: 1px solid #000000;
   }

   &::-webkit-slider-thumb {
      border: 2px solid;
      border-color: #3a8abf #0a1d3a #0a1d3a #3a8abf;
      height: 36px;
      width: 40px;
      border-radius: 2px;
      background: #1a3d5c;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -14px;
   }

   &:focus::-webkit-slider-runnable-track {
      background: #8d8d8d;
   }

   &::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      box-shadow: 1px 1px 1px #787B9B;
      background: #787B9B;
      border-radius: 5px;
      border: 1px solid #000000;
   }

   &::-moz-range-thumb {
      border: 2px solid;
      border-color: #3a8abf #0a1d3a #0a1d3a #3a8abf;
      height: 36px;
      width: 40px;
      border-radius: 2px;
      background: #1a3d5c;
      cursor: pointer;
   }

   &::-ms-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      background: transparent;
      border-color: transparent;
      color: transparent;
   }

   &::-ms-fill-lower {
      background: #557F2F;
      border: 1px solid #000000;
      border-radius: 10px;
      box-shadow: 1px 1px 1px #557F2F;
   }

   &::-ms-fill-upper {
      background: #557F2F;
      border: 1px solid #000000;
      border-radius: 10px;
      box-shadow: 1px 1px 1px #000000;
   }

   &::-ms-thumb {
      margin-top: 1px;
      border: 2px solid;
      border-color: #3a8abf #0a1d3a #0a1d3a #3a8abf;
      height: 36px;
      width: 40px;
      border-radius: 2px;
      background: #1a3d5c;
      cursor: pointer;
   }

   &:focus::-ms-fill-lower { background: #557F2F; }
   &:focus::-ms-fill-upper { background: #557F2F; }
}

/* --- Queue --- */

.queue-list {
   width: min(260px, calc(100vw - 40px));
   background: #020030bf;
   border-radius: 8px;
   border: 1px solid #ffffff20;
   padding: 8px 10px;
   margin-top: 6px;
}

.queue-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 6px;
}

.queue-title-label {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.45rem;
   color: #C10AD7;
   letter-spacing: 1px;
   text-shadow: 0 0 3px #C10AD7;
}

.queue-next-btn {
   background: #2a1d5c;
   color: #e2e2e2;
   border: 1px solid #6a5aad;
   padding: 6px 10px;
   min-height: 34px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.4rem;
   cursor: pointer;
   letter-spacing: 1px;

   &:active { background: #3d2d7a; }
}

.queue-item {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 4px 0;
   border-bottom: 1px solid #ffffff10;

   &:last-child { border-bottom: none; }
}

.queue-item-title {
   font-family: Arial, Helvetica, sans-serif;
   font-size: 0.75rem;
   color: #c8c8c8;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   max-width: calc(100% - 40px);
}

.queue-remove-btn {
   background: none;
   border: none;
   color: #d44a4a;
   font-size: 1rem;
   cursor: pointer;
   padding: 4px 8px;
   min-height: 34px;
   font-family: Arial, Helvetica, sans-serif;

   &:active { color: #ff6a6a; }
}

/* --- Responsive --- */

@media (min-width: 576px) {
   #deck-container {
      margin-top: 20px;
      gap: 10px;
   }

   h1 {
      font-size: 1.5rem;
      margin-bottom: 16px;
      margin-top: 16px;
   }
}

@media (min-width: 768px) {
   h1 {
      font-size: 2.5rem;
      margin-bottom: 24px;
      text-shadow: 1px 5px 0px #C10AD7;
   }
}

@media (min-width: 992px) {
   #deck-container {
      flex-direction: row;
      align-items: flex-start;
   }

   .mixer-panel {
      flex-direction: column;
      width: auto;
   }

   .crossfader-row .crossfader {
      width: 120px;
   }

   .shortcuts-hint {
      display: block;
   }

   h1 {
      font-size: 3.5rem;
      margin-bottom: 40px;
      text-shadow: 1px 7px 0px #C10AD7;
   }
}
</style>
