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
            class="search-bar-width mr-4"
            density="compact"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            flat
            hide-details
            single-line
          ></v-text-field>


          </v-toolbar>
        </template>
  
        
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.student_name }}</td>
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
                <span v-if="loading">Updating...</span>
                <span v-else>Update</span>
              </button>
            </td>
          </tr>
          <v-dialog v-model="dialogConfirmation2" max-width="500px">
              <v-card>
                <v-card-title class="text-h5">Confirmation</v-card-title>
                <v-card-text>
                  Are you sure you want to update borrow status to returned?
                  <div>
                    <strong>Student Names:</strong> {{ editedItem.student_name }}
                  </div>
                  <div>
                    <strong>Student LRN:</strong> {{ editedItem.student_lrn }}
                  </div>
                  <div>
                    <strong>Book Title:</strong> {{ editedItem.book_title }}
                  </div>
                  <div>
                    <strong>Book Code:</strong> {{ editedItem.access_no }}
                  </div>
                  <div>
                    <strong>Borrow Status:</strong> {{ editedItem.borrow_status }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn v-if="editedItem.borrow_status === 5" class="button button-save" @click="backback">Damage Paid</v-btn>
                  <v-btn v-if="editedItem.borrow_status === 6" class="button button-save" @click="backbackback">Lost Paid</v-btn>
                  <v-btn v-if="editedItem.borrow_status === 7" class="button button-save" @click="back">Overdue Paid</v-btn>
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
        search: '',
        selectedBorrowId: null,
        headers: [

            { title: 'Student Name', key: 'student_name' },
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
            student_id: '',
            access_no: '',
            student_name: '',
            borrow_status: ''
        },
        selected: [],
      };
    },
    mounted() {
      this.fetchData();
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
        return this.data.filter(item => item.borrow_status == 5 || item.borrow_status == 6 || item.borrow_status == 7);
      },
      formTitle() {
        return this.editedItem.borrow_id ? 'Add Record' : 'New Borrow Record';
      },
    },
    created() {
      this.fetchData();
    },
    methods: {
      formatDate2(dateString) {
        const options = {
          month: 'long',  
          day: 'numeric',
          year: 'numeric'
        };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
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
},
      showConfirmation() {
        this.dialogConfirmation = true;
      },
      closeConfirmation() {
        this.dialogConfirmation = false;
      },
      returnConfirmation(item) {
        this.dialogConfirmation2 = true;
        this.editedItem = { ...item };
      },
      closeConfirmation2() {
        this.dialogConfirmation2 = false;
      },
      back() {
        axios.put('/library/borrowstatus/' + this.editedItem.borrow_id)
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
        axios.put('/library/borrowstatus/damaged/' + this.editedItem.borrow_id)
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
        axios.put('/library/borrowstatus/lost/' + this.editedItem.borrow_id)
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
            borrow_Status: ''
        };
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
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
  .red-text {
  color: red;
  }
  .white-text {
    color: white;
  }
    .v-data-table {
       height: 100%;
    }
  </style>
    