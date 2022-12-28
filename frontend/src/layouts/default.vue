<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <v-navigation-drawer
      v-model="isSidebarVisible"
      :mini-variant="false"
      fixed
      app
      :width="350"
      class="d-flex flex-column justify-space-between"
    >
      <v-toolbar>
        <v-row>
          <v-col :cols="8">
            <v-text-field
              :id="search"
              v-model="search"
              hide-details
              prepend-icon="mdi-magnify"
              single-line
              clearable
              placeholder="Search title"
            ></v-text-field>
          </v-col>
          <v-col :cols="1">
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on">
                mdi-cog-outline
                </v-icon>
              </template>
              <v-list>
                <v-list-item @click="showSearchContentModal = true;">
                  Search by content
                  <v-icon>mdi-star</v-icon>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col :cols="3">
            <v-menu offset-y>
              <template #activator="{ on, attrs }">
                <v-btn small v-bind="attrs" v-on="on"> Sort </v-btn>
              </template>
              <v-list>
                <v-list-item
                  @click="
                    isSorted = false;
                    isSortedByDate = false;
                    isSortedByAlphabetical = false;
                  "
                >
                  Unsorted
                </v-list-item>
                <v-list-item @click="sortByDate(-1)">
                  Date <v-icon>mdi-arrow-up</v-icon>
                </v-list-item>
                <v-list-item @click="sortByDate(1)">
                  Date <v-icon>mdi-arrow-down</v-icon>
                </v-list-item>
                <v-list-item @click="sortByAlphabetical(-1)">
                  Alphabetical <v-icon>mdi-arrow-up</v-icon>
                </v-list-item>
                <v-list-item @click="sortByAlphabetical(1)">
                  Alphabetical <v-icon>mdi-arrow-down</v-icon>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-toolbar>
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="secondary"
          :size="70"
          :width="7"
        ></v-progress-circular>
      </div>
      <v-list v-else-if="filteredList.length && !isSorted">
        <v-list-item
          v-for="(directory, i) in filteredList"
          :key="i"
          to=""
          router
          exact
          @click="toggleExpansion(i)"
        >
          <v-list-item-content>
            <Upload
              :directory-name="directory.name"
              :dirID="directory.id"
              :is-logged-in="isLoggedIn"
              @emitOpenCreateSopModal="createSop"
              @emitDeleteDirectory="deleteDir"
              @refresh="updateDocuments"
            />
            <v-list>
              <draggable
                v-model="directory.sops"
                group="sops"
                @change="handleChanges($event, directory.sops, directory)"
              >
                <!-- the click.stop is neccesary for making sure the directory doesn't collapse when you select an SOP-->
                <v-list-item
                  v-for="(sop, j) in directory.sops"
                  v-show="isExpanded(i)"
                  :key="`${directory}-${removeExtension(sop.name)}-${j}`"
                  :to="`/document/${sop.latest_version_document_id}`"
                  router
                  exact
                  @click.stop=""
                >
                  <v-list-item-title
                    class="pl-4"
                    style="max-width: 100%; text-overflow: ellipsis"
                  >
                    <v-icon>mdi-file-document</v-icon>
                    {{ removeExtension(sop.name) }}
                  </v-list-item-title>
                </v-list-item>
              </draggable>
            </v-list>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list v-else-if="isSorted">
        <v-list-item
          v-for="(sop, j) in filteredSortedList"
          :key="`${removeExtension(sop.name)}-${j}`"
          :to="`/document/${sop.latest_version_document_id}`"
          router
          exact
        >
          <v-list-item-title
            class="pl-4"
            style="max-width: 100%; text-overflow: ellipsis"
          >
            <v-icon>mdi-file-document</v-icon> {{ removeExtension(sop.name) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <div v-else class="text-center">
        <p class="text-h5 py-16">No SOP's found</p>
      </div>
      <v-list class="flex-1 d-flex flex-column justify-space-around">
        <v-list-item class="mx-auto">
          <v-btn v-if="!isLoggedIn" @click="isLoggingIn = true">Login</v-btn>
          <div v-else class="text-center">
            <p>Logged in as {{ username }}</p>
            <v-btn @click="logout">Logout</v-btn>
          </div>
        </v-list-item>
        <v-list-item v-if="!isLoggedIn" class="mx-auto">
          <!-- Change this: This button is visible if route is "/register" or something -->
          <v-btn align-center @click="showRegModal = true">
            Register User
          </v-btn>
        </v-list-item>
        <v-list-item v-if="isLoggedIn" class="mx-auto">
          <v-btn align-center @click="showDirModal = true">
            Create Directory
          </v-btn>
        </v-list-item>
        <v-list-item v-show="isAdmin" class="mx-auto">
          <v-btn align-center @click="showPrivModal = true">Edit Users</v-btn>
        </v-list-item>
        <v-list-item class="mx-auto">
          <v-btn>
            <v-icon large @click="isSidebarVisible = false"
              >mdi-chevron-left</v-icon
            >
          </v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-btn
      v-if="!isSidebarVisible"
      fab
      fixed
      bottom
      left
      @click="isSidebarVisible = true"
    >
      <v-icon large> mdi-chevron-right </v-icon>
    </v-btn>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <login-modal
      v-if="isLoggingIn"
      @clearLoginModal="isLoggingIn = false"
      @authenticationChange="checkAuthentication"
    ></login-modal>
    <RegisterModal v-if="showRegModal" @clearRegModal="showRegModal = false" />
    <DirectoryModal
      v-if="showDirModal"
      @clearDirModal="showDirModal = false"
      @refresh="updateDocuments"
    />
    <DirectoryChangeModal
      v-if="showDirectoryChangeModal"
      @acceptChanges="acceptChanges"
      @revertChanges="revertChanges"
      @clearDirectoryChangeModal="showDirectoryChangeModal = false"
    />
    <PrivilegeModal v-if="showPrivModal" @clearPrivModal="showPrivModal = false" :email-prop="email"/>
    <CreateSopModal
      v-if="showCreateSopModal"
      :initial-form-data="formData"
      @emitCloseCreateSopModal="showCreateSopModal = false"
    />
    <SearchContentModal v-if="showSearchContentModal" @closeModal="showSearchContentModal = false" />
    <ErrorModal
      v-if="showErrorModal"
      :error-message="errorMessage"
      @emitCloseErrorModal="showErrorModal = false"
    />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import draggable from 'vuedraggable';
import LoginModal from '@/components/LoginModal.vue';
import SearchContentModal from '@/components/SearchContentModal.vue';
import RegisterModal from '@/components/RegisterModal.vue';
import DirectoryModal from '@/components/DirectoryModal.vue';
import DirectoryChangeModal from '@/components/DirectoryChangeModal.vue';
import CreateSopModal from '@/components/CreateSopModal.vue';
import Upload from '@/components/Upload.vue';
import { SOP, Directory } from '@/types';
// import { getDocuments } from '@/services/documents';
import { getSOP } from '~/services/sops';
import { changeDirectory } from '~/services/sops';
import { getSops, getDirectories } from '~/services/directories';
import PrivilegeModal from '~/components/PrivilegeModal.vue';
import { deleteDirectory } from '~/services/directories';
import ErrorModal from '~/components/ErrorModal.vue';

interface State {
  isSideBarVisible: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  username?: String;
  showRegModal: boolean;
  showDirModal: boolean;
  showDirectoryChangeModal: boolean;
  showSearchContentModal: boolean;
  showPrivModal: boolean;
  showCreateSopModal: boolean;
  showErrorModal: boolean;
  title: String;
  sops: Array<SOP>;
  directories: Array<Directory>;
}

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    LoginModal,
    RegisterModal,
    Upload,
    DirectoryModal,
    draggable,
    DirectoryChangeModal,
    PrivilegeModal,
    ErrorModal
},
  data() {
    return {
      isSidebarVisible: true,
      isLoggedIn: false,
      isAdmin: false, // TODO - change this default to false, only change after check with database
      email: '',
      showRegModal: false,
      isLoggingIn: false,
      showDirModal: false,
      showDirectoryChangeModal: false,
      showSearchContentModal: false,
      showPrivModal: false,
      showCreateSopModal: false,
      showErrorModal: false,
      errorMessage: '',
      isLoading: true,
      directories: [],
      search: '',
      directoryChanges: [],
      expandedGroup: [], // Array of indices of expanded groups
      formData: [],
      sops: [],
      isSorted: false,
      isSortedByDate: false,
      isSortedByAlphabetical: false,
    };
  },
  computed: {
    filteredList() {
      if (this.search == null || this.search == '') {
        return this.directories;
      }
      return this.directories.map((dir) => ({
        ...dir,
        sops: dir.sops.filter((sops) =>
          sops.name.toLowerCase().includes(this.search.toLowerCase())
        ),
      }));
    },
    filteredSortedList() {
      if (this.search == null || this.search == '') {
        return this.sops;
      }
      return this.sops.filter((sop) => {
        return sop.name.toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
  mounted() {
    this.updateDocuments();
    this.checkAuthentication();
    this.$root.$on('refresh', () => {
      this.updateDocuments();
    })
  },
  methods: {
    updateDocuments() {
      // TODO - loading stuff
      this.sops = [];
      this.isLoading = true;
      getDirectories()
        .then((directories) => {
          directories.forEach((directory, directoryIndex) => {
            directory.sops = [];
            this.expandedGroup.push(directoryIndex);
            getSops(directory.id)
              .then((sops) => {
                sops.forEach((sop, sopIndex) => {
                  getSOP(sop.sop_id).then((sop) => {
                    directory.sops.push(sop);
                    this.sops.push(sop);
                    this.directories = directories;
                    if (
                      directoryIndex === directories.length - 1 &&
                      sopIndex === sops.length - 1
                    ) {
                      if (this.isSortedByDate) {
                        this.sortByDate();
                      } else if (this.isSortedByAlphabetical) {
                        this.sortByAlphabetical();
                      }
                    }
                  });
                });
              })
              .catch((err) => {
                // No directories
                this.isLoading = false;
                this.directories = directories;
              })
              .finally(() => {
                this.isLoading = false;
              });
          });
        })
        .catch((err) => {
          this.errorMessage = err;
          this.showErrorModal = true;
          this.isLoading = false;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    checkAuthentication() {
      if (window.localStorage.getItem('accessToken')) {
        this.username = window.localStorage.getItem('username');
        this.email = window.localStorage.getItem('email');
        this.isAdmin = window.localStorage.getItem('isAdmin') === 'true';
        this.isLoggedIn = true
        this.isLoggingIn = false;
        window.localStorage.setItem('isLoggedIn', this.isLoggedIn);
        this.$root.$emit('authChange');
      }
    },
    logout() {
      window.localStorage.clear();
      this.isLoggedIn = false;
      this.username = '';
      this.email = '';
      this.isAdmin = ''; 
      this.$root.$emit('authChange');
    },
    handleChanges(event, list, directory) {
      this.directoryChanges.push({
        event,
        list,
        directory,
      });
      this.showDirectoryChangeModal = true;
    },

    isExpanded(i) {
      return this.expandedGroup.includes(i);
    },

    toggleExpansion(i) {
      if (this.isExpanded(i))
        this.expandedGroup.splice(this.expandedGroup.indexOf(i), 1);
      else this.expandedGroup.push(i);
    },

    acceptChanges() {
      let oldDirectory;
      let newDirectory;
      let sop_id;
      this.directoryChanges.forEach(({ event, list, directory }) => {
        event = JSON.parse(JSON.stringify(event));
        if (event.removed) oldDirectory = JSON.parse(JSON.stringify(directory));
        if (event.added) {
          newDirectory = JSON.parse(JSON.stringify(directory));
          sop_id = event.added.element.id;
        }
      });
      changeDirectory(sop_id, oldDirectory, newDirectory);

      this.directoryChanges = [];
      this.showDirectoryChangeModal = false;
    },
    revertChanges() {
      this.directoryChanges.forEach(({ event, list }) => {
        if (event.added) {
          const { newIndex } = event.added;
          list.splice(newIndex, 1);
        }

        if (event.removed) {
          const { oldIndex, element } = event.removed;
          list.splice(oldIndex, 0, element);
        }

        if (event.moved) {
          const { newIndex, oldIndex, element } = event.moved;
          list[newIndex] = list[oldIndex];
          list[oldIndex] = element;
        }
      });

      this.directoryChanges = [];
      this.showDirectoryChangeModal = false;
    },
    createSop(formData) {
      this.showCreateSopModal = true;
      this.formData = formData;
    },
    sortByDate(direction) {
      this.isSorted = true;
      this.isSortedByDate = true;
      if (direction === 1) {
        this.sops.sort((a, b) => {
          return (
            new Date(b.date_last_modified).getTime() -
            new Date(a.date_last_modified).getTime()
          );
        });
      }
      if (direction === -1) {
        this.sops.sort((a, b) => {
          return (
            new Date(a.date_last_modified).getTime() -
            new Date(b.date_last_modified).getTime()
          );
        });
      }
    },
    sortByAlphabetical(direction) {
      this.isSorted = true;
      this.isSortedByAlphabetical = true;
      if (direction === 1)
        this.sops.sort((a, b) => a.name.localeCompare(b.name));
      else this.sops.sort((a, b) => b.name.localeCompare(a.name));
    },
    async deleteDir(id) {
      if(!this.isDirectoryEmpty(id)){
        this.errorMessage = "Directory is not empty.";
        this.showErrorModal = true;
        return -1;
      }
      else{
        console.log("Empty directory");
        deleteDirectory(id)
          .then((value) => {
            if(value){
              this.updateDocuments();
            }
          })
          .catch((err) => {
            this.errorMessage = err;
            this.showErrorModal = true;
          });
      }
    },
    isDirectoryEmpty(id){
      return this.directories.find(x => x.id === id).sops.length === 0;

    },
    removeExtension(str){
      return str.replace(/\.[^/.]+$/, "");
    },
  },
});
</script>

<style>
.v-list {
  width: 100%;
}
</style>
