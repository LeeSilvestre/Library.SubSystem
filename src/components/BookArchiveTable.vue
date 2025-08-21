<template>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="displayedBooks"
      :sort-by="[{ key: 'book_id', order: 'asc' }]"
    >
    <template v-slot:top>
  <v-toolbar flat>
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
                  <v-text-field v-model="editedItem.book_title" label="Book Title" :error-messages="getErrorMessage('book_title')"></v-text-field>
                  <v-text-field v-model="editedItem.book_auth" label="Author" :error-messages="getErrorMessage('book_auth')"></v-text-field>
                  <v-select
                    v-model="editedItem.book_sub"
                    :items="categoryNames"
                    item-text="categ_name"
                    item-value="book_sub"
                    label="Category"
                    :error-messages="getErrorMessage('book_sub')"
                  ></v-select>
                  <v-text-field v-model="editedItem.book_qty" label="Quantity" :error-messages="getErrorMessage('book_qty')"></v-text-field>
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
                  Are you sure you want to add this book information?
                  <div>
                    <strong>Title:</strong> {{ editedItem.book_title }}
                  </div>
                  <div>
                    <strong>Author:</strong> {{ editedItem.book_auth }}
                  </div>
                  <div>
                    <strong>Category ID:</strong> {{ editedItem.book_sub }} 
                  </div>
                  <div>
                    <strong>Quantity:</strong> {{ editedItem.book_qty }}
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
              <v-card-title class="text-h5">Edit Book</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="saveEdit">
                  <v-text-field v-model="editedItem.book_title" label="Book Title"></v-text-field>
                  <v-text-field v-model="editedItem.book_auth" label="Author"></v-text-field>
                  <v-select
                    v-model="editedItem.book_sub"
                    :items="categoryNames"
                    item-text="categ_name"
                    item-value="book_sub"
                    label="Category"
                  ></v-select>
                  <v-text-field v-model="editedItem.book_qty" label="Quantity"></v-text-field>
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
                  Are you sure you want to update this book information?
                  <div>
                    <strong>Title:</strong> {{ editedItem.book_title }}
                  </div>
                  <div>
                    <strong>Author:</strong> {{ editedItem.book_auth }}
                  </div>
                  <div>
                    <strong>Category:</strong> {{ editedItem.category.categ_name }}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {{ editedItem.book_qty }}
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
                Are you sure you want to unarchive this book?
                <div>
                    <strong>Title:</strong> {{ editedItem.book_title }}
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
          <td>{{ item.book_title }}</td>
          <td>{{ item.book_auth }}</td>
          <td>{{ item.category.categ_name }}</td>
          <td>{{ item.book_qty }}</td>
          <td>{{ item.reason }}</td>
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
          { title: 'TITLE', key: 'book_title' },
          { title: 'AUTHOR', key: 'book_auth' },
          { title: 'CATEGORY', key: 'book_sub' },
          { title: 'QUANTITY', key: 'book_qty' },
          { title: 'ISSUE', key: 'reason' },
          { title: 'Actions', sortable: false },
        ],
        editedItem: {
          book_title: '',
          book_auth: '',
          book_sub: '',
          book_qty: '',
        },
        fieldErrors: {
          book_title: false,
          book_auth: false,
          book_qty: false,
        },
        categories: [],
      };
    },
    mounted() {
      this.fetchBooks();
      this.fetchCategories();
    },
    methods: {
        unarchiveItem(item) {
        this.editedItem = item;
        this.dialogUnarchiveConfirmation = true;
        },
        unarchiveItemConfirmed() {
            axios.put('/library/books/unarchive/' + this.editedItem.book_title)
                .then(response => {
                this.fetchBooks();
                })
                .catch(error => {
                  Swal.fire('Error', 'Failed to unarchive the book. Please try again.', 'error');
                })
                .finally(() => {
                this.closeUnarchiveConfirmation();
                });
        },
        closeUnarchiveConfirmation() {
        this.dialogUnarchiveConfirmation = false;
        },
      fetchCategories() {
        axios.get('/library/category')
          .then(response => {
            this.categories = response.data;
          })
          .catch(error => {
            Swal.fire('Error', 'Failed to fetch categories. Please try again.', 'error');
          });
      },
      fetchBooks() {
        axios.get('/library/books')
          .then(response => {
            this.books = response.data;
          })
          .catch(error => {
            Swal.fire('Error', 'Failed to fetch books. Please try again.', 'error');
          });
      },
      editItem(item) {
        this.editedItem = { ...item };
        this.editdialog = true;
      },
      manageCategories() {
        this.$router.push('/categories');
      },
      deleteItem(item) {
        // Handle deleting a book
      },
      deleteItemConfirm() {
        // Confirm deletion of a book
      },
      close() {
        this.dialog = false;
        this.clearEditedItem();
      },
      closeEdit(){
        this.editdialog = false;
      },
      closeDelete() {
        this.dialogDelete = false;
      },
      showConfirmation() {
        this.fieldErrors = {
          book_title: this.editedItem.book_title.trim() === '',
          book_auth: this.editedItem.book_auth.trim() === '',
          book_qty: this.editedItem.book_qty.trim() === '',
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
          this.editedItem.book_title.trim() !== '' &&
          this.editedItem.book_auth.trim() !== '' &&
          this.editedItem.book_qty.trim() !== ''
        );
      },
      closeConfirmation() {
        this.dialogConfirmation = false;
      },
      save() {
        this.isAddingBook = true;
        console.log("Data being added:", this.editedItem);
        axios.post('/library/books', this.editedItem)
          .then(response => {
            this.books.push(response.data);
            this.closeConfirmation();
            this.close();
            this.clearEditedItem();
            this.fetchBooks();
          })
          .catch(error => {
            Swal.fire('Error', 'Failed to add the book. Please try again.', 'error');
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
        axios.put('/library/books/' + this.editedItem.book_title, this.editedItem)
          .then(response => {
            this.closeConfirmation2();
            this.closeEdit();
            this.clearEditedItem();
            this.fetchBooks();
          })
          .catch(error => {
            console.error('Error adding book:', 'error');
          })
          .finally(() => {
            this.isEditingBook = false;
          });
      },
      clearEditedItem(){
        this.editedItem = {
          book_title: '',
          book_auth: '',
          book_sub: '',
          book_qty: '',
        };
      },
    },
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'Add Book' : 'Add Book Information';
      },
      displayedBooks() {
        const searchTerm = this.search.toLowerCase();
        return this.books.filter(book =>
            Object.values(book).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm)
            )
        ).filter(book => book.is_archived === 1);
        },
      categoryNames() {
        return this.categories.map(category => category.book_sub);
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
  