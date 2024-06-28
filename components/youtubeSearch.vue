<script setup>
const { youtubeApiUrl } = useRuntimeConfig().public;
let searchQuery = ref("");
   let searchResults = ref([]);
   const searchUrl = ref(youtubeApiUrl)

   const getVideos = async () => {
      let response = await $fetch(searchUrl.value.concat(searchQuery.value), {});
      searchResults.value = await response.items;
   };

   const emit = defineEmits(["setVideo"]);

   let setVideo = (videoId, playerId) => {
      emit("setVideo", videoId, playerId);
   };
</script>

<template>
   <div class="search-input-container">
      <input
         class="search-input"
         type="text"
         v-model="searchQuery"
         placeholder="Search your bangers"
         @keyup.enter="getVideos"
      />

      <button
         @click="getVideos"
         class="search-button"
      >
         Search
      </button>
   </div>
   <div class="searchResults">
      <div
         v-for="item in searchResults"
         :key="item.id.videoId"
         class="searchResult"
         :style="`background-image: url(${item.snippet.thumbnails.default.url})`"
      >
         <!-- <img
            :src="item.snippet.thumbnails.default.url"
            class="search-result-img"
         /> -->
         <p class="search-result-title">{{ item.snippet.channelTitle }}</p>
         <div></div>
         <div class="result-button-container">
            <p
               class="result-button"
               @click="setVideo(item.id.videoId, 'playerA')"
            >
               A
            </p>
            <p
               class="result-button"
               @click="setVideo(item.id.videoId, 'playerB')"
            >
               B
            </p>
         </div>
      </div>
   </div>
</template>

<style>
   .search-input-container {
      margin-top: 70px;
      display: flex;
      justify-content: center;
   }
   .search-button {
      height: 50px;
      box-sizing: border-box;
      padding: 7px 25px;
      color: #fff;
      background-color: #2d206dc3;
      border: 1px solid #fff;
      border-radius: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1.3rem;
      cursor: pointer;
   }
   .search-button:focus-visible {
      outline: 1px solid #fff;
   }
   .search-button:hover {
      transition: all 1s cubic-bezier(0.075, 0.82, 0.165, 1);
      transform: scale(1.04);
      box-shadow: 1px 1px 5px #ffffff55;
   }
   .search-input {
      height: 50px;
      box-sizing: border-box;
      padding: 7px 25px;
      color: #ffffffd7;
      background-color: #2d206dc3;
      border: 1px solid #fff;
      border-radius: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1.3rem;
      margin-right: 10px;
   }
   .search-input::placeholder {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 1.3rem;
      color: #9d9d9d;
   }
   .search-input:focus-visible {
      outline: 2px solid #fff;
      border: 1px solid #ffffff00;
   }
   .searchResults {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      margin-bottom: 50px;
      overflow: scroll;
      padding: 20px 10px;
      border-radius: 10px;
      box-sizing: border-box;
      /* border: 2px solid #fff; */
   }
   .searchResult {
      width: 170px;
      aspect-ratio: 16/9;
      position: relative;
      border-radius: 10px;
      box-shadow: 2px 2px 8px #0e0d0d94;
      background: rgb(0, 0, 0);
      background: -moz-linear-gradient(
         132deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(40, 40, 40, 1) 34%,
         rgba(0, 0, 0, 1) 91%
      );
      background: -webkit-linear-gradient(
         132deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(40, 40, 40, 1) 34%,
         rgba(0, 0, 0, 1) 91%
      );
      background: linear-gradient(
         132deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(40, 40, 40, 1) 34%,
         rgba(0, 0, 0, 1) 91%
      );
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
      background-size: 100% 100%;
      box-sizing: border-box;
      padding: 0px 0px 15px 0px;
      cursor: pointer;
      transition: 0.4s all ease-out;
   }
   .search-result-img {
      width: 100%;
      border-radius: 10px;
   }
   .search-result-title {
      margin: 10px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 600;
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
      opacity: 0%;
      transition: 0.4s all ease-out;
      cursor: pointer;
   }
   .result-button-container:hover {
      opacity: 100%;
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
      color: white;
      width: 100%;
      transition: 0.4s all ease-out;
      border-radius: 10px;
      text-shadow: 1px 1px #000;
   }
   .result-button:hover {
      background-color: #bf0ad6a1;
   }
</style>
