<template>
  <v-overlay :z-index="100">
    <v-card class="pa-4" light :key="cardKey">
      <v-btn fab small color="grey" @click="closeModal">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
      <v-card-title>Users</v-card-title>
      <v-responsive
      min-width="300px"
      width="40vw"
      max-width="700px"
      class="d-flex flex-column pa-4">
      <v-row>
        <v-col :cols="8">
          <v-text-field
          :id="email"
          v-model="email"
          hide-details
          single-line
          clearable
          placeholder="Email"
          ></v-text-field>
        </v-col>
        <v-col :col="2">
          <v-btn @click="preregisterUser">Add</v-btn>
        </v-col>
        <v-col :col="2">
          <v-btn @click="deleteUser">Remove</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="errorMessage" class="red--text mb-2">{{ errorMessage }}</v-col>
      </v-row>
      <v-list>
        <v-list-item>
          <v-list-item-title>Name
            <v-list-item-subtitle>Email</v-list-item-subtitle>
          </v-list-item-title>
          <div>Admin?</div>
        </v-list-item>
      </v-list>
      <v-list max-height="500px" style="overflow-y: scroll">
        <v-list-item v-for="(user) in this.usersList" :key="user.id">
          <v-list-item-title>{{ user.name }}
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item-title>
          <v-switch disabled v-if="emailProp === user.email" input-value="true"></v-switch>
          <v-switch v-else-if="user.privilege !== undefined && user.privilege === 1"
            v-model="user.privilege !== undefined && user.privilege === 1"
            @click="revokeAccess(user)">
          </v-switch>
          <v-switch v-else-if="user.name !== 'Not registered' && user.privilege !== undefined && user.privilege === 0"
          v-model="user.privilege !== undefined && user.privilege === 1"
          @click="grantAccess(user)"></v-switch>
        </v-list-item>
      </v-list>
      </v-responsive>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import Vue, { defineComponent } from 'vue';
import { getUsers, updateUserPriv } from '~/services/users';
import { preregisterUser } from '~/services/auth'; 
import { deleteUser } from '~/services/users'; 
import { User } from '@/types/index';

export default defineComponent({
  name: 'PrivilegeModal',
  props: {
    emailProp: String
  },
  data(){
    return{
      usersList: [],
      cardKey: 0,
      email: "",
      errorMessage: "",
    };
  },
  methods: {
    closeModal(){
      this.$emit('clearPrivModal');
    },
    grabUsers(){
      this.usersList = [];
      getUsers()
        .then((users) => {
          console.log(users);
          for(let i = 0; i < users.length; i++){
            this.usersList.push(users[i]);
          }
        })
        .catch((err) => {
          console.log(err);
        })
    },
    grantAccess(user: User){
      this.errorMessage = "";
      let newUserPrivileges = JSON.parse(JSON.stringify(user));
      newUserPrivileges.privilege = 1;
      updateUserPriv(user.id, newUserPrivileges)
        .then(() => {
          this.grabUsers();
          this.refresh();
        })
        .catch((err) => {
          this.errorMessage = err;
        });
    },
    revokeAccess(user: User){
      this.errorMessage = "";
      let newUserPrivileges = JSON.parse(JSON.stringify(user));
      newUserPrivileges.privilege = 0;
      updateUserPriv(user.id, newUserPrivileges)
        .then(() => {
          this.grabUsers();
          this.refresh();
        })
        .catch((err) => {
          this.errorMessage = err;
        });
    },
    refresh(){
      this.cardKey += 1;
    },
    preregisterUser() {
      this.errorMessage = "";
      preregisterUser({email: this.email})
        .then(() => {
          this.grabUsers();
        })
        .catch((err) => {
          this.errorMessage = err;
        })
    },
    deleteUser() {
      this.errorMessage = "";
      if(this.email === this.emailProp) {
        this.errorMessage = "Error: Cannot delete yourself";
      }
      else {
        deleteUser({email: this.email})
          .then(() => {
            this.grabUsers();
          })
          .catch((err) => {
            this.errorMessage = err;
          })
      }
    }
  },
  mounted() {
    this.grabUsers();
  }
});
</script>