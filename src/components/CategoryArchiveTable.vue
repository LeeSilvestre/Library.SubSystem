<template>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="displayedBooks"
      :sort-by="[{ key: 'book_id', order: 'asc' }]"
    >
    <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title class="text-h6 font-weight-black" style="color: #2F3F64"></v-toolbar-title>
          <v-text-field
            v-model="search"
            class="w-auto mr-4"
            density="compact"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
          ></v-text-field>
  
          <v-dialog v-model="dialog" max-width="1000px">
            
            <!-- Content of the dialog for adding a book -->
            <v-card>
              <v-card-title class="text-h5">{{ formTitle }}</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="save">
                  <v-text-field v-model="editedItem.categ_name" label="Category Name" :error-messages="getErrorMessage('categ_name')"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" @click="showConfirmation">Add</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
  
          <v-dialog v-model="dialogConfirmation" max-width="500px">
              <v-card>
                <v-card-title class="text-h5">Confirmation</v-card-title>
                <v-card-text>
                  Are you sure you want to add this book category?
                  <div>
                    <strong>Category Name:</strong> {{ editedItem.categ_name }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" @click="save">Yes</v-btn>
                  <v-btn color="blue darken-1" @click="closeConfirmation">No</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
  
          <v-dialog v-model="editdialog" max-width="1000px">
            
            <v-card>
              <v-card-title class="text-h5">Edit Category</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="saveEdit">
                  <v-text-field v-model="editedItem.categ_name" label="Category Name"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeEdit">Cancel</v-btn>
                <v-btn color="blue darken-1" @click="editConfirmation">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
  
          <v-dialog v-model="dialogConfirmation2" max-width="500px">
              <v-card>
                <v-card-title class="text-h5">Confirmation</v-card-title>
                <v-card-text>
                  Are you sure you want to update this book category?
                  <div>
                    <strong>Category Name:</strong> {{ editedItem.categ_name }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" @click="saveEdit">Yes</v-btn>
                  <v-btn color="blue darken-1" @click="closeConfirmation2">No</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="dialogUnarchiveConfirmation" max-width="500px">
            <v-card>
                <v-card-title class="text-h5">Confirmation</v-card-title>
                <v-card-text>
                Are you sure you want to unarchive this category?
                <div>
                    <strong>Title:</strong> {{ editedItem.categ_name }}
                </div>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="unarchiveItemConfirmed">Yes</v-btn>
                <v-btn class="button button-cancel" @click="closeUnarchiveConfirmation">No</v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>
          
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
  
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.categ_name }}</td>
          <td>{{ item.book_ddc }}</td>
          <td>₱ {{ item.lost_fine }}</td>
          <td>₱ {{ item.damaged_fine }}</td>
          <td>
            <button type="button" class="btn btn-success white-text" @click="unarchiveItem(item)">
              Unarchive
            </button>
          </td>
        </tr>
      </template>
    </v-data-table>
  </template>
  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        books: [],
        search: '',
        dialog: false,
        editdialog: false,
        dialogDelete: false,
        dialogConfirmation: false, 
        dialogConfirmation2: false, 
        isAddingBook: false,
        isEditingBook: false,
        dialogUnarchiveConfirmation: false,
        headers: [
          { title: 'NAME', key: 'categ_name' },
          { title: 'DDC', key: 'book_ddc' },
          { title: 'LOST FINE', key: 'lost_fine' },
          { title: 'DAMAGE FINE', key: 'damaged_fine' },
          { title: 'Actions', sortable: false },
        ],
        editedItem: {
          categ_name: '',
          book_ddc: '',
          lost_fine: '',
          amaged_fine: '',
        },
        fieldErrors: {
            categ_name: false,
        },
      };
    },
    mounted() {
      this.fetchBooks();
    },
    methods: {
        unarchiveItem(item) {
        this.editedItem = item;
        this.dialogUnarchiveConfirmation = true;
        },
        unarchiveItemConfirmed() {
            axios.put('/library/category/unarchive/' + this.editedItem.categ_name)
                .then(response => {
                this.fetchBooks();
                })
                .catch(error => {
                  Swal.fire('Error', 'Error archiving category: ' + error.message, 'error');
                })
                .finally(() => {
                this.closeUnarchiveConfirmation();
                });
        },
        closeUnarchiveConfirmation() {
        this.dialogUnarchiveConfirmation = false;
        },
      fetchBooks() {
        axios.get('/library/category')
          .then(response => {
            this.books = response.data;
          })
          .catch(error => {
            Swal.fire('Error', 'Error fetching categories: ' + error.message, 'error');
          });
      },
      editItem(item) {
        this.editedItem = { ...item };
        this.editdialog = true;
      },
      returnToInventory() {
        this.$router.push('/bookinventory');
      },
      deleteItem(item) {
        // Handle deleting a book
      },
      deleteItemConfirm() {
        // Confirm deletion of a book
      },
      close() {
        // Close the dialog for adding/editing a book
        this.dialog = false;
        this.clearEditedItem();
      },
      closeEdit(){
        this.editdialog = false;
      },
      closeDelete() {
        // Close the deletion confirmation dialog
        this.dialogDelete = false;
      },
      showConfirmation() {
        this.fieldErrors = {
            categ_name: this.editedItem.categ_name.trim() === '',
        };
        if (this.isFormValid()) {
            this.dialogConfirmation = true;
        }
        },
        getErrorMessage(field) {
        if (this.fieldErrors[field]) {
            return 'This field is required';
        }
        return '';
    },
    isFormValid() {
      return (
        this.editedItem.categ_name.trim() !== ''
      );
    },
      closeConfirmation() {
        this.dialogConfirmation = false;
      },
      save() {
        this.isAddingBook = true;
        axios.post('/library/category', this.editedItem)
          .then(response => {
            this.books.push(response.data);
            this.closeConfirmation();
            this.close();
            this.clearEditedItem();
            this.fetchBooks();
          })
          .catch(error => {
            Swal.fire('Error', 'Error adding category: ' + error.message, 'error');
          })
          .finally(() => {
            this.isAddingBook = false;
          });
      },
      editConfirmation(){
        this.dialogConfirmation2 = true;
      },
      closeConfirmation2(){
        this.dialogConfirmation2 = false;
      },
      saveEdit(){
        this.isEditingBook = true;
        axios.put('/library/category/' + this.editedItem.book_sub, this.editedItem)
          .then(response => {
            this.closeConfirmation2();
            this.closeEdit();
            this.clearEditedItem();
            this.fetchBooks();
          })
          .catch(error => {
            console.error('Error adding book:', error);
          })
          .finally(() => {
            this.isEditingBook = false;
          });
      },
      clearEditedItem(){
        this.editedItem = {
          categ_name: '',
          lost_fine: '',
          damaged_fine: '',
        };
      },
    },
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'Add Category' : 'Add Book Category';
      },
      displayedBooks() {
        const searchTerm = this.search.toLowerCase();
        return this.books.filter(book =>
          Object.values(book).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm)
          )
        ).filter(book => book.is_archived == 1);
      },
    },
    watch: {
      dialog(val) {
        val || this.close();
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
    },
  };
  </script>
  
  <style lang="scss">
  .v-card-title {
  font-family: 'Roboto', sans-serif;
  font-size: 30px !important; /* Force the font size */
  font-weight: 450;
  color: white;
  background-color: var(--dark);
  padding: 16px;
  text-align: center;
  letter-spacing: 8px !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

.rounded-card {
  border-radius: 8px; /* Ensure the modal itself has rounded corners */
  max-width: 1000px; /* Increase the max-width for the modal */
  width: 100%; /* Ensure the modal takes full width up to the max-width */
  overflow-y: auto; /* Enable vertical scrolling */
  margin: auto; /* Center the modal horizontally */
}
.swal2-container{
  z-index: 300000 !important;
}
.v-data-table {
  height: 100%;
}
.v-dialog__content--active {
  display: flex;
  align-items: center;
  justify-content: center;
}
.privacy-content {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--dark);
}

.privacy-content h3 {
  color: var(--dark);
  font-size: 18px;
  font-weight: 700;
}

.privacy-content p {
  margin: 8px 0;
}

.privacy-content ul {
  padding-left: 20px;
}

.privacy-content ul li {
  margin: 4px 0;
}

.rounded-card::-webkit-scrollbar {
  width: 0;
}

.rounded-card {
  scrollbar-width: none;
}

.rounded-card {
  scroll-behavior: smooth;
}

.v-dialog--active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.button {
  padding: 10px 20px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.button-save {
  background-color: #4CAF50;
  color: white;
}

.button-cancel {
  background-color: #f44336;
  color: white;
}

.button-confirm {
  background-color: #2196F3;
  color: white;
}

.button:hover {
  opacity: 0.9;
}

.button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
  .white-text {
  color: white;
}
  .v-data-table {
    height: 100%;
  }
  </style>
  