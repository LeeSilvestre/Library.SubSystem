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
            <template v-slot:activator="{ props }">
              <v-btn class="mb-2 rounded-l" color="primary" dark v-bind="props" prepend-icon="mdi-plus">Add Record</v-btn>
            </template>

            <v-card>
              <v-card-title class="text-h5">{{ formTitle }}</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="save">
                  <!--<v-text-field v-model="editedItem.book_title" label="Book Title" :error-messages="getErrorMessage('book_title')"></v-text-field>-->
                  <v-select
                    v-model="selectedCategory"
                    :items="categNames"
                    item-text="categ_name"
                    item-value="categ_name"
                    label="Category"
                    class="mr-4"
                  ></v-select>
                  <v-select
                    v-model="editedItem.book_title"
                    :items="filteredBookTitles"
                    item-text="book_title"
                    item-value="book_title"
                    label="Book Title"
                    :error-messages="getErrorMessage('book_title')"
                  ></v-select>
                  <!-- <v-text-field v-model="editedItem.book_code" label="Book Code" :error-messages="getErrorMessage('book_code')"></v-text-field> -->
                  <v-text-field v-model="editedItem.student_id" label="Student ID" :error-messages="getErrorMessage('student_id')"></v-text-field>
                  <v-text-field v-model="editedItem.access_no" label="Accession No." :error-messages="getErrorMessage('access_no')"></v-text-field>
                  <v-text-field v-model="editedItem.return_duedate" type="date" label="Return Due Date" :error-messages="getErrorMessage('return_duedate')" :min="todayDate"></v-text-field>
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
                  <strong>Book TItle:</strong> {{ editedItem.book_title }}
                </div>
                <div>
                  <strong>Student ID:</strong> {{ editedItem.student_id }}
                </div>
                <div>
                  <strong>Accession No.:</strong> {{ editedItem.access_no }}
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

      <!-- <v-autocomplete
              v-model="editedItem.book_code"
              :items="bookList.map(book => book.book_code)"
              item-text="book_code"
              label="Book Code"
              :search-input.sync="search"
              autocomplete="off"  
              :error-messages="getErrorMessage('book_code')"
              @input="fetchBookInfo"
            ></v-autocomplete>
            
          Display Book Information
            <v-card v-if="selectedBook" class="book-info-card mb-4">
              <v-card-title  style="padding: 0;">Book Information</v-card-title>
              <v-card-text>
                <div class="book-info-item">
                  <strong>Title:</strong> {{ selectedBook.title }}
                </div>
                <div class="book-info-item">
                  <strong>Author:</strong> {{ selectedBook.author }}
                </div>
                <div class="book-info-item">
                  <strong>Publisher:</strong> {{ selectedBook.publisher }}
                </div>
              </v-card-text>
            </v-card>

            Autocomplete for Student ID 
            <v-autocomplete
              v-model="editedItem.student_id"
              :items="studentList.map(student => student.student_id)"
              item-text="student_id"
              label="Student ID"
              :search-input.sync="search"
              autocomplete="off"
              :error-messages="getErrorMessage('student_id')"
              @input="fetchStudentInfo"
            ></v-autocomplete>
            
           Display Student Information 
            <v-card v-if="selectedStudent" class="student-info-card mb-4">
              <v-card-title style="padding: 0;">Student Information</v-card-title>
              <v-card-text>
                <div class="student-info-item">
                  <strong>Name:</strong> {{ selectedStudent.name }}
                </div>
                <div class="student-info-item">
                  <strong>LRN:</strong> {{ selectedStudent.lrn }}
                </div>
                <div class="student-info-item">
                  <strong>Email:</strong> {{ selectedStudent.email }}
                </div>
              </v-card-text>
            </v-card> -->

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.student_name }}</td>
          <td>{{ item.book_title }}</td>
          <td>{{ item.access_no }}</td>
          <td>{{ formatDate2(item.borrowed_date) }}</td>
          <td>{{ formatDate(item.return_duedate) }}</td>
          <td class="v-chip">
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
                Update Student's Borrow Status
                <div>
                  <strong>Student Name:</strong> {{ selectedItem.student_name }}
                </div>
                <div>
                  <strong>Student LRN:</strong> {{ selectedItem.student_lrn }}
                </div>
                <div>
                  <strong>Book Title:</strong> {{ selectedItem.book_title }}
                </div>
                <div>
                  <strong>Accession No.:</strong> {{ selectedItem.access_no }}
                </div>
              </v-card-text>
              <v-card-actions> 
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="back">Return</v-btn>
                <v-btn class="button button-cancel" @click="backback">Damaged</v-btn>
                <v-btn class="button button-cancel" @click="backbackback">Lost</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation2">Cancel</v-btn>
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
      todayDate: this.getTodayDate(),
      search: '',
      selectedItem: null,
      selectedStudent: null,
      headers: [
          { title: 'Student Name', key: 'student_name' },
          { title: 'Book Title', key: 'book_title' },
          { title: 'Accession No.', key: 'access_no' },
          { title: 'Borrow Date', key: 'borrowed_date' },
          { title: 'Return Due Date', key: 'return_duedate' },
          { title: 'Status', key: 'borrow_status' },
          { title: 'Action', sortable: false },
      ],
      loading: false,
      dialog: false,
      dialogDelete: false,
      dialogConfirmation: false, 
      dialogConfirmation2: false, 
      editedItem: {
          student_id: '',
          access_no: '',
          student_name: '',
          student_lrn: '',
          book_title: '',
          access_no: '',
          book_code: '',
          return_duedate: ''
      },
      bookList: [
      ],
      selectedBook: null,
      studentList: [
      ],
      selected: [],
      fieldErrors: {
        book_title: false,
        student_id: false,
        access_no: false,
      },
      titles: [],
      selectedCategory: null,
      categories: [],
      category: [],
    };
  },
  watch: {
    'editedItem.student_id': function(newId) {
      this.fetchStudentInfo(newId);
    },
    'editedItem.book_code': function(newCode) {
      this.fetchBookInfo(newCode);
    }
  },
  mounted() {
    this.fetchData();
    this.fetchItems();
    this.fetchCategories();
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
      return this.data.filter(item => item.borrow_status == 0);
    },
    filteredData() {
      return this.displayedData.filter(item => {
        if (!this.selectedCategory) return true;
        return item.book_category === this.selectedCategory;
      });
    },
    filteredBookTitles() {
      if (!this.selectedCategory) {
        return [];
      }

      const filteredTitles = this.titles
        .filter(title => title.categ_name === this.selectedCategory && title.is_archived === 0)
        .map(title => title.book_title);

      console.log('Filtered Book Titles:', filteredTitles); 
      return filteredTitles;
    },
    categNames() {
      return this.categories
        .filter(category => category.is_archived === 0)
        .map(category => category.categ_name);
    },
    formTitle() {
      return this.editedItem.borrow_id ? 'Add Record' : 'New Borrow Record';
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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
    fetchItems() {
      axios.get('/library/books')
        .then(response => {
          this.titles = response.data;
          console.log('Book Titles:', this.titles);
        })
        .catch(error => {
          console.error('Error fetching book titles:', error);
        });
    },
    fetchCategories() {
      axios.get('/library/category')  
        .then(response => {
          this.categories = response.data;
          console.log('Categories:', this.categories);
          this.categNames = this.categories.map(category => category.categ_name);
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
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
     axios.get('/library/borrowstatus')
    .then((response) => {
      const borrowStatusData = response.data;

      const studentIds = borrowStatusData.map(item => item.student_id);
      axios.get('/student', { params: { ids: studentIds } })
        .then((studentResponse) => {
          if (!studentResponse.data.student) {
            throw new Error('Students data is undefined or has unexpected structure.');
          }
          const students = studentResponse.data.student;

          const bookIds = borrowStatusData.map(item => item.book_title);
          axios.get('/library/books', { params: { ids: bookIds } })
            .then((bookResponse) => {
              const books = bookResponse.data;

              this.data = borrowStatusData.map(statusItem => {
                const student = students.find(student => student.student_id === statusItem.student_id);
                const book = books.find(book => book.book_title === statusItem.book_title);
                let middleInitial = '';
                if (student && student.middle_name) {
                  middleInitial = student.middle_name.charAt(0) + '.';
                }
                return {
                  ...statusItem,
                  student_name: student ? `${student.first_name} ${middleInitial} ${student.last_name}${student.extension ? ' ' + student.extension : ''}` : '',
                  student_lrn: student ? student.student_lrn : '',
                  book_title: book ? book.book_title : '',
                };
              });
              this.$forceUpdate();
            })
            .catch((bookError) => {
              console.error('Error fetching book data:', bookError);
            });
        })
        .catch((studentError) => {
          console.error('Error fetching student data:', studentError);
        });
    })
    .catch((error) => {
      console.error('Error fetching borrow status data:', error);
    });
    console.log(this.titles);
    console.log(this.categories);
    console.log(this.data);
    },

fetchStudentInfo(studentId) {
      // Find the selected student by ID
      if (studentId) {
        this.selectedStudent = this.studentList.find(student => student.student_id === studentId);
      } else {
        this.selectedStudent = null; // Clear the information if no ID is selected
      }
    },

    fetchBookInfo(bookCode) {
      // Find the selected book by code
      if (bookCode) {
        this.selectedBook = this.bookList.find(book => book.book_code === bookCode);
      } else {
        this.selectedBook = null; // Clear the information if no code is selected
      }
    },
    
    showConfirmation() {
      this.fieldErrors = {
        book_title: this.editedItem.book_title.trim() === '',
        student_id: this.editedItem.student_id.trim() === '',
        access_no: this.editedItem.access_no.trim() === '',
        categ_name: this.editedItem.access_no.trim() === '',
        return_duedate: this.editedItem.access_no.trim() === '',
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
        this.editedItem.student_id.trim() !== '' &&
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
      axios.put('/library/borrowstatus/' + this.selectedItem.borrow_id)
      .then(() => {
        this.loading = true;
        this.loading = false;
        this.closeConfirmation2();
        this.fetchData();
      })
      .catch(error => {
        Swal.fire('Error', 'Error updating status! Please try again. ', 'error');
        this.loading = false;
      });
    },
    backback() {
      axios.put('/library/borrowstatus/damagedpay/' + this.selectedItem.borrow_id)
      .then(() => {
        this.loading = true;
        this.loading = false;
        this.closeConfirmation2();
        this.fetchData();
      })
      .catch(error => {
        Swal.fire('Error', 'Error updating status! Please try again. ', 'error');
        this.loading = false;
      });
    },
    backbackback() {
      axios.put('/library/borrowstatus/lostpay/' + this.selectedItem.borrow_id)
      .then(() => {
        this.loading = true;
        this.loading = false;
        this.closeConfirmation2();
        this.fetchData();
      })
      .catch(error => {
        Swal.fire('Error', 'Error updating status! Please try again. ', 'error');
        this.loading = false;
      });
    },
    save() {
      axios.post('/library/borrowstatus', this.editedItem)
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
          student_name: '',
          student_lrn: '',
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
          student_name: '',
          student_lrn: '',
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

.book-info-card, .student-info-card {
  margin-bottom: 16px;
}

.book-info-item, .student-info-item {
  margin-top: 9px; 
}
.v-chip{
  margin-left: -4%;
}

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
