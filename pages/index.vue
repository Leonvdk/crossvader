<script setup>
let sliderValue = ref(70);
let videoPlayers = reactive({
   a: {
      id: "playerA",
      videoId: "o2ojpMcN27U",
      volume: 30,
   },
   b: {
      id: "playerB",
      videoId: none,
      volume: 70,
   },
});

let setVolume = (sliderValue) => {
   videoPlayers.a.volume = 100 - parseInt(sliderValue);
   videoPlayers.b.volume = parseInt(sliderValue);
};
let setVideo = (videoId, playerId) => {
   if (playerId === "playerA") {
      videoPlayers.a.videoId = videoId;
   } else {
      videoPlayers.b.videoId = videoId;
   }
};
</script>
<template>
   <h1>Crossfader
   </h1>
   <div id="deck-container">
      <YoutubePlayer :volume="videoPlayers.a.volume" :playerId="videoPlayers.a.id" :videoId="videoPlayers.a.videoId" />
      <input class="slider" type="range" min="0" max="100" v-model="sliderValue" :oninput="setVolume(sliderValue)" />
      <YoutubePlayer :volume="videoPlayers.b.volume" :playerId="videoPlayers.b.id" :videoId="videoPlayers.b.videoId" />
   </div>
   <YoutubeSearch @setVideo="setVideo" />
</template>

<style>
@font-face {
   font-family: "Pixeloid";
   src: url("assets/fonts/PressStart.ttf");
}

html {
   background-color: #1E1451;
   background-image: url(assets/images/retro-pixel-landscape-background.webp);
   background-size: 100%;
   background-repeat: no-repeat;
}

h1 {
   text-align: center;
   margin-bottom: 50px;
   color: #e2e2e2;
   font-family: Pixeloid, Arial, Helvetica, sans-serif;
   font-size: 2rem;
   text-shadow: 1px 1px #000000;
   font-weight: 600;
   text-shadow: 1px 3px 0px #C10AD7;
}

#deck-container {
   display: flex;
   align-items: center;
   justify-content: center;
   flex-direction: column;
   gap: 20px;
   margin-top: 0px;

   .slider {
      max-width: 100px;
      transform: rotate(90deg);
   }
}

input[type="range"] {
   height: 38px;
   -webkit-appearance: none;
   margin: 10px 0;
   width: 100%;
   background-color: #00000000;
   margin-top: 30px;

   &:focus {
      outline: none;
   }

   &::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 1px 1px 1px #557F2F;
      background: #787B9B;
      border-radius: 2px;
      border: 1px solid #000000;
   }

   &::-webkit-slider-thumb {
      border: 1px solid #670572;
      height: 30px;
      width: 35px;
      box-shadow: -2px 0px #624031, 0px -2px #624031, 0px 2px #624031, 2px 0px #624031;
      border-radius: 2px;
      background: #B47A54;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -11px;
   }

   &:focus::-webkit-slider-runnable-track {
      background: #8d8d8d;
   }

   &::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 1px 1px 1px #787B9B;
      background: #787B9B;
      border-radius: 5px;
      border: 1px solid #000000;
   }

   &::-moz-range-thumb {
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #557F2F;
      height: 30px;
      width: 15px;
      border-radius: 5px;
      background: #ffffff00;
      cursor: pointer;
   }

   &::-ms-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
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
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #000000;
      height: 30px;
      width: 15px;
      border-radius: 5px;
      background: #00000000;
      cursor: pointer;
   }

   &:focus::-ms-fill-lower {
      background: #557F2F;
   }

   &:focus::-ms-fill-upper {
      background: #557F2F;
   }
}


@media (min-width: 576px) {
   #deck-container {
      margin-top: 50px;
   }
}

@media (min-width: 768px) {
   h1 {
      font-size: 3rem;
      text-shadow: 1px 7px 0px #C10AD7;
   }
}

@media (min-width: 992px) {
   #deck-container {
      flex-direction: row;

      .slider {
         transform: rotate(0deg);
      }
   }

   h1 {
      font-size: 4rem;
   }
}
</style>
