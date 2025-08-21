<template>
  <div>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="displayedData"
      :sort-by="[{ key: 'borrowed_date', order: 'desc' }]"
    >
      
    <template v-slot:top>
        <v-toolbar flat>
          <!-- Search bar on the left -->
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
            <v-card>
              <v-card-title class="text-h5">{{ formTitle }}</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="save">
                  <v-select
                    v-model="editedItem.book_title"
                    :items="bookTitles"
                    item-text="book_title"
                    item-value="book_title"
                    label="Book Title"
                    :error-messages="getErrorMessage('book_title')"
                  ></v-select>
                  <v-text-field v-model="editedItem.id" label="Faculty ID" :error-messages="getErrorMessage('id')"></v-text-field>
                  <v-text-field v-model="editedItem.access_no" label="Book Code" :error-messages="getErrorMessage('access_no')"></v-text-field>
                  <v-text-field v-model="editedItem.return_duedate" type="date" label="Return Due Date" :error-messages="getErrorMessage('return_duedate')"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="showConfirmation">Add Record</v-btn>
                <v-btn class="button button-cancel" @click="close">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogConfirmation" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Confirmation</v-card-title>
              <v-card-text>
                Are you sure you want to add this record?
                <div>
                  <strong>Book Title:</strong> {{ editedItem.book_title }}
                </div>
                <div>
                  <strong>Faculty ID:</strong> {{ editedItem.id }}
                </div>
                <div>
                  <strong>Book Code:</strong> {{ editedItem.access_no }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="save">Yes</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation">No</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.faculty_name }}</td>
          <td>{{ item.book_title }}</td>
          <td>{{ item.access_no }}</td>
          <td>{{ formatDate2(item.borrowed_date) }}</td>
          <td>{{ formatDate(item.return_duedate) }}</td>
          <td>₱ {{ item.total_fine }}</td>
          <td>
              <v-chip :color="getStatusColor(item.borrow_status)" dark>{{ availableStatus[item.borrow_status] }}</v-chip>
          </td>
          <td>
            <button v-if="item.borrow_status !== 2" type="button" class="btn btn-success white-text" @click="returnConfirmation(item)" :disabled="loading">
              <span v-if="loading">Returning...</span>
              <span v-else>Return</span>
            </button>
          </td>
        </tr>
        <v-dialog v-model="dialogConfirmation2" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Confirmation</v-card-title>
              <v-card-text v-if="selectedItem">
                Update Borrow Status?
                <div>
                  <strong>Faculty Name:</strong> {{ selectedItem.faculty_name }}
                </div>
                <div>
                  <strong>Book Title:</strong> {{ selectedItem.book_title }}
                </div>
                <div>
                  <strong>Book Code:</strong> {{ selectedItem.access_no }}
                </div>
              </v-card-text>
              <v-card-actions> 
                <v-spacer></v-spacer>
                <v-btn v-if="selectedItem.borrow_status === 5" class="button button-save" @click="back">Damage Paid</v-btn>
                <v-btn v-if="selectedItem.borrow_status === 6" class="button button-save" @click="backback">Lost Paid</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation2">No</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      availableStatus: ["Pending", "Overdue", "Returned", "Returned with Damage", "Lost", "Returned with Damage", "Lost", "Overdue"],
      data: [],
      search: '',
      selectedItem: null,
      headers: [
          { title: 'Faculty Name', key: 'faculty_name' },
          { title: 'Book Title', key: 'book_title' },
          { title: 'Book Code', key: 'access_no' },
          { title: 'Borrow Date', key: 'borrowed_date' },
          { title: 'Return Due Date', key: 'return_duedate' },
          { title: 'Fine', key: 'total_fine' },
          { title: 'Status', key: 'borrow_status' },
          { title: 'Action', sortable: false },
      ],
      loading: false,
      dialog: false,
      dialogDelete: false,
      dialogConfirmation: false, 
      dialogConfirmation2: false, 
      editedItem: {
          book_title: '',
          id: '',
          access_no: '',
          faculty_name: '',
          book_title: '',
          access_no: '',
          return_duedate: '',
      },
      selected: [],
      fieldErrors: {
        book_title: false,
        id: false,
        access_no: false,
        return_duedate: false,
      },
      titles: [],
    };
  },
  mounted() {
    this.fetchData();
    this.fetchItems();
  },
  computed: {
    displayedData() {
      if (this.search) {
        return this.data.filter((item) =>
          Object.values(item).some((value) =>
            value.toLowerCase().includes(this.search.toLowerCase())
          )
        );
      }
      return this.data.filter(item => item.borrow_status == 5 || item.borrow_status == 6);
    },
    bookTitles() {
      return this.titles.map(item => item.book_title);
    },
    formTitle() {
      return this.editedItem.borrow_id ? 'Add Record' : 'New Borrow Record';
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchItems() {
      axios.get('/library/books')
        .then(response => {
          this.titles = response.data;
          console.log(response.data);
        })
        .catch(error => {
          console.error('Error fetching book titles:', error);
        });
    },
    getStatusColor(status) {
          // Ensure status is within the bounds of availableStatus
          if (status < 0 || status >= this.availableStatus.length) {
            return 'blue'; // Default color for unknown status
          }

          // change the status color
          switch(status) {
            case 0:
              return 'blue';  // // Pending
            case 1:
              return 'red'; // Overdue
            case 2:
              return 'green';  // Returned
            case 3:
              return 'red'; // Damage
            case 4:
              return 'red'; // Lost
            case 5:
              return 'red'; //  // Returned with Damage
            case 6:
              return 'red'; //  // Lost Payment
            case 7:
              return 'red'; //  // Overdue Pay
            default:
              return 'grey';   // Default color for unknown status
          }
        },
    formatDate2(dateString) {
        const options = {
          month: 'long',  
          day: 'numeric',
          year: 'numeric'
        };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
      },
      formatDate(dateString) {
        const options = {
          month: 'long',  
          day: 'numeric',
          year: 'numeric'
        };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
      },
      fetchData() {
  axios.get('/library/faculty/borrows')
    .then((response) => {
      const borrowStatusData = response.data;
      console.log('Borrow Status Data:', borrowStatusData);

      const facultyIds = borrowStatusData.map(item => item.id);
      axios.get('/faculty', { params: { ids: facultyIds } })
        .then((facultyResponse) => {
          // Make sure to access the correct data key
          const faculties = facultyResponse.data.faculty; 
          console.log('Faculty Data:', faculties);

          const bookTitles = borrowStatusData.map(item => item.book_title);
          axios.get('/library/books', { params: { ids: bookTitles } })
            .then((bookResponse) => {
              const books = bookResponse.data;
              console.log('Book Data:', books);

              this.data = borrowStatusData.map(statusItem => {
                // Use .find on the correct array
                const faculty = faculties.find(faculty => faculty.id === statusItem.id) || null;
                const book = books.find(book => book.book_title === statusItem.book_title) || null;
                
                if (!faculty || !book) {
                  console.error('Undefined faculty or book:', statusItem, faculty, book);
                }

                return {
                  ...statusItem,
                  faculty_name: faculty ? `${faculty.fname} ${faculty.lname}` : 'Unknown Faculty',
                  book_title: book ? book.book_title : 'Unknown Book',
                };
              });
              this.$forceUpdate();
            })
            .catch((bookError) => {
              console.error('Error fetching book data:', bookError);
            });
        })
        .catch((facultyError) => {
          console.error('Error fetching faculty data:', facultyError);
        });
    })
    .catch((error) => {
      console.error('Error fetching borrow status data:', error);
    });
},
    showConfirmation() {
      this.fieldErrors = {
        book_title: this.editedItem.book_title.trim() === '',
        id: this.editedItem.id.trim() === '',
        access_no: this.editedItem.access_no.trim() === '',
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
        this.editedItem.id.trim() !== '' &&
        this.editedItem.access_no.trim() !== '' 
      );
    },
    closeConfirmation() {
      this.dialogConfirmation = false;
    },
    returnConfirmation(item){
      this.selectedItem = item;
      this.dialogConfirmation2 = true;
    },
    closeConfirmation2() {
      this.dialogConfirmation2 = false;
    },
    back() {
      axios.put('/library/faculty/damaged/' + this.selectedItem.borrow_id)
      .then(() => {
        this.loading = true;
        this.loading = false;
        this.closeConfirmation2();
        this.fetchData();
      })
      .catch(error => {
        Swal.fire('Error', 'Error adding book! Please try again. ', 'error');
        this.loading = false;
      });
    },
    backback() {
      axios.put('/library/faculty/lost/' + this.selectedItem.borrow_id)
      .then(() => {
        this.loading = true;
        this.loading = false;
        this.closeConfirmation2();
        this.fetchData();
      })
      .catch(error => {
        Swal.fire('Error', 'Error updating book! Please try again. ', 'error');
        this.loading = false;
      });
    },
    save() {
      axios.post('/library/faculty/borrows', this.editedItem)
      .then(() => {
        this.fetchData()
        this.closeConfirmation();
        this.close();
      })
      .catch(error => {
        Swal.fire('Error', 'Error adding record! Please try again. ', 'error');
      });
    },
    close() {
      this.dialog = false;
      this.editedItem = {
          borrow_id: '',
          faculty_name: '',
          book_title: '',
          borrow_date: '',
          return_duedate: '',
          status: '',
      };
    },
    editItem(item) {
      this.editedItem = { ...item };
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      const index = this.data.findIndex(
        (item) => item.borrow_id === this.editedItem.borrow_id
      );
      this.data.splice(index, 1);
      this.closeDelete();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.editedItem = {
          borrow_id: '',
          faculty_name: '',
          book_title: '',
          borrow_date: '',
          return_duedate: '',
          status: '',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
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
.red-text {
color: red;
}
.green-text {
  color: green;
}
.white-text {
  color: white;
}
  .v-data-table {
     height: 100%;
  }
</style>
  