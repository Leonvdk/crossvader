// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   runtimeConfig: {
      public: {
         youtubeApiUrl: process.env.NUXT_YOUTUBE_API_URL
      },
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
