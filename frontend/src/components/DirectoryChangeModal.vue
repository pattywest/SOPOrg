<template>
  <v-overlay :z-index="100">
    <v-card v-click-outside="closeModal" class="pa-4" light>
      <v-btn fab small color="grey" @click="closeModal">
        <v-icon color="white" @click="$emit('revertChanges')">mdi-close</v-icon>
      </v-btn>
      <v-card-title>Confirm change</v-card-title>
      <v-card-actions>
        <v-btn
          color="secondary"
          class="float-right"
          @click="$emit('revertChanges')"
          >Cancel</v-btn
        >
        <v-btn
          color="primary"
          class="float-right"
          @click="$emit('acceptChanges')"
          >Yes</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DirectoryChangeModal',
  methods: {
    closeModal() {
      this.$emit('clearDirectoryChangeModal');
    },
  },
});
</script>
