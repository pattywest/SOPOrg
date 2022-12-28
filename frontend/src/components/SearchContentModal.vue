<template>
  <v-overlay :z-index="100">
    <v-card v-click-outside="emitCloseModal" class="pa-4" light>
      <v-btn fab small color="grey" @click="emitCloseModal">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
      <v-card-title>Search by file content</v-card-title>
      <v-responsive
        min-width="400px"
        width="50vw"
        max-width="800px"
        max-height="70vh"
        class="d-flex flex-column pa-4"
      >
        <v-text-field
          v-model="search"
          label="Search"
          single-line
          clearable
          @keyup.enter.native="submit()"
        ></v-text-field>
        <v-btn
          color="primary"
          align="right"
          :disabled="!canSearch"
          @click="submit()"
        >
          Search
        </v-btn>
        <v-card v-if="documents.length && !isLoading" class="d-flex flex-column pa-4 mt-4" style="max-height: 40vh; overflow: scroll;">
          <v-list>
            <v-list-item v-for="doc in documents" :key="doc.id" :to="`/document/${doc.id}`" @click="emitCloseModal()">
              {{ doc.original_file_name }} - Version {{ doc.version_number }}
            </v-list-item>
          </v-list>
        </v-card>
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          :size="40"
          :width="4"
          color="primary"
          class="float-right mr-4"
        ></v-progress-circular>
          <v-card-subtitle v-if="errorMessage"
            ><strong>An error occurred.</strong> Error:<br />{{
              errorMessage
            }}</v-card-subtitle
          >
      </v-responsive>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getAllSOPsWithContent } from '@/services/sops';

export default defineComponent({
  name: 'SearchContentModal',
  data() {
    return {
      search: '',
      lastSearch: '',
      documents: [],
      errorMessage: undefined,
      isLoading: false,
    };
  },
  computed: {
    canSearch() {
      return !(this.isLoading || this.search === this.lastSearch || this.search === '');
    }
  },
  methods: {
    emitCloseModal() {
      this.$emit('closeModal');
    },
    submit() {
      this.isLoading = true;

      getAllSOPsWithContent(this.search)
        .then((filteredDocuments) => {
          this.documents = filteredDocuments;
          this.errorMessage = undefined;
        })
        .catch((err) => {
          console.log('error', err);
          this.errorMessage = err.message;
        })
        .finally(() => {
          this.isLoading = false;
          this.lastSearch = this.search;
        });
    },
  },
});
</script>
