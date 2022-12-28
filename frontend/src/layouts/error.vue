<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <v-card class="pa-5">
      <v-card-title class="text-h3">An error occurred</v-card-title>
      <v-card-subtitle v-if="error.statusCode === 404" class="text-h5">
        {{ pageNotFound }}
      </v-card-subtitle>
      <v-card-subtitle v-else class="text-h5">
        {{ otherError }}
      </v-card-subtitle>
      <v-card-text>
        <span class="font-weight-bold">Additional info:</span>
        <br />
        {{ additionalInfo }}
      </v-card-text>
      <v-card-actions>
        <v-btn to="/" color="primary">Home Page</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface State {
  pageNotFound?: String;
  otherError?: String;
  additionalInfo?: String;
}

export default defineComponent({
  name: 'ErrorLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data(): State {
    return {
      pageNotFound: 'Page Not Found',
      otherError: this.error.message ?? 'An error occurred',
      additionalInfo:
        this.error.error?.message ?? 'No more information available',
    };
  },
  head(): Object {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return { title };
  },
});
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
