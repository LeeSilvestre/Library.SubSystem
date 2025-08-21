<template>
  <div>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="filteredData"
      :sort-by="[{ key: 'return_date', order: 'desc' }]"
    >
      
    <template v-slot:top>
        <v-toolbar flat>
          <!-- Search bar with 600px width -->
          <v-text-field
            v-model="search"
            style="width: 500px;"
            class="mr-4"
            density="compact"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
          ></v-text-field>



          <v-select
            v-model="selectedSchoolYear"
            :items="schoolYears"
            label="Filter School Year"
            class="mx-2"
            density="compact"
            outlined
          ></v-select>
          <v-select
            v-model="selectedMonthly"
            :items="monthlyOptions"
            label="Filter Month"
            class="mx-2"
            density="compact"
            outlined
          ></v-select>

          
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
          <td>{{ formatDate(item.return_date) }}</td>
          <td>
              <v-chip :color="getStatusColor(item.borrow_status)" dark>{{ availableStatus[item.borrow_status] }}</v-chip>
          </td>
          <!-- <td>₱ {{ item.total_fine }}</td> -->
          <!-- <td>
            <button v-if="item.borrow_status !== 2" type="button" class="btn btn-success white-text" @click="returnConfirmation(item)" :disabled="loading">
              <span v-if="loading">Returning...</span>
              <span v-else>Return</span>
            </button>
          </td> -->
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
                <v-btn v-if="selectedItem.borrow_status === 5" class="button button-save" @click="back">Damaged Paid</v-btn>
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
        { title: 'Return Date', key: 'return_date' },
        { title: 'Return Status', key: 'borrow_status' },
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
      selectedSchoolYear: 'All',
      selectedMonthly: 'All',
      schoolYears: ['All'],
      monthlyOptions: [
        'All',
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      selectedColumns: ['id', 'faculty_name', 'book_title', 'access_no', 'borrowed_date', 'return_date', 'schoolYear', 'month', 'borrow_status'],
    };
  },
  mounted() {
    this.fetchData();
    this.fetchItems();
  },
  computed: {
    filteredData() {
      return this.data
        .map(item => {
          const date = new Date(item.borrowed_date);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const schoolYear = (month > 6 || (month === 6 && day >= 29)) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
          return {
            ...item,
            schoolYear,
            month: date.toLocaleString('default', { month: 'long' })
          };
        })
        .filter(item => (
          (this.selectedSchoolYear === 'All' || item.schoolYear === this.selectedSchoolYear) &&
          (this.selectedMonthly === 'All' || item.month === this.selectedMonthly) &&
          (this.search === '' ||
            Object.values(item).some(value =>
              value.toString().toLowerCase().includes(this.search.toLowerCase())
            )) &&
          [2, 3, 4].includes(item.borrow_status)
        ));
    },
    bookTitles() {
      return this.titles.map(item => item.book_title);
    },
    formTitle() {
      return this.editedItem.borrow_id ? 'Add Record' : 'New Borrow Record';
    },
    getFilteredDataWithColumns() {
      const filteredData = this.filteredData;
      if (!Array.isArray(this.selectedColumns)) {
        console.error('selectedColumns is not an array or is undefined');
        return [];
      }
      return filteredData.map(item => {
        const selectedData = {};
        this.selectedColumns.forEach(col => {
          selectedData[col] = item[col];
        });
        return selectedData;
      });
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    getFilteredData() {
      return this.getFilteredDataWithColumns;
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
          console.log(response.data);
        })
        .catch(error => {
          console.error('Error fetching book titles:', error);
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
    async fetchData() {
      try {
        const borrowStatusResponse = await axios.get('/library/faculty/borrows');
        const borrowStatusData = borrowStatusResponse.data;

        const facultyIds = borrowStatusData.map(item => item.id);
        const facultyResponse = await axios.get('/faculty', { params: { ids: facultyIds } });
        const faculties = facultyResponse.data.faculty || []; // Add a default empty array

        const bookIds = borrowStatusData.map(item => item.book_title);
        const bookResponse = await axios.get('/library/books', { params: { ids: bookIds } });
        const books = bookResponse.data || []; // Add a default empty array

        this.data = borrowStatusData.map(statusItem => {
          const faculty = faculties.find(faculty => faculty.id === statusItem.id);
          const book = books.find(book => book.book_title === statusItem.book_title);
          let middleInitial = '';
          if (faculty && faculty.mname) {
            middleInitial = faculty.mname.charAt(0) + '.';
          }
          return {
            ...statusItem,
            faculty_name: faculty ? `${faculty.fname} ${faculty.lname}` : 'Unknown Faculty',
            book_title: book ? book.book_title : '',
            schoolYear: (new Date(statusItem.borrowed_date).getMonth() > 6 || (new Date(statusItem.borrowed_date).getMonth() === 6 && new Date(statusItem.borrowed_date).getDate() >= 29)) ? `${new Date(statusItem.borrowed_date).getFullYear()}-${new Date(statusItem.borrowed_date).getFullYear() + 1}` : `${new Date(statusItem.borrowed_date).getFullYear() - 1}-${new Date(statusItem.borrowed_date).getFullYear()}`,
            month: new Date(statusItem.borrowed_date).toLocaleString('default', { month: 'long' })
          };
        });

        const schoolYears = [...new Set(this.data.map(item => item.schoolYear))].sort((a, b) => b.split('-')[0] - a.split('-')[0]);
        this.schoolYears = ['All', ...schoolYears];

      } catch (error) {
        console.error('Error fetching data:', error);
        this.data = []; // Ensure `this.data` is an array to avoid further issues
      }
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
    returnConfirmation(item) {
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
          Swal.fire('Error', 'Error updating borrow status! Please try again.', 'error');
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
          Swal.fire('Error', 'Error updating borrow status! Please try again.', 'error');
          this.loading = false;
        });
    },
    deleteItem() {
      axios.delete(`/library/faculty/borrows/${this.selectedItem.borrow_id}`)
        .then(() => {
          Swal.fire('Success', 'Item deleted successfully!', 'success');
          this.fetchData();
        })
        .catch(error => {
          Swal.fire('Error', 'Error deleting item! Please try again.', 'error');
        })
        .finally(() => {
          this.dialogDelete = false;
        });
    },
    selectBookTitle() {
      const selectedBook = this.titles.find(item => item.book_title === this.editedItem.book_title);
      if (selectedBook) {
        this.editedItem.access_no = selectedBook.access_no;
      }
    },
    addItem() {
      axios.post('/library/faculty/borrows', this.editedItem)
        .then(() => {
          Swal.fire('Success', 'Item added successfully!', 'success');
          this.fetchData();
        })
        .catch(error => {
          Swal.fire('Error', 'Error adding item! Please try again.', 'error');
        })
        .finally(() => {
          this.dialog = false;
        });
    },
    updateItem() {
      axios.put(`/library/faculty/borrows/${this.editedItem.borrow_id}`, this.editedItem)
        .then(() => {
          Swal.fire('Success', 'Item updated successfully!', 'success');
          this.fetchData();
        })
        .catch(error => {
          Swal.fire('Error', 'Error updating item! Please try again.', 'error');
        })
        .finally(() => {
          this.dialog = false;
        });
    },
    editItem(item) {
      this.editedItem = { ...item };
      this.dialog = true;
    },
    deleteItemPrompt(item) {
      this.selectedItem = item;
      this.dialogDelete = true;
    },
    closeDeleteDialog() {
      this.dialogDelete = false;
    },
    resetForm() {
      this.editedItem = {
        book_title: '',
        id: '',
        access_no: '',
        faculty_name: '',
        return_duedate: '',
      };
      this.fieldErrors = {
        book_title: false,
        id: false,
        access_no: false,
        return_duedate: false,
      };
    },
    clearFilters() {
      this.search = '';
      this.selectedSchoolYear = 'All';
      this.selectedMonthly = 'All';
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
  