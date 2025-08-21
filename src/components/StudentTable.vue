<template>
  <v-data-table
    :search="search"
    :headers="headers"
    :items="displayedBooks"
    :sort-by="[{ key: 'book_title', order: 'asc' }]"
    header-class="custom-header"
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
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2 rounded-l" color="primary" dark v-bind="props" prepend-icon="mdi-plus">Add Book</v-btn>
          </template>
          
          <!-- Content of the dialog for adding a book -->
          <v-card class="rounded-card">
            <v-card-title class="text-h5">{{ formTitle }}</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="save">
                <v-text-field v-model="editedItem.book_code" label="Book Code" :error-messages="getErrorMessage('book_code')"></v-text-field>
                <v-text-field v-model="editedItem.book_title" label="Book Title" :error-messages="getErrorMessage('book_title')"></v-text-field>
                <v-text-field v-model="editedItem.book_auth" label="Author" :error-messages="getErrorMessage('book_auth')"></v-text-field>
                <v-select
                  v-model="editedItem.categ_name"
                  :items="categoryNames"
                  item-text="categ_name"
                  item-value="categ_name"
                  label="Category"
                  :error-messages="getErrorMessage('categ_name')"
                ></v-select>
                <v-text-field
                          v-model="editedItem.pub_date"
                          label="Publication Date"
                          :error-messages="getErrorMessage('pub_date')"
                          type="date"
                        ></v-text-field>
                <v-text-field v-model="editedItem.copyright_owner" label="Copyright Owner" :error-messages="getErrorMessage('copyright_owner')"></v-text-field>
                <v-text-field v-model="editedItem.book_qty" label="No. of Copies" :error-messages="getErrorMessage('book_qty')"></v-text-field>
                <v-text-field v-model="editedItem.damaged_fine" label="Fine if Damaged" :error-messages="getErrorMessage('damaged_fine')"></v-text-field>
                <v-text-field v-model="editedItem.lost_fine" label="Fine if Lost" :error-messages="getErrorMessage('lost_fine')"></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="button button-save" @click="showConfirmation">Add</v-btn>
              <v-btn class="button button-cancel" @click="close">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogConfirmation" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Confirmation</v-card-title>
              <v-card-text>
                Are you sure you want to add this book information?
                <div>
                  <strong>Book Code:</strong> {{ editedItem.book_code }}
                </div>
                <div>
                  <strong>Title:</strong> {{ editedItem.book_title }}
                </div>
                <div>
                  <strong>Author:</strong> {{ editedItem.book_auth }}
                </div>
                <div>
                  <strong>Category ID:</strong> {{ editedItem.categ_name }} 
                </div>
                <div>
                  <strong>Publication Date:</strong> {{ editedItem.pub_date }} 
                </div>
                <div>
                  <strong>Copyright Owner:</strong> {{ editedItem.copyright_owner }} 
                </div>
                <div>
                  <strong>No. of Copies:</strong> {{ editedItem.book_qty }}
                </div>
                <div>
                  <strong>Fine if Damaged:</strong> {{ editedItem.damaged_fine }}
                </div>
                <div>
                  <strong>Fine if Lost:</strong> {{ editedItem.lost_fine }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="save">Yes</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation">No</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        <v-dialog v-model="editdialog" max-width="1000px">
          
          <v-card>
            <v-card-title class="text-h5">Edit Book: {{ editedItem.book_title }}</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="saveEdit">
                <v-text-field v-model="editedItem.book_auth" label="Author"></v-text-field>
                <!-- <v-select
                  v-model="editedItem.categ_name"
                  :items="categoryNames"
                  item-text="categ_name"
                  item-value="categ_name"
                  label="Category"
                ></v-select> -->
                <v-text-field v-model="editedItem.pub_date" label="Publication Date"></v-text-field>
                <v-text-field v-model="editedItem.copyright_owner" label="Copyright Owner"></v-text-field>
                <v-text-field v-model="editedItem.book_qty" label="No. of Copies"></v-text-field>
                <v-text-field v-model="editedItem.damaged_fine" label="Fine if Damaged"></v-text-field>
                <v-text-field v-model="editedItem.lost_fine" label="Fine if Lost"></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="button button-save" @click="editConfirmation">Save</v-btn>
              <v-btn class="button button-cancel" @click="closeEdit">Cancel</v-btn>
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
                <!-- <div>
                  <strong>Category:</strong> {{ editedItem.categ_name }}
                </div> -->
                <div>
                  <strong>Pub. Date:</strong> {{ editedItem.pub_date }}
                </div>
                <div>
                  <strong>C/O:</strong> {{ editedItem.copyright_owner}}
                </div>
                <div>
                  <strong>No. of Copies:</strong> {{ editedItem.book_qty }}
                </div>
                <div>
                  <strong>Fine if Damaged:</strong> {{ editedItem.damaged_fine }}
                </div>
                <div>
                  <strong>Fine if Lost:</strong> {{ editedItem.lost_fine }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="saveEdit">Yes</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation2">No</v-btn>
              </v-card-actions>
            </v-card>
         </v-dialog>
        
         <v-dialog v-model="dialogArchiveConfirmation" max-width="500px">
          <v-card>
            <v-card-title class="text-h5" text-align="center">Archive Book</v-card-title>
            <v-card-text>
              <div margin-top="10px">
              </div>
              <br>
              <v-text-field v-model="editedItem.reason" label="Reason for archiving"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="button button-save" @click="archiveItemConfirmed">Archive</v-btn>
              <v-btn class="button button-cancel" @click="closeArchiveConfirmation">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <template v-slot:item="{ item }">
      <tr>
        <td>{{ item.category.book_ddc }}</td>
        <td>{{ item.book_code }}</td>
        <td>{{ item.book_title }}</td>
        <td>{{ item.book_auth }}</td>
        <td>{{ item.category.categ_name }}</td>
        <td>{{ formatDate (item.pub_date) }}</td>
        <td>{{ item.copyright_owner }}</td>
        <td>₱ {{ item.damaged_fine }}</td>
        <td>₱ {{ item.lost_fine}}</td>
        <td>{{ item.book_qty }}</td>
        <td>{{ item.borrowed }}</td>
        <td>{{ item.damaged }}</td>
        <td>{{ item.lost }}</td>
        <td>
          <v-icon class="me-2" size="small" style="color: #2F3F64" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon size="small" style="color: #B71C1C" @click="archiveItem(item)">mdi-archive</v-icon>
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
      dialogArchiveConfirmation: false,
      itemToArchive: null,
      headers: [
        { title: 'DDC', key: 'categ_name' },
        { title: 'BOOK CODE', key: 'book_code' },
        { title: 'TITLE', key: 'book_title' },
        { title: 'AUTHOR', key: 'book_auth' },
        { title: 'CATEGORY', key: 'categ_name' },
        { title: 'PUB. DATE', key: 'pub_date' },
        { title: 'COPYRIGHT OWNER', key: 'copyright_owner' },
        { title: 'DAMAGE FINE', key: 'damaged_fine' },
        { title: 'LOST FINE', key: 'lost_fine' },
        { title: 'NO. OF COPIES', key: 'book_qty' },
        { title: 'BORROWED', key: 'borrowed' },
        { title: 'DAMAGED', key: 'damaged' },
        { title: 'LOST', key: 'lost' },
        { title: 'Actions', sortable: false },
      ],
      editedItem: {
        book_title: '',
        book_auth: '',
        categ_name: '',
        book_qty: '',
        categ_name: '',
        reason: '',
        pub_date: '',
        copyright_owner: '',
        book_code: '',
        damaged_fine: '',
        lost_fine: '',
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
    formatDate(dateString) {
        const options = {
          month: 'long',  
          day: 'numeric',
          year: 'numeric'
        };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
      },
    fetchCategories() {
      axios.get('/library/category')
        .then(response => {
          this.categories = response.data;
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    },
    async fetchBooks() {
    try {
      const response = await axios.get('/library/books'); // Replace with your API endpoint
      this.books = response.data;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error fetching books',
        text: error.message,
      });
    }
  },
    editItem(item) {
      this.editedItem = { ...item };
      this.editdialog = true;
    },
    manageCategories() {
      this.$router.push('/library/categories');
    },
    archiveItem(item) {
      this.itemToArchive = item;
      this.editedItem.reason = '';  
      this.dialogArchiveConfirmation = true;
    },
    archiveItemConfirmed() {
      axios.put('/library/books/archive/' + this.itemToArchive.book_title, { reason: this.editedItem.reason })
        .then(response => {
          this.fetchBooks();
        })
        .catch(error => {
          Swal.fire('Error', 'Error archiving book! Please try again. ', 'error');
        })
        .finally(() => {
          this.itemToArchive = null;
          this.closeArchiveConfirmation();
        });
    },
    closeArchiveConfirmation() {
      this.dialogArchiveConfirmation = false;
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
      };
      if (this.isFormValid()) {
        console.log('Form validation:', this.fieldErrors);
        Swal.fire({
          title: "Are you sure you want to add this book?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          confirmButtonColor: "#2A73C5",
          closeConfirmation: true,
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('Form data:', this.editedItem);
            axios.post('/library/books', this.editedItem)
              .then(response => {
                this.books.push(response.data);
                this.closeConfirmation();
                this.close();
                this.clearEditedItem();
                this.fetchBooks();
              })
              .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                Swal.fire('Error', 'Error adding book! Please try again. ', 'error');
              })
            Swal.fire("Saved!", "", "success");
          } else {
          }
        });
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
        this.editedItem.pub_date.trim() !== '' &&
        this.editedItem.copyright_owner.trim() !== '' &&
        this.editedItem.damaged_fine.trim() !== '' &&
        this.editedItem.lost_fine.trim() !== '' &&
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
          Swal.fire('Error', 'Error adding book! Please try again. ', error);
        })
        .finally(() => {
          this.isAddingBook = false;
        });
    },
    editConfirmation(){
      Swal.fire({
        title: "Do you want to save the changes?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        confirmButtonColor: "#2A73C5",
        closeConfirmation: true,
      }).then((result) => {
        if (result.isConfirmed) {
          axios.put('/library/books/' + this.editedItem.book_title, this.editedItem)
          .then(response => {
            this.closeEdit();
            this.clearEditedItem();
            this.fetchBooks();
          })
          .catch(error => {
            Swal.fire('Error', 'Error adding book! Please try again. ', 'error');
          })
          Swal.fire("Saved!", "", "success");
        } else {
        }
      });
      //this.dialogConfirmation2 = true;
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
          Swal.fire('Error', 'Error updating book! Please try again. ', 'error');
        })
        .finally(() => {
          this.isEditingBook = false;
        });
    },
    clearEditedItem(){
      this.editedItem = {
        book_title: '',
        book_auth: '',
        categ_name : '',
        book_qty: '',
        reason: '',
        pub_date: '',
        copyright_owner: '',
        damaged_fine: '',
        lost_fine: ''
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
      ).filter(book => book.is_archived === 0);
    },
    categoryNames() {
      return this.categories.map(category => category.categ_name);
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

</style>
