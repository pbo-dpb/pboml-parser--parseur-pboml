<template>
<div class="flex flex-col justify-center items-center gap-8">
  <img alt="Vue logo" :src="logoUrl" class="w-64" />
  <ToolSplash />
  </div>
</template>

<script>
import logoUrl from "./assets/logo.svg?url";
import ToolSplash from './components/ToolSplash.vue'
import WrapperEventDispatcher from "./WrapperEventDispatcher.js"

const language = document.documentElement.lang;

export default {
  data() {
    return {
      language: language,
    };
  },
  computed: {
    logoUrl() {
      return logoUrl
    }
  },
  components: {
    ToolSplash,
  },
  mounted() {

    const pageTitle = this.language === 'fr' ? 'Gabarit' : 'Boilerplate';
    (new WrapperEventDispatcher(pageTitle, null)).dispatch();

  }
};
</script>
<style>
@import "./index.css";
</style>
