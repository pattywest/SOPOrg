<template>
  <div>
    <v-container>
      <v-row align-v="center">
        <v-col cols="1" align="left" align-self="center"
          ><v-icon>mdi-folder-open</v-icon></v-col
        >
        <v-col cols="8" align="left" align-self="center" style="max-width:200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">                              
          {{ directoryName }}
        </v-col>
        <v-col v-if="isLoggedIn" align="right" align-self="center">
          <div>
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <v-btn color="primary" icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="createSop(directoryName)">
                  Create
                </v-list-item>

                <v-list-item @click="selectFile(directoryName)">
                  Upload
                </v-list-item>
                <v-list-item @click="deleteDirectory(dirID)">
                  Delete
                </v-list-item>
                <input
                  ref="uploadFile"
                  type="file"
                  accept=".docx"
                  hidden
                  @change="rememberFileSelectionUpload"
                />
              </v-list>
            </v-menu>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <ErrorModal
      v-if="showErrorModal"
      :error-message="errorMessage"
      @emitCloseErrorModal="showErrorModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { uploadNew } from '@/services/documents';

export default defineComponent({
  name: 'UploadButton',
  props: {
    directoryName: String,
    dirID: Number,
    isLoggedIn: Boolean,
    isCreatingSop: Boolean,
  },
  data: () => ({
    fileData: undefined,
    sopId: undefined,
    isSelecting: false,
    isLoading: false,
    editorId: undefined,
    selectedDirectoryName: undefined,
    errorMessage: '', 
    showErrorModal: false,
  }),
  methods: {
    // Credit: https://ourcodeworld.com/articles/read/1424/how-to-use-a-button-as-a-file-uploader-with-vuetify-in-vuejs
    selectFile(selectedDirectoryName) {
      this.selectedDirectoryName = selectedDirectoryName;
      this.isSelecting = true;
      window.addEventListener(
        'focus',
        () => {
          this.isSelecting = false;
        },
        { once: true }
      );
      this.$refs.uploadFile.click();
    },
    rememberFileSelectionUpload(event) {
      this.fileData = new FormData();
      this.fileData.append('file', event.target.files[0]);
      const fileExtension = event.target.files[0].name.split('.').pop();
      console.log(fileExtension)
      if (fileExtension === 'docx') {
        this.uploadFile();
      } else {
        this.errorMessage = "Only .docx files can be uploaded.";
        this.showErrorModal = true;
      }
    },
    createSop(directoryName) {
      this.fileData = new FormData();
      this.fileData.append('directory_name', directoryName);
      this.fileData.append('editor_id', window.localStorage.getItem('id'));
      this.$emit('emitOpenCreateSopModal', this.fileData);
    },
    deleteDirectory(id){
      this.$emit('emitDeleteDirectory', id);
    },
    uploadFile() {
      this.fileData.append('directory_name', this.selectedDirectoryName);
      this.fileData.append('editor_id', window.localStorage.getItem('id'));
      this.isLoading = true;

      uploadNew(this.fileData)
        .then((res) => {
          console.log(res);
          this.isLoading = false;
          this.$emit('refresh');
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
        })
    },
  },
});
</script>
