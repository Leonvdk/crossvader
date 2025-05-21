<script setup>
   useHead({
      title: "Crossfader",
      script: [
         { src: "https://www.youtube.com/iframe_api" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "favicon.ico" }],

   });
</script>

<template>
   <div>
      <NuxtRouteAnnouncer />
      <NuxtPage />
   </div>
</template>
