<template>
  <v-card v-if="file">
    <v-card-title class="headline justify-space-between">
      <v-btn color="primary" :class="{ hide: !editingFile }" @click="cancelEdit"
        >Cancel</v-btn
      >

      <v-btn v-if="editingFile" color="primary" @click="saveFile">Save</v-btn>
    </v-card-title>
    <v-card-text :class="{ hide: file == null || !editingFile }">
      <div ref="quillEditor"></div>
    </v-card-text>
    <v-card-text :class="{ hide: file == null || editingFile }">
      <div ref="quillViewer"></div>
    </v-card-text>
    <ErrorModal
      v-if="showErrorModal"
      :error-message="errorMessage"
      @emitCloseErrorModal="showErrorModal = false"
    />
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { save, getDocumentsWithSopId } from '~/services/documents';
import { getSOP } from '~/services/sops';

export default defineComponent({
  name: 'Editor',
  props: {
    file: undefined,
    document: undefined,
    savedDocuments: undefined,
  },
  data() {
    return {
      editingFile: false,
      isShowingDeleteOverlay: false,
      selectedFile: undefined,
      fileData: undefined,
      isSelecting: false,
      showErrorModal: false,
      errorMessage: '',
      toolbarOptions: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        ['clean'], // remove formatting button
        ['link', 'image'],
      ],
    };
  },
  mounted() {
    if (this.file) {
      this.quillEditor = new Quill(this.$refs.quillEditor, {
        modules: {
          toolbar: this.toolbarOptions,
        },
        readOnly: false,
        theme: 'snow',
      });

      this.quillViewer = new Quill(this.$refs.quillViewer, {
        modules: {
          toolbar: false,
        },
        readOnly: true,
        theme: 'snow',
      });
      this.quillEditor.setContents(
        this.quillEditor.clipboard.convert(this.file),
        'silent'
      );
      this.quillViewer.setContents(
        this.quillViewer.clipboard.convert(this.file),
        'silent'
      );
    }
  },
  methods: {
    cancelEdit() {
      this.editingFile = false;
    },
    editFile() {
      this.editingFile = !this.editingFile;
      if (this.editingFile === false) {
        this.quillViewer.setContents(this.quillEditor.getContents());
      }
    },
    async saveFile({ params, error }) {
      this.fileData = new FormData();
      let fileName = this.document.original_file_name.replace(/\.[^/.]+$/, '');
      fileName += '.html';

      const file = new File([this.quillEditor.root.innerHTML], fileName, {
        type: 'text/html',
      });
      this.fileData.append('file', file);
      this.fileData.append('sop_id', this.document.sop_id);
      this.fileData.append('editor_id', window.localStorage.getItem('id'));
      this.fileData.append(
        'directory_name',
        this.document.location.split('/')[0]
      );

      this.savedDocuments = save(this.fileData)
        .then((res) => {
          this.$router.push(`/document/${res.id}`);
          this.$nuxt.refresh();
          this.$root.$emit('refresh');
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          error({
            statusCode: 500,
            message: 'Something went wrong while saving the document',
            error: err,
          });
        });
    },
    emitDeletion() {
      this.$emit('delete-file');
    },
  },
});
</script>

<style>
.hide {
  display: none !important;
}

.ql-editor {
  font-size: 1.005rem;
}
</style>
