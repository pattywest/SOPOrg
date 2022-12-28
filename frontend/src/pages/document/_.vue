<template>
  <ErrorModal
    v-if="showErrorModal"
    :error-message="errorMessage"
    @emitCloseErrorModal="showErrorModal = false"
  />
  <v-row v-else justify="center" align="center">
    
    <v-col>
      <v-card>
        <v-card-title>
          {{ removeExtension(sop.name) }}<v-spacer></v-spacer>
        </v-card-title>
        <v-card-title>
          <v-select
            v-model="selectedVersion"
            :items="versions"
            item-text="version_number"
            return-object
            outlined
            @change="onVersionChange($event)"
          ></v-select>
          <v-spacer></v-spacer>

          Options
          <v-menu bottom left>
            <template #activator="{ on, attrs }">
              <v-btn color="primary" icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item v-if="isLoggedIn" @click="$refs.editorRef.editFile()">
                Edit
              </v-list-item>

              <v-list-item v-if="isLoggedIn" @click="selectFile()"
                >Upload new version
                <input
                  ref="updateExistingDocument"
                  type="file"
                  hidden
                  @change="rememberFileSelection"
                />
              </v-list-item>

              <!-- Add v-if=!editingFile -->
              <v-list-item
                v-if="isLoggedIn" 
                :disabled="Boolean(document.marked_for_deletion_by_user_id)"
                @click="isShowingDeleteOverlay = true"
              >
                Mark SOP for deletion<v-icon>mdi-trash-can</v-icon>
              </v-list-item>

              <v-list-item
                v-if="isAdmin && versions.length > 1"
                @click="isShowingAdminDeleteVersionOverlay = true"
              >
                Delete version<v-icon>mdi-trash-can</v-icon>
              </v-list-item>

              <v-list-item
                v-if="(isAdmin && this.document.marked_for_deletion_by_user_id !== null)"
                @click="isShowingAdminDeleteSopOverlay = true"
              >
                Delete SOP<v-icon>mdi-trash-can</v-icon>
              </v-list-item>

              <v-list-item v-if="isLoggedIn" @click="isShowingRenameOverlay = true">
                Rename
              </v-list-item>

              <v-list-item @click="downloadSop"> Download </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>

        <v-card-subtitle>
          Original filename: {{ removeExtension(document.original_file_name) }}
        </v-card-subtitle>
        <v-card-subtitle>
          Editor: {{ editor.name }} <a v-bind:href="`mailto:${editor.email}`">({{ editor.email }})</a>
        </v-card-subtitle>
        <v-card-subtitle v-if="deleter" class="font-weight-bold">
          Marked for deletion by user: {{ deleter.name }}
        </v-card-subtitle>

        <editor
          ref="editorRef"
          :file="file"
          :document="document"
          @delete-file="isShowingDeleteOverlay = true"
        />

        <v-overlay :value="isShowingDeleteOverlay" :z-index="100">
          <v-card v-click-outside="closeDeleteModal" class="pa-4 d-" light>
            <v-responsive
              min-width="300px"
              width="40vw"
              max-width="600px"
              class="d-flex flex-column pa-4"
            >
              <v-card-title>Deletion Confirmation</v-card-title>
              <V-card-text>
                <span class="text-body-1">
                  Are you sure that you want to mark file
                  <strong>{{ document.original_file_name }}</strong> for
                  deletion?
                </span>
                <br />
                <br />
                <span class="text-body-2">
                  An admin must approve your request before the file will be
                  deleted.
                </span>
              </V-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn @click="closeDeleteModal">Cancel</v-btn>
                <v-btn
                  v-if="!isAwaitingDeletionCall"
                  color="primary"
                  @click="markDocForDeletion"
                  >Mark for deletion</v-btn
                >
                <v-progress-circular
                  v-if="isAwaitingDeletionCall"
                  indeterminate
                  :size="40"
                  :width="4"
                  color="primary"
                  class="mr-4"
                ></v-progress-circular>
              </v-card-actions>
            </v-responsive>
          </v-card>
        </v-overlay>

        <v-overlay :value="isShowingAdminDeleteVersionOverlay" :z-index="100">
          <v-card v-click-outside="closeAdminDeleteVersionModal" class="pa-4 d-" light>
            <v-responsive
              min-width="300px"
              width="40vw"
              max-width="600px"
              class="d-flex flex-column pa-4"
            >
              <v-card-title>Deletion Confirmation</v-card-title>
              <V-card-text>
                <span class="text-body-1">
                  Are you sure that you want to delete
                  <strong>{{ document.version_number }}</strong
                  >?
                </span>
              </V-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn @click="closeAdminDeleteVersionModal">Cancel</v-btn>
                <v-btn
                  v-if="!isAwaitingAdminDeletionCall"
                  color="primary"
                  @click="adminDeleteVersion"
                  >Delete</v-btn
                >
                <v-progress-circular
                  v-if="isAwaitingAdminDeletionCall"
                  indeterminate
                  :size="40"
                  :width="4"
                  color="primary"
                  class="mr-4"
                ></v-progress-circular>
              </v-card-actions>
            </v-responsive>
          </v-card>
        </v-overlay>

        <v-overlay :value="isShowingAdminDeleteSopOverlay" :z-index="100">
          <v-card v-click-outside="closeAdminDeleteSopModal" class="pa-4 d-" light>
            <v-responsive
              min-width="300px"
              width="40vw"
              max-width="600px"
              class="d-flex flex-column pa-4"
            >
              <v-card-title>Deletion Confirmation</v-card-title>
              <V-card-text>
                <span class="text-body-1">
                  Are you sure that you want to delete
                  <strong>{{ removeExtension(sop.name) }}</strong
                  >?
                </span>
              </V-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn @click="closeAdminDeleteSopModal">Cancel</v-btn>
                <v-btn
                  v-if="!isAwaitingAdminDeletionCall"
                  color="primary"
                  @click="adminDeleteSop"
                  >Delete</v-btn
                >
                <v-progress-circular
                  v-if="isAwaitingAdminDeletionCall"
                  indeterminate
                  :size="40"
                  :width="4"
                  color="primary"
                  class="mr-4"
                ></v-progress-circular>
              </v-card-actions>
            </v-responsive>
          </v-card>
        </v-overlay>

        <v-overlay :value="isShowingRenameOverlay" :z-index="100">
          <v-card v-click-outside="closeRenameModal" class="pa-4 d-" light>
            <v-responsive
              min-width="300px"
              width="40vw"
              max-width="600px"
              class="d-flex flex-column pa-4"
            >
              <v-card-title>Rename SOP</v-card-title>
              <v-text-field :id="newName" v-model="newName" autofocus>{{
                newName
              }}</v-text-field>
              <v-card-actions class="justify-space-between">
                <v-btn @click="closeRenameModal">Cancel</v-btn>
                <v-btn
                  v-if="!isAwaitingRenameCall"
                  color="primary"
                  @click="renameOnClick"
                  >Rename</v-btn
                >
                <v-progress-circular
                  v-if="isAwaitingRenameCall"
                  indeterminate
                  :size="40"
                  :width="4"
                  color="primary"
                  class="mr-4"
                ></v-progress-circular>
              </v-card-actions>
            </v-responsive>
          </v-card>
        </v-overlay>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  getDocument,
  getDocuments,
  markDeleteDocument,
  deleteDocument,
  getDocumentsWithSopId,
  updateExisting,
  downloadDocument,
} from '~/services/documents';
import { getFile } from '~/services/files';
import { getSOP, rename, deleteSop } from '~/services/sops';
import { getUser } from '~/services/users';

export default {
  name: 'DocumentPage',
  async asyncData({ params, error }) {
    const documentId = params.pathMatch;
    const isAdmin = window.localStorage.getItem('isAdmin') === 'true';
    const isLoggedIn = window.localStorage.getItem('isLoggedIn') === 'true';

    let sop, document, file, selectedVersion, versions, deleter, newName, editor;
    try {
      document = await getDocument(documentId);
      sop = await getSOP(document.sop_id);
      newName = (sop.name).replace(/\.[^/.]+$/, '');
      file = await getFile(
        `${document.location}${document.version_number}.html`
      );
      if (document.marked_for_deletion_by_user_id) {
        deleter = await getUser(document.marked_for_deletion_by_user_id);
      }
      versions = await getDocumentsWithSopId(sop.id);
      versions.map((doc_version) => {
        doc_version.version_number = 'Version ' + doc_version.version_number;
      });
      selectedVersion = document;
      selectedVersion.version_number =
        'Version ' + selectedVersion.version_number;
      editor = await getUser(document.editor_id)
    } catch (err) {
      error({
        statusCode: 500,
        message: `Something went wrong while fetching the document: ${err}`,
      });
    }

    return {
      sop,
      documentId,
      document,
      file,
      versions,
      selectedVersion,
      deleter,
      newName,
      isAdmin,
      isLoggedIn,
      editor
    };
  },
  data() {
    return {
      isShowingDeleteOverlay: false,
      isShowingRenameOverlay: false,
      isAwaitingDeletionCall: false,
      isShowingAdminDeleteVersionOverlay: false,
      isShowingAdminDeleteSopOverlay: false,
      isAwaitingAdminDeletionCall: false,
      isAwaitingRenameCall: false,
      versions: [],
      selectedVersion: {},
      newName: '',
      errorMessage: '',
      showErrorModal: false,
    };
  },
  head() {
    return {
      title: `${this.sop?.name} - Version ${this.document?.version_number}`,
    };
  },
  mounted() {
    this.$root.$on('authChange', () => {
      this.isAdmin = window.localStorage.getItem('isAdmin') === 'true';
      this.isLoggedIn = window.localStorage.getItem('isLoggedIn') === 'true';
    })
  },
  methods: {
    closeDeleteModal() {
      this.isShowingDeleteOverlay = false;
    },
    closeRenameModal() {
      this.isShowingRenameOverlay = false;
    },
    markDocForDeletion() {
      this.isAwaitingDeletionCall = true;
      markDeleteDocument(this.documentId)
        .then(() => {
          this.$nuxt.refresh(); // refresh the component (and the data)
          this.closeDeleteModal();
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          this.error({
            statusCode: 500,
            message:
              'Something went wrong while marking the document for deletion',
            error: err,
          });
        })
        .finally(() => {
          this.isAwaitingDeletionCall = false;
        });
    },
    closeAdminDeleteVersionModal() {
      this.isShowingAdminDeleteVersionOverlay = false;
    },
    closeAdminDeleteSopModal() {
      this.isShowingAdminDeleteSopOverlay = false;
    },
    async adminDeleteVersion() {
      this.isAwaitingAdminDeletionCall = true;
      deleteDocument(this.documentId)
        .then(async (latestDocument) => {
          this.versions = await getDocumentsWithSopId(this.sop.id);
          this.versions.map((doc_version) => {
            doc_version.version_number =
              'Version ' + doc_version.version_number;
          });
          this.$router.push(`/document/${latestDocument.id}`);
          this.closeAdminDeleteVersionModal();
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          this.error({
            statusCode: 500,
            message: 'Something went wrong while deleting this version.',
            error: err,
          });
        })
        .finally(() => {
          this.isAwaitingAdminDeletionCall = false;
        });
    },
    async adminDeleteSop() {
      this.isAwaitingAdminDeletionCall = true;
      deleteSop(this.sop.id, this.document.location.split('/')[0])
        .then(async () => {
          this.$router.push(`/`);
          this.closeAdminDeleteSopModal();  
          this.$root.$emit('refresh');
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          this.error({
            statusCode: 500,
            message: 'Something went wrong while deleting the sop.',
            error: err,
          });
        })
        .finally(() => {
          this.isAwaitingAdminDeletionCall = false;
        });
    },
    onVersionChange(event) {
      this.$router.push(`/document/${event.id}`);
    },
    async renameOnClick() {
      this.isAwaitingRenameCall = true;
      rename(this.sop.id, this.sop, this.newName)
        .then(async () => {
          this.$root.$emit('refresh');
          this.closeRenameModal();
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          this.error({
            statusCode: 500,
            message: 'Something went wrong while renaming this SOP.',
            error: err,
          });
        })
        .finally(() => {
          this.isAwaitingRenameCall = false;
        });
    },
    removeExtension(str) {
      return str.replace(/\.[^/.]+$/, '');
    },
    selectFile() {
      this.isSelecting = true;
      window.addEventListener(
        'focus',
        () => {
          this.isSelecting = false;
        },
        { once: true }
      );
      this.$refs.updateExistingDocument.click();
    },
    rememberFileSelection(event) {
      this.selectedFile = event.target.files[0];
      const fileExtension = event.target.files[0].name.split('.').pop();
      console.log(fileExtension)
      if (fileExtension === 'docx') {
        this.fileData = new FormData();
        this.fileData.append('file', this.selectedFile);
        this.updateExistingDocument();
      } else {
        this.errorMessage = "Only .docx files can be uploaded.";
        this.showErrorModal = true;
      }
    },
    updateExistingDocument() {
      this.fileData.append('sop_id', this.document.sop_id);
      this.fileData.append('editor_id', window.localStorage.getItem('id'));
      this.fileData.append(
        'directory_name',
        this.document.location.split('/')[0]
      );

      updateExisting(this.fileData)
        .then((res) => {
          this.$router.push(`/document/${res.id}`);
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          console.log('Error updating');
          this.error({
            statusCode: 500,
            message: 'Something went wrong while saving the document',
            error: err,
          });
        });
    },
    downloadSop() {
      downloadDocument(this.document).then((downloadUrl) => {
        console.log(downloadUrl);
        const downloadElement = document.createElement('a');
        document.body.appendChild(downloadElement);
        downloadElement.href = downloadUrl;
        downloadElement.click();
      });
    },
  },
};
</script>
