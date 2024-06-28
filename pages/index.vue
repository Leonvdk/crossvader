<script setup>
   let sliderValue = ref(70);
   let videoPlayers = reactive({
      a: {
         id: "playerA",
         videoId: "Cl6Rz1Uvi2M?si=jOYGXe_CWxZzuIA9",
         volume: 30,
      },
      b: {
         id: "playerB",
         videoId: "NMaEStimfLc?si=phvB8cFtK8pNUErd",
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
      <YoutubePlayer
         :volume="videoPlayers.a.volume"
         :playerId="videoPlayers.a.id"
         :videoId="videoPlayers.a.videoId"
      />
      <input
         class="slider"
         type="range"
         min="0"
         max="100"
         v-model="sliderValue"
         :oninput="setVolume(sliderValue)"
      />
      <YoutubePlayer
         :volume="videoPlayers.b.volume"
         :playerId="videoPlayers.b.id"
         :videoId="videoPlayers.b.videoId"
      />
   </div>
   <YoutubeSearch @setVideo="setVideo" />
</template>

<style>
   @font-face {
      font-family: "Pixeloid";
      src: url("assets/fonts/PressStart.ttf") ;
   }
   html {
      background-color: #1E1451;
      background-size: 100%;
      background-repeat: no-repeat;
   }
   body {
      background-color: #1E145100;
      background-image: url(assets/images/Boys.png);
      background-size: 80%;
      background-position: 40% 0%;
      background-repeat: no-repeat;
      min-height: 100vh;
   }
   h1 {
      text-align: center;
      margin-bottom: 50px;
      color: #b8b8b8;
      font-family:  Pixeloid, Arial, Helvetica, sans-serif;
      font-size: 3rem;
      text-shadow: 1px 1px #000000;
      font-weight: 600;
   }
   .slider {
      max-width: 100px;
   }
   #deck-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 150px;
   }
   input[type="range"] {
      height: 38px;
      -webkit-appearance: none;
      margin: 10px 0;
      width: 100%;
      background-color: #00000000;
      margin-top: 30px;
   }
   input[type="range"]:focus {
      outline: none;
   }
   input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 1px 1px 1px #557F2F;
      background: #787B9B;
      border-radius: 2px;
      border: 1px solid #000000;
   }
   input[type="range"]::-webkit-slider-thumb {
      /* box-shadow: 1.5px 1.5px 1px 2px #000000; */
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
   input[type="range"]:focus::-webkit-slider-runnable-track {
      background: #8d8d8d;
   }
   input[type="range"]::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 1px 1px 1px #787B9B;
      background: #787B9B;
      border-radius: 5px;
      border: 1px solid #000000;
   }
   input[type="range"]::-moz-range-thumb {
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #557F2F;
      height: 30px;
      width: 15px;
      border-radius: 5px;
      background: #ffffff00;
      cursor: pointer;
   }
   input[type="range"]::-ms-track {
      width: 100%;
      height: 10px;
      cursor: pointer;
      animate: 0.2s;
      background: transparent;
      border-color: transparent;
      color: transparent;
   }
   input[type="range"]::-ms-fill-lower {
      background: #557F2F;
      border: 1px solid #000000;
      border-radius: 10px;
      box-shadow: 1px 1px 1px #557F2F;
   }
   input[type="range"]::-ms-fill-upper {
      background: #557F2F;
      border: 1px solid #000000;
      border-radius: 10px;
      box-shadow: 1px 1px 1px #000000;
   }
   input[type="range"]::-ms-thumb {
      margin-top: 1px;
      box-shadow: 1px 1px 1px #000000;
      border: 1px solid #000000;
      height: 30px;
      width: 15px;
      border-radius: 5px;
      background: #00000000;
      cursor: pointer;
   }
   input[type="range"]:focus::-ms-fill-lower {
      background: #557F2F;
   }
   input[type="range"]:focus::-ms-fill-upper {
      background: #557F2F;
   }
</style>
