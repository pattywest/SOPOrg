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
        <v-text-field :id="name" v-model="name" label="SOP Name"></v-text-field>
        <div v-if="hasPeriod" class="red--text">Periods are not allowed.</div>
        <v-btn color="primary" class="float-right" @click="confirmSopName"
          >Confirm</v-btn
        >
      </v-responsive>
    </v-card>
    <ErrorModal
      v-if="showErrorModal"
      :error-message="errorMessage"
      @emitCloseErrorModal="showErrorModal = false"
    />
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { uploadNew } from '@/services/documents';

export default defineComponent({
  name: 'CreateSopModal',
  props: {
    initialFormData: [],
  },
  data() {
    return {
      name: '',
      isModalVisible: false,
      isLoading: false,
      formData: this.initialFormData,
      hasPeriod: false,
      showErrorModal: false,
      errorMessage: '',
    };
  },
  methods: {
    closeModal() {
      this.$emit('emitCloseCreateSopModal');
    },
    confirmSopName() {
      if (!this.name) return;
      this.formData.append('file', new File([''], `${this.name}.html`));

      // No file extensions allowed
      const nameSplit = this.name.split('.');

      if (nameSplit.length === 1) {
        this.hasPeriod = false;
        this.isLoading = true;
        uploadNew(this.formData)
          .then((res) => {
            console.log(res);
            this.$router.push(`/document/${res.id}`);
            this.$root.$emit('refresh');
            this.isLoading = false;
            this.closeModal();
          })
          .catch((err) => {
            this.errorMessage = err;
            this.showErrorModal = true;
          });
      } else {
        this.hasPeriod = true; 
      }
    },
  },
});
</script>
