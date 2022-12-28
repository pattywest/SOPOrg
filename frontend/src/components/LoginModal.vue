<template>
  <v-overlay :z-index="100">
    <v-card v-click-outside="emitCloseModal" class="pa-4" light>
      <v-btn fab small color="grey" @click="emitCloseModal">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
      <v-card-title>Log in</v-card-title>
      <v-responsive
        min-width="300px"
        width="40vw"
        max-width="600px"
        class="d-flex flex-column pa-4"
      >
        <v-text-field v-model="email" label="Email"></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          @keyup.enter.native="submit()"
        ></v-text-field>
        <v-card-subtitle v-if="errorMessage"
          ><strong>An error occurred.</strong> Error:<br />{{
            errorMessage
          }}</v-card-subtitle
        >
        <v-btn
          v-if="!isLoading"
          color="primary"
          class="float-right"
          :disabled="!formIsValid"
          @click="submit()"
          >Login</v-btn
        >
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          :size="40"
          :width="4"
          color="primary"
          class="float-right mr-4"
        ></v-progress-circular>
      </v-responsive>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { login } from '@/services/auth';

export default defineComponent({
  name: 'LoginModal',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: undefined,
      isLoading: false,
    };
  },
  computed: {
    formIsValid() {
      // TODO - improve this
      return this.email !== '' && this.password !== '';
    },
  },
  methods: {
    emitCloseModal() {
      this.$emit('clearLoginModal');
    },
    submit() {
      this.isLoading = true;
      login({ email: this.email, password: this.password })
        .then(() => {
          this.$emit('authenticationChange');
        })
        .catch((err) => {
          console.log('error', err);
          this.errorMessage = err.message;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
</script>
