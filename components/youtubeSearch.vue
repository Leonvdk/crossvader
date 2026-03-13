<script setup>
const { youtubeApiUrl } = useRuntimeConfig().public;
let searchQuery = ref("");
let searchResults = ref([]);
const searchUrl = ref(youtubeApiUrl);

const getVideos = async () => {
   let response = await $fetch(searchUrl.value.concat(searchQuery.value), {});
   searchResults.value = response.items;
};

const emit = defineEmits(["setVideo", "addToQueue"]);

let setVideo = (videoId, playerId, title) => {
   emit("setVideo", videoId, playerId, title);
};

let addToQueue = (videoId, playerId, title) => {
   emit("addToQueue", videoId, playerId, title);
};
</script>

<template>
   <div class="search-input-container">
      <input class="search-input" type="text" v-model="searchQuery" placeholder="Search your bangers"
         @keyup.enter="getVideos" />

      <button @click="getVideos" class="search-button">
         Search
      </button>
   </div>
   <div class="searchResults">
      <div v-for="item in searchResults" :key="item.id.videoId" class="searchResult"
         :style="`background-image: url(${item.snippet.thumbnails.default.url})`">
         <p class="search-result-title">{{ item.snippet.channelTitle }}</p>
         <div></div>
         <div class="result-button-container">
            <div class="result-col">
               <p class="result-button" @click="setVideo(item.id.videoId, 'playerA', item.snippet.title)">A</p>
               <p class="result-button queue-button" @click="addToQueue(item.id.videoId, 'playerA', item.snippet.title)">+A</p>
            </div>
            <div class="result-col">
               <p class="result-button" @click="setVideo(item.id.videoId, 'playerB', item.snippet.title)">B</p>
               <p class="result-button queue-button" @click="addToQueue(item.id.videoId, 'playerB', item.snippet.title)">+B</p>
            </div>
         </div>
      </div>
   </div>
</template>

<style lang="scss">
.search-input-container {
   margin-top: 40px;
   display: flex;
   flex-direction: column;
   justify-content: center;
   gap: 10px;
   max-width: min(90vw, 700px);
   justify-self: center;
   padding: 0 10px;
   box-sizing: border-box;

   .search-input {
      height: 50px;
      box-sizing: border-box;
      padding: 7px 16px;
      color: #e0fff0;
      background-color: #0a0a2a;
      border: none;
      border-radius: 0;
      box-shadow:
         -3px 0 0 0 #1a1040,
         3px 0 0 0 #8a7abf,
         0 -3px 0 0 #1a1040,
         0 3px 0 0 #8a7abf,
         inset 0 2px 8px rgba(0, 0, 0, 0.6),
         inset 0 0 20px rgba(10, 5, 30, 0.5);
      font-family: "Pixeloid", Arial, Helvetica, sans-serif;
      font-size: 0.6rem;
      text-shadow: 0 0 4px #0ad7a7;

      &::placeholder {
         font-family: "Pixeloid", Arial, Helvetica, sans-serif;
         font-size: 0.6rem;
         color: #0ad7a780;
         text-shadow: 0 0 3px #0ad7a740;
      }

      &:focus-visible {
         outline: none;
         box-shadow:
            -3px 0 0 0 #0a0a20,
            3px 0 0 0 #c10ad7,
            0 -3px 0 0 #0a0a20,
            0 3px 0 0 #c10ad7,
            inset 0 2px 8px rgba(0, 0, 0, 0.6),
            inset 0 0 20px rgba(10, 5, 30, 0.5);
         text-shadow: 0 0 6px #0ad7a7;
      }
   }

   .search-button {
      height: 50px;
      box-sizing: border-box;
      padding: 7px 25px;
      color: #fff;
      background-color: #1a3d5c;
      border: none;
      border-radius: 0;
      box-shadow:
         -3px 0 0 0 #3a8abf,
         3px 0 0 0 #0a1d3a,
         0 -3px 0 0 #3a8abf,
         0 3px 0 0 #0a1d3a;
      font-family: "Pixeloid", Arial, Helvetica, sans-serif;
      font-size: 0.6rem;
      cursor: pointer;
      letter-spacing: 1px;

      &:focus-visible {
         outline: none;
      }

      &:active {
         background-color: #2a5d8c;
         box-shadow:
            -3px 0 0 0 #0a1d3a,
            3px 0 0 0 #3a8abf,
            0 -3px 0 0 #0a1d3a,
            0 3px 0 0 #3a8abf;
      }
   }
}

.searchResults {
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
   gap: 10px;
   margin-top: 20px;
   margin-bottom: 50px;
   padding: 10px;
   border-radius: 10px;
   box-sizing: border-box;
   overflow: visible;

   .searchResult {
      width: min(170px, calc(50vw - 20px));
      aspect-ratio: 16/9;
      position: relative;
      border-radius: 10px;
      box-shadow: 2px 2px 8px #0e0d0d94;
      background: linear-gradient(132deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(40, 40, 40, 1) 34%,
            rgba(0, 0, 0, 1) 91%);
      background-size: 100% 100%;
      box-sizing: border-box;
      padding: 0px 0px 15px 0px;
      cursor: pointer;
      transition: 0.3s all ease-out;

      .search-result-title {
         margin: 8px;
         font-family: Arial, Helvetica, sans-serif;
         font-weight: 600;
         font-size: 0.7rem;
         color: #fff;
         text-shadow: 1px 1px #000;
      }

      .result-button-container {
         display: flex;
         justify-content: center;
         position: absolute;
         top: 0;
         right: 0;
         width: 100%;
         height: 100%;
         z-index: 10;
         opacity: 80%;
         cursor: pointer;

         .result-col {
            display: flex;
            flex-direction: column;
            width: 100%;
         }

         .result-button {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #2a1d5c;
            border: none;
            border-radius: 0;
            margin: 0;
            box-shadow:
               -2px 0 0 0 #6a5aad,
               2px 0 0 0 #2a1d3a,
               0 -2px 0 0 #6a5aad,
               0 2px 0 0 #2a1d3a;
            font-family: "Pixeloid", Arial, Helvetica, sans-serif;
            font-size: 0.5rem;
            letter-spacing: 1px;
            color: #e2e2e2;
            width: 100%;
            flex: 1;
            min-height: 44px;

            &:active {
               background-color: #8a0a97;
               box-shadow:
                  -2px 0 0 0 #2a1d3a,
                  2px 0 0 0 #6a5aad,
                  0 -2px 0 0 #2a1d3a,
                  0 2px 0 0 #6a5aad;
            }
         }

         .queue-button {
            font-size: 0.4rem;
            background-color: #1a3d5c;
            box-shadow:
               -2px 0 0 0 #3a8abf,
               2px 0 0 0 #0a1d3a,
               0 -2px 0 0 #3a8abf,
               0 2px 0 0 #0a1d3a;

            &:active {
               background-color: #0a6e5c;
               box-shadow:
                  -2px 0 0 0 #0a1d3a,
                  2px 0 0 0 #3a8abf,
                  0 -2px 0 0 #0a1d3a,
                  0 2px 0 0 #3a8abf;
            }
         }
      }
   }
}

@media (hover: hover) {
   .searchResults .searchResult .result-button-container {
      opacity: 0%;
      transition: 0.3s opacity ease-out;

      &:hover {
         opacity: 100%;
      }

      .result-button:hover {
         background-color: #8a0a97;
      }

      .queue-button:hover {
         background-color: #0a6e5c;
      }
   }

   .search-button:hover {
      background-color: #2a5d8c;
   }
}

@media (min-width: 576px) {
   .search-input-container {
      flex-direction: row;

      .search-input {
         height: 50px;
         font-size: 0.7rem;

         &::placeholder {
            font-size: 0.7rem;
         }
      }

      .search-button {
         font-size: 0.7rem;
      }
   }
}
</style>
