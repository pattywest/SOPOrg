<template>
  <v-overlay :z-index="100">
    <v-card v-click-outside="closeModal" class="pa-4" light>
      <v-btn fab small color="grey" @click="closeModal">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
      <v-card-title>Register</v-card-title>
      <v-responsive
        v-if="!isShowingSuccessMessage"
        min-width="300px"
        width="40vw"
        max-width="600px"
        class="d-flex flex-column pa-4"
      >
        <v-text-field :id="name" v-model="name" label="Name"></v-text-field>
        <v-text-field :id="email" v-model="email" label="Email"></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
        ></v-text-field>
        <v-text-field
          v-model="cpassword"
          label="Confirm Password"
          type="password"
          @keyup.enter.native="register()"
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
          @click="register"
          >Register</v-btn
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
      <v-responsive v-else>
        <v-card-subtitle> Account successfully registered. </v-card-subtitle>
        <v-card-text>
          Please sign in with your newly created account
        </v-card-text>
      </v-responsive>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { registerUser, preregisterUser } from '~/services/auth';
import { getUsers, updateUserPriv } from '~/services/users';

export default defineComponent({
  name: 'RegisterModal',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      cpassword: '',
      errorMessage: undefined,
      isLoading: false,
      isShowingSuccessMessage: false,
    };
  },
  computed: {
    formIsValid() {
      // TODO - improve this
      return (
        this.name !== '' &&
        this.email !== '' &&
        this.password !== '' &&
        this.password === this.cpassword
      );
    },
  },
  methods: {
    closeModal() {
      this.$emit('clearRegModal');
    },
    register() {
      this.isLoading = true;
      getUsers()
        .then((users) => {
          if (users.length === 0) {
            preregisterUser({email: this.email})
              .then(() => {
                registerUser({
                  name: this.name,
                  email: this.email,
                  password: this.password,
                })
                  .then((status) => {
                    if(status.status === 200) {
                      getUsers()
                        .then((users) => {
                          let user = users[0];
                          let newUserPrivileges = JSON.parse(JSON.stringify(user));
                          newUserPrivileges.privilege = 1;
                          updateUserPriv(user.id, newUserPrivileges)
                            .then(() => {
                              this.isShowingSuccessMessage = true;
                            })
                        })
                    }
                    else {
                      this.errorMessage = status.statusText;
                    }
                    setTimeout(() => {
                      this.$emit('clearRegModal');
                    }, 7500);
                  })
                  .catch((err) => {
                    console.log('error', err);
                  })
                  .finally(() => {
                    this.isLoading = false;
                  });                             
              })
          }
          else {
            registerUser({
              name: this.name,
              email: this.email,
              password: this.password,
            })
              .then((status) => {
                if(status.status === 200) {
                  this.isShowingSuccessMessage = true;
                }
                else if(status.status === 403) {
                  this.errorMessage = "This email is already registered.";
                }
                else if(status.status === 409) {
                  this.errorMessage = "An admin must preregister your email.";
                }
                else {
                  this.errorMessage = status.statusText;
                }
                setTimeout(() => {
                  this.$emit('clearRegModal');
                }, 7500);
              })
              .catch((err) => {
                console.log('error', err);
              })
              .finally(() => {
                this.isLoading = false;
              });
          }
        })
    },
  },
});
</script>
