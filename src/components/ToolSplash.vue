<template>
  
  <button v-if="!message" :disabled="loading" type="button" @click="loadMessage" class="border-2  bg-sky-800 rounded px-2 py-1  text-white hover:shadow-lg">Load message</button>
  <loading-indicator class="w-4 h-4" v-if="loading"></loading-indicator>
  <figure v-if="message" class="text-monospace">{{ message }}</figure>
</template>
<script>
import payloadUrl from "../assets/payload.json?url";
import WrapperEventDispatcher from "../WrapperEventDispatcher";
import LoadingIndicator from "./LoadingIndicator.vue"

export default {
  components: {
    LoadingIndicator
  },
  data() {
    return {
      message: null,
      loading: false
    }
  },
  methods: {
    loadMessage () {
        this.loading = true;

      fetch(payloadUrl)
      .then((r) => r.json())
      .then((p) => {
        this.message = p.message[this.$root.language];
        this.loading = false;
        WrapperEventDispatcher.dispatch(null, [{name: this.message}]);
      });
}
  }
};
</script>
