<template>
  <v-overlay :value="isVisible" :z-index="100">
    <v-card v-click-outside="closeModal" class="pa-4 d-" light>
      <v-btn fab small color="grey" @click="closeModal">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
      <v-responsive
        min-width="300px"
        width="10vw"
        max-width="600px"
        class="d-flex flex-column pa-4"
      >
        <div class="red--text">{{errorMessage}}</div>
        <v-btn color="primary" class="float-right" @click="closeModal"
          >Ok</v-btn
        >
      </v-responsive>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorModal',
  props: {
    errorMessage: [],
  },
  data() {
    return {
      formData: this.errorMessage,
    };
  },
  methods: {
    closeModal() {
      this.$emit('emitCloseErrorModal');
    },
  },
});
</script>
