<template>
  <main>
    <div class="left-container">
      <div class="top-left">
        <div class="total-student">
          <h1 class="info-text">
            <span class="material-icons">feed</span>
            BOOKS
          </h1>
          <h2>Total: {{ totalBooks }}</h2>
          <v-data-table
            :search="search"
            :headers="headers"
            :items="displayedBooks"
            :items-per-page="10"
            :sort-by="[{ key: 'book_title', order: 'asc' }]"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.book_title }}</td>
                <td>{{ item.book_auth }}</td>
                <td>{{ item.category.categ_name }}</td>
                <td>{{ item.book_qty }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
    <div class="right-container">
      <div class="top-left">
        <div class="total-student">
          <h1 class="info-text">
            <span class="material-icons">pending</span>
           BORROWED BOOKS
          </h1>
          <h2 >Total: {{ totalPendingBooks }}</h2>
       
          <v-data-table
            :search="search"
            :headers="headers2"
            :items="displayedStudentData"
            :items-per-page="5"
            :sort-by="[{ key: 'borrow_id', order: 'desc' }]"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.student_name }}</td>
                <td>{{ item.book_title }}</td>
                <td>{{ formatDate2(item.return_duedate) }}</td>
                <td :class="{'red-text': item.borrow_status === 1, 'green-text': item.borrow_status === 0}">{{ availableStatus[item.borrow_status] }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </div>
      <div class="top-left">
        <div class="total-student">
          <h1 class="info-text">
            <span class="material-icons">history_edu</span>
            FACULTY BORROWED BOOKS
          </h1>
          <h2>Total: {{ totalFacultyPendingBooks }}</h2>

          <v-data-table
            :search="search"
            :headers="headers3"
            :items="displayedFacultyData"
            :items-per-page="5"
            :sort-by="[{ key: 'borrow_id', order: 'desc' }]"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.faculty_name }}</td>
                <td>{{ item.book_title }}</td>
                <td>{{ formatDate2(item.return_duedate) }}</td>
                <td :class="{'red-text': item.borrow_status === 1, 'green-text': item.borrow_status === 0}">{{ availableStatus[item.borrow_status] }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      availableStatus: ["Pending", "Overdue", "Returned"],
      studentData: [],
      facultyData: [],
      data: [],
      search: '',
      dialog: false,
      editedItem: {
        book_title: '',
        book_author: '',
        book_subject: '',
        book_item: '',
        student_id: '',
        access_no: '',
      },
      headers3: [
        { title: 'Faculty Name', key: 'faculty_name' },
        { title: 'Book Title', key: 'book_title' },
        { title: 'Due Date', key: 'return_duedate' },
        { title: 'Status', key: 'borrow_status' },
      ],
      headers2: [
          { title: 'Student Name', key: 'student_name' },
          { title: 'Book Title', key: 'book_title' },
          { title: 'Due Date', key: 'return_duedate' },
          { title: 'Status', key: 'borrow_status' },
      ],
      headers: [
        { title: 'Title', key: 'book_title' },
        { title: 'Author', key: 'book_auth' },
        { title: 'Category', key: 'book_sub' },
        { title: 'No. of Copies', key: 'book_qty' },
      ],
      subjects: [], 
      books: [],
    };
  },
  
computed: {
  displayedBooks() {
      const searchTerm = this.search.toLowerCase();
      return this.books.filter(book =>
        Object.values(book).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        )
      ).filter(book => book.is_archived === 0);
    },
  displayedStudentData() {
      if (this.search) {
        return this.studentData.filter((item) =>
          Object.values(item).some((value) =>
            value.toLowerCase().includes(this.search.toLowerCase())
          )
        );
      }
      return this.studentData.filter(item => item.borrow_status == 0 || item.borrow_status == 1);
    },
    displayedFacultyData() {
      if (this.search) {
        return this.facultyData.filter((item) =>
          Object.values(item).some((value) =>
            value.toLowerCase().includes(this.search.toLowerCase())
          )
        );
      }
      return this.facultyData.filter(item => item.borrow_status == 0 || item.borrow_status == 1);
    },
  totalBooks() {
      return this.books.reduce((total, book) => total + book.book_qty, 0);
    },
    totalPendingBooks() {
    return this.studentData.filter(item => item.borrow_status == 0 || item.borrow_status == 1).length;
  },
  totalFacultyPendingBooks() {
    return this.facultyData.filter(item => item.borrow_status == 0 || item.borrow_status == 1).length;
  }
  
},
    mounted(){
      this.fetchBooks();
      this.fetchStudentData();
      this.fetchFacultyData();
    },
    created(){
      this.fetchStudentData();
      this.fetchFacultyData();
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
      fetchStudentData() {
        axios.get('/library/borrowstatus')
    .then((response) => {
      const borrowStatusData = response.data;

      const studentIds = borrowStatusData.map(item => item.student_id);
      axios.get('/student', { params: { ids: studentIds } })
        .then((studentResponse) => {
          if (!studentResponse.data.student) {
            throw new Error('Students data is undefined or has unexpected structure.');
          }
          this.studentData = studentResponse.data.student || [];
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

      fetchFacultyData() {
        axios.get('/library/faculty/borrows')
    .then((response) => {
      const borrowStatusData = response.data;
      console.log('Borrow Status Data:', borrowStatusData);

      const facultyIds = borrowStatusData.map(item => item.id);
      axios.get('/faculty', { params: { ids: facultyIds } })
        .then((facultyResponse) => {
          // Make sure to access the correct data key
          this.facultyData = facultyResponse.data.faculty || [];
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

      fetchBooks() {
        axios.get('/library/books')
        .then(response => {
          this.books = response.data;
        })
        .catch(error => {
          console.error('Error fetching books:', error);
        });
    },
      calculateTotals() {
        this.subjects = [];
        this.books.forEach(book => {
          const existingSubject = this.subjects.find(subject => subject.name === book.book_sub);
          if (existingSubject) {
            existingSubject.total += book.book_qty;
          } else {
            this.subjects.push({
              name: book.book_sub,
              total: book.book_qty
            });
          }
        });
      },
      close() {
        this.dialog = false;
        this.resetEditedItem();
      },
      resetEditedItem() {
        this.editedItem = {
          book_title: '',
          book_author: '',
          book_subject: '',
          book_item: '',
        };
      },
      save() {
  // Save the changes when adding/editing a book
  if (this.editedIndex === -1) {
    // Add new book
    this.books.push({ ...this.editedItem });
  } else {
    // Edit existing book
    this.books[this.editedIndex] = { ...this.editedItem };
  }
  this.close();
  // Reset the editedItem object to clear the input fields in the dialog
  this.resetEditedItem();
},
  },
};
  </script>

<style lang="scss" scoped>
.v-datatable__actions select {
  display: none !important;
}
.green-text {
  color: green;
}
.torubar {
  display: flex;
  justify-content: center;
}
.torubar > .v-input {
  width: 100%; 
}
.toolbar {
  background-color: #c0c0c0;
  display: flex;
  justify-content: center;
}
.toolbar > .v-input {
  width: 100%; 
}
.red-text {
  color: red;
}
main {
    display: flex;
}
.left-container{
    flex: 0.5;
    margin-right: 1rem;
    height: 50%;
    .top-left{
        padding: 1rem;
        background-color: #f0f0f0;
        margin-bottom: 2rem;
        color: var(--dark);
        border-radius:5px;

        .total-student{
            display: flex;
            flex-direction: column;

            .info-text{
                text-shadow: 0 0 1px;
                font-size: 25px;
                margin-bottom: 1rem;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */

                .material-icons{
                    position: relative;
                    font-size: 38px;
                    top:8px;
                }
            }
            h2{
                margin-bottom: 1rem;
                font-weight: 900;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */
            }

            h3{
                font-weight: 600;
            }
            h1{
                padding: 10px;
                font-size: 50px;
                text-shadow: 0px 1px, 1px 0px, 1px 1px;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */
             }

            .student-count{
                display: flex;

                h4{
                    font-weight: 600;
                }
            
            .jhs{
                flex: 0.8;
                padding: 0.5rem;

                .jhs-total{
                    display: flex;
                    margin: 1rem;

                    h5{
                        margin-right: 1.5rem;
                        width: 3.5rem;
                    }

                    h3{
                        text-shadow: 0 0 1px;
                    }
                }


            }

            .shs{
                padding: 0.5rem;

                .shs-total{
                    display: flex;
                    margin: 1rem;

                    h5{
                        margin-right: 1.5rem;
                        width: 3.5rem;
                    }
                    h3{
                        text-shadow: 0 0 1px;
                    }
                }
            }

            }
        }
    }
    .bottom-left{
        padding: 1.5rem;
        background-color: #f0f0f0;
        color: var(--dark);
            
        h3 {
            text-shadow: 0 0 1px;
            font-size: 20px;
        }
        .material-icons{
            position:relative;
            font-size: 35px;
            top: 10px;
        }
    }
}

.right-container{
    flex: 0.5;
    margin-left: 1rem;
    .top-left{
        padding: 1rem;
        background-color: #c0c0c0;
        margin-bottom: 2rem;
        color: var(--dark);
        border-radius:5px;

        .total-student{
            display: flex;
            flex-direction: column;

            .info-text{
                text-shadow: 0 0 1px;
                font-size: 25px;
                margin-bottom: 1rem;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */

                .material-icons{
                    position: relative;
                    font-size: 38px;
                    top:8px;
                }
            }
            h2{
                margin-bottom: 1rem;
                font-weight: 900;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */
            }

            h3{
                font-weight: 600;
            }
            h1{
                padding: 10px;
                font-size: 50px;
                text-shadow: 0px 1px, 1px 0px, 1px 1px;
                text-align: left; /* Align to the left */
                align-self: flex-start; /* Align to the left */
             }

            .student-count{
                display: flex;

                h4{
                    font-weight: 600;
                }
            
            .jhs{
                flex: 0.8;
                padding: 0.5rem;

                .jhs-total{
                    display: flex;
                    margin: 1rem;

                    h5{
                        margin-right: 1.5rem;
                        width: 3.5rem;
                    }

                    h3{
                        text-shadow: 0 0 1px;
                    }
                }


            }

            .shs{
                padding: 0.5rem;

                .shs-total{
                    display: flex;
                    margin: 1rem;

                    h5{
                        margin-right: 1.5rem;
                        width: 3.5rem;
                    }
                    h3{
                        text-shadow: 0 0 1px;
                    }
                }
            }

            }
        }
    }
    .bottom-left{
        padding: 1.5rem;
        background-color: #f0f0f0;
        color: var(--dark);
            
        h3 {
            text-shadow: 0 0 1px;
            font-size: 20px;
        }
        .material-icons{
            position:relative;
            font-size: 35px;
            top: 10px;
        }
    }
}
.enrollment-table {
    width: 100%;
    border-collapse: collapse;
}

.enrollment-table th, .enrollment-table td {
    border: 2px solid #a09e9e90;
    text-align: left;
    padding: 8px;
}

.enrollment-table th {
    background-color: #f2f2f2;
}
.grade{
    font-weight: bold;
    font-size: 17px;
}
</style>
