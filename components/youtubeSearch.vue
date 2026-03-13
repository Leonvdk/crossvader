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
      color: #ffffffd7;
      background-color: #2d206dc3;
      border: 1px solid #ffffff50;
      border-radius: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1rem;

      &::placeholder {
         font-family: Arial, Helvetica, sans-serif;
         font-size: 1rem;
         color: #9d9d9d;
      }

      &:focus-visible {
         outline: 2px solid #fff;
         border: 1px solid #ffffff00;
      }
   }

   .search-button {
      height: 50px;
      box-sizing: border-box;
      padding: 7px 25px;
      color: #fff;
      background-color: #1a3d5c;
      border: 2px solid;
      border-color: #3a8abf #0a1d3a #0a1d3a #3a8abf;
      border-radius: 3px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1rem;
      cursor: pointer;

      &:focus-visible {
         outline: none;
         border-color: #5abaef #0a1d3a #0a1d3a #5abaef;
      }

      &:active {
         background-color: #2a5d8c;
         border-color: #0a1d3a #3a8abf #3a8abf #0a1d3a;
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
            background-color: #bdbdbd99;
            border: 2px solid #000000;
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 600;
            font-size: 0.85rem;
            color: white;
            width: 100%;
            flex: 1;
            min-height: 44px;
            transition: background-color 0.2s ease-out;
            border-radius: 10px;
            text-shadow: 1px 1px #000;

            &:active {
               background-color: #bf0ad6a1;
            }
         }

         .queue-button {
            font-size: 0.7rem;
            background-color: #2d206d99;

            &:active {
               background-color: #0a9768a1;
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
         background-color: #bf0ad6a1;
      }

      .queue-button:hover {
         background-color: #0a9768a1;
      }
   }

   .search-button:hover {
      transform: scale(1.04);
      box-shadow: 1px 1px 5px #ffffff55;
   }
}

@media (min-width: 576px) {
   .search-input-container {
      flex-direction: row;

      .search-input {
         height: 50px;
         font-size: 1.3rem;

         &::placeholder {
            font-size: 1.3rem;
         }
      }

      .search-button {
         font-size: 1.3rem;
      }
   }
}
</style>
