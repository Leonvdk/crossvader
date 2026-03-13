<script setup>
const props = defineProps({
   error: Object,
});

let handleRefresh = () => {
   window.location.href = "/";
};
</script>

<template>
   <div class="error-page">
      <h1 class="error-title">{{ error?.statusCode || 500 }}</h1>
      <p class="error-message">{{ error?.message || "Something went wrong" }}</p>
      <p class="error-hint">If you see this page, try to refresh the page</p>
      <button class="error-btn" @click="handleRefresh">REFRESH</button>
   </div>
</template>

<style>
@font-face {
   font-family: "Pixeloid";
   src: url("assets/fonts/PressStart.ttf");
}

.error-page {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   min-height: 100vh;
   background-color: #1E1451;
   background-image: url(assets/images/retro-pixel-landscape-background.webp);
   background-size: cover;
   background-repeat: no-repeat;
   padding: 20px;
   box-sizing: border-box;
   text-align: center;
}

.error-title {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 4rem;
   color: #d44a4a;
   text-shadow: 0 0 10px #d44a4a, 2px 4px 0px #3a0a0a;
   margin-bottom: 16px;
}

.error-message {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.7rem;
   color: #9fb5c3;
   margin-bottom: 32px;
   max-width: 400px;
   line-height: 1.6;
}

.error-hint {
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 1.2rem;
   color: #e2e2e2;
   text-shadow: 0 0 8px #c10ad7;
   margin-bottom: 40px;
   max-width: 500px;
   line-height: 1.8;
}

.error-btn {
   background: #1a3d5c;
   color: #e2e2e2;
   border: none;
   border-radius: 0;
   box-shadow:
      -3px 0 0 0 #3a8abf,
      3px 0 0 0 #0a1d3a,
      0 -3px 0 0 #3a8abf,
      0 3px 0 0 #0a1d3a;
   padding: 16px 40px;
   font-family: "Pixeloid", Arial, Helvetica, sans-serif;
   font-size: 0.8rem;
   cursor: pointer;
   letter-spacing: 2px;

   &:active {
      background: #2a5d8c;
      box-shadow:
         -3px 0 0 0 #0a1d3a,
         3px 0 0 0 #3a8abf,
         0 -3px 0 0 #0a1d3a,
         0 3px 0 0 #3a8abf;
   }
}
</style>
