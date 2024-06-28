// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   runtimeConfig: {
      youtubeApiUrl: "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&&type=video&key=AIzaSyAn-BLsTw7ezBLFm_SNNuDShEr-tDAVndQ&q=",
   },
   devtools: { enabled: true },
   app: {
      head: {
         // script: [
         //    {
         //       // src: "js/bundle.js",
         //    },
         //    { src: "https://www.youtube.com/iframe_api" },
         // ],
      },
   },
});
