<template>
  <div>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="displayedData"
      :sort-by="[{ key: 'release_date', order: 'desc' }]"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <!-- Search bar with 500px width -->
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

          <!-- Grade level filter -->
          <v-select
            v-model="selectedGradeLevel"
            :items="gradeLevels"
            label="Filter Grade Level"
            class="mx-2"
            density="compact"
            outlined
          ></v-select>

    <!-- <v-select
      v-model="selectedMonthly"
      :items="monthlyOptions"
      label="Filter Month"
      class="mx-2"
      density="compact"
      outlined
    ></v-select> -->


          <!-- Add Record Button -->
          <v-dialog v-model="dialog" max-width="1500px" persistent>
            <template v-slot:activator="{ props }">
              <v-btn class="mb-2 rounded-l" color="primary" dark v-bind="props" prepend-icon="mdi-plus">Add Record</v-btn>
            </template>

            <v-card class="rounded-card">
              <v-card-title class="text-h5">New Rental Record</v-card-title>
              <v-card-text class="privacy-content">
                <v-form @submit.prevent="save">
                  <v-container>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model="editedItem.student_id"
                          label="Student ID"
                          :error-messages="getErrorMessage('student_id')"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model="subject.date"
                          label="Date"
                          :error-messages="getErrorMessage('date')"
                          type="date"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model="editedItem.return_date"
                          label="Return Due Date"
                          :error-messages="getErrorMessage('return_date')"
                          type="date"
                          :min="todayDate"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <hr>
                    <template v-for="index in 9" :key="index">
                      <v-row>
                        <v-text-field
                            v-model="subject[`subject${index}`]"
                            label="Subject"
                            readonly
                          ></v-text-field>
                        <v-col cols="4">
                          <v-select
                            v-model="editedItem['book_title' + index]"
                            :items="getFilteredTitles(index)"
                            label="Book Title"
                            :error-messages="getErrorMessage('book_title' + index)"
                            dense
                            outlined
                          ></v-select>
                        </v-col>
                        <!-- <v-col cols="4">
                          <v-text-field
                            v-model="editedItem['book_title' + index]"
                            label="Book Title"
                            :error-messages="getErrorMessage('book_title' + index)"
                          ></v-text-field>
                        </v-col> -->
                        <v-col cols="4">
                          <v-text-field
                            v-model="editedItem['book_code' + index]"
                            label="Accession No."
                            :error-messages="getErrorMessage('book_code' + index)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </template>
                  </v-container>
                </v-form>
              </v-card-text>
              <v-card-actions class="modal-footer">
                <v-spacer></v-spacer>
                <v-btn class="button button-save" @click="showConfirmation">Add Record</v-btn>
                <v-btn class="button button-cancel" @click="close">Cancel</v-btn>
              </v-card-actions>
            </v-card>

            <!-- Confirmation Dialog -->
            <v-dialog v-model="dialogConfirmation" max-width="500px">
              <v-card>
                <v-card-title class="text-h5">Confirmation</v-card-title>
                <v-card-text>
                  Are you sure you want to add this record?
                  <div>
                    <strong>Student ID:</strong> {{ editedItem.student_id }}
                  </div>
                  <div>
                    <strong>Date:</strong> {{ subject.date }}
                  </div>
                  <div>
                    <strong>Return Date:</strong> {{ editedItem.return_date }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn class="button button-save" @click="save">Yes</v-btn>
                  <v-btn class="button button-cancel" @click="closeConfirmation">No</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-dialog>

          <!-- Confirmation Dialog 2 -->
          <v-dialog v-model="dialogConfirmation2" max-width="1500px" persistent>
            <v-card class="rounded-card">
              <v-card-title class="text-h5">Check Rental Record</v-card-title>
                <v-card-text class="privacy-content">
                <v-container>
                  <!-- <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedItem.student_id"
                        label="Student ID"
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        v-model="selectedItem.release_date"
                        label="Date"
                        readonly
                        type="date"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        v-model="selectedItem.return_date"
                        label="Return Date"
                        readonly
                        type="date"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <hr> -->
                  <template v-for="index in 9" :key="index">
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          v-model="subject[`subject${index}`]"
                          label="Subject"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="selectedItem[`book_code${index}`]"
                          label="Accession No."
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="2">
                        <v-checkbox
                          :label="'Damaged'"
                          v-model="rentalData[`book_title${index}_damaged`]"
                          :value="1"
                          :false-value="0"
                          :disabled="rentalData[`book_title${index}_lost`] === 1"
                          @change="handleCheckboxChange(index, 'damaged')"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="2">
                        <v-checkbox
                          :label="'Lost'"
                          v-model="rentalData[`book_title${index}_lost`]"
                          :value="1"
                          :false-value="0"
                          :disabled="rentalData[`book_title${index}_damaged`] === 1"
                          @change="handleCheckboxChange(index, 'lost')"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </template>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="isIssuePresent" class="button button-cancel" @click="backback">With Fine</v-btn>
                <v-btn v-else class="button button-save" @click="back">Return</v-btn>
                <v-btn class="button button-cancel" @click="closeConfirmation2">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- View Record Dialog -->
          <v-dialog v-model="dialogRecord" max-width="1500px" persistent>
            <v-card class="rounded-card">
              <v-card-title class="text-h5">View Rental Record</v-card-title>
              <v-card-text class="privacy-content">
                <v-container>
                  <!-- <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedItem.student_id"
                        label="Student ID"
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        v-model="selectedItem.release_date"
                        label="Date"
                        readonly
                        type="date"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        v-model="selectedItem.return_date"
                        label="Return Date"
                        readonly
                        type="date"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <hr> -->
                  <template v-for="index in 9" :key="index">
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          v-model="subject[`subject${index}`]"
                          label="Subject"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="selectedItem[`book_title${index}`]"
                          label="Book Title"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="selectedItem[`book_code${index}`]"
                          label="Accession No."
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </template>
                </v-container>
              </v-card-text>
              <v-card-actions class="modal-footer">
                <v-spacer></v-spacer>
                <v-btn class="button button-cancel" @click="closeRecord">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <!-- Table Rows -->
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.student_name }}</td>
          <td>{{ item.grade_level }}</td>
          <td>{{ formatDate(item.release_date) }}</td>
          <td>
            <button
              v-if="item.borrow_status !== 2"
              type="button"
              class="btn btn-success white-text"
              @click="viewRecord(item)"
              :disabled="loading"
            >
              <span v-if="loading">Returning...</span>
              <span v-else>View</span>
            </button>
          </td>
          <td>
            <button
              v-if="item.borrow_status !== 2"
              type="button"
              class="btn btn-success white-text"
              @click="returnConfirmation(item)"
              :disabled="loading"
            >
              <span v-if="loading">Returning...</span>
              <span v-else>Return</span>
            </button>
          </td>
        </tr>
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
      availableStatus: ["Pending", "Overdue", "Returned", "Returned With Damage"],
      currentDate: new Date().toISOString().split('T')[0],
      todayDate: this.getTodayDate(),
      search: '',
      selectedGradeLevel: null,
      data: [], // Your data here
      headers: [
        { title: 'Student Name', key: 'student_name' },
        { title: 'Grade Level', key: 'grade_level' },
        { title: 'Release Date', key: 'release_date' },
        { title: 'Rental Record', sortable: false },
        { title: 'Action', sortable: false },
      ],
      gradeLevels: ['7', '8', '9', '10'],
      
      selectedItem: {
        student_id: '',
        release_date: '',
        return_date: '',
        book_title1: '',
        book_title2: '',
        book_title3: '',
        book_title4: '',
        book_title5: '',
        book_title6: '',
        book_title7: '',
        book_title8: '',
        book_title9: '',
        book_code1: '',
        book_code2: '',
        book_code3: '',
        book_code4: '',
        book_code5: '',
        book_code6: '',
        book_code7: '',
        book_code8: '',
        book_code9: '',
        book_title1_damaged: 0,
        book_title1_lost: 0,
        book_title2_damaged: 0,
        book_title2_lost: 0,
        book_title3_damaged: 0,
        book_title3_lost: 0,
        book_title4_damaged: 0,
        book_title4_lost: 0,
        book_title5_damaged: 0,
        book_title5_lost: 0,
        book_title6_damaged: 0,
        book_title6_lost: 0,
        book_title7_damaged: 0,
        book_title7_lost: 0,
        book_title8_damaged: 0,
        book_title8_lost: 0,
        book_title9_damaged: 0,
        book_title9_lost: 0,
      },
      rentalData: {
        book_title1_damaged: 0,
        book_title1_lost: 0,
        book_title2_damaged: 0,
        book_title2_lost: 0,
        book_title3_damaged: 0,
        book_title3_lost: 0,
        book_title4_damaged: 0,
        book_title4_lost: 0,
        book_title5_damaged: 0,
        book_title5_lost: 0,
        book_title6_damaged: 0,
        book_title6_lost: 0,
        book_title7_damaged: 0,
        book_title7_lost: 0,
        book_title8_damaged: 0,
        book_title8_lost: 0,
        book_title9_damaged: 0,
        book_title9_lost: 0,
      },
      loading: false,
      dialog: false,
      dialogDelete: false,
      dialogConfirmation: false,
      dialogConfirmation2: false,
      dialogRecord: false,
      subject: {
        subject1: 'Filipino',
        subject2: 'English',
        subject3: 'Mathematics',
        subject4: 'Science',
        subject5: 'Araling Panlipunan',
        subject6: 'MAPEH',
        subject7: 'TLE',
        subject8: 'CL',
        subject9: 'VE',
        date: '',
      },
      editedItem: {
        book_id: '',
        student_id: '',
        student_grade: '',
        student_section: '',
        rental_record: '',
        return_date: '',
        release_date: '',
        book_title1: '',
        book_title2: '',
        book_title3: '',
        book_title4: '',
        book_title5: '',
        book_title6: '',
        book_title7: '',
        book_title8: '',
        book_title9: '',
        date: ''
      },
      selectedGrade: null,
      selectedSection: null,
      fieldErrors: {
        book_id: false,
        student_id: false,
        date: false,
        return_date: false,
      },
      allBooks: [],
      index: '',
    };
  },
  computed: {
    filteredTitles() {
      const category = this.subject[`subject${this.index}`];
      if (!category) return [];
      return this.allBooks
        .filter(book => book.categ_name === category)
        .map(book => book.book_title);
    },

    displayedData() {
    let data = this.filteredData;

    // Apply search filter
    if (this.search) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(this.search.toLowerCase())
        )
      );
    }

    // Apply grade level filter
    if (this.selectedGradeLevel) {
      data = data.filter(item => item.grade_level === this.selectedGradeLevel);
    }

    return data;
  },

  filteredData() {
    let filtered = this.data;

    // Apply selected section filter if applicable
    if (this.selectedSection) {
      filtered = filtered.filter(item => item.student_section === this.selectedSection);
    }

    // Apply status and archive filters
    filtered = filtered.filter(item => item.status === 0 || item.is_archived === 0);

    return filtered;
  },
    grades() {
      return [...new Set(this.data.map(item => item.student_grade))];
    },
    sections() {
      return [...new Set(this.data.map(item => item.student_section))];
    },
    isIssuePresent() {
      return [
        this.rentalData.book_title1_damaged,
        this.rentalData.book_title1_lost,
        this.rentalData.book_title2_damaged,
        this.rentalData.book_title2_lost,
        this.rentalData.book_title3_damaged,
        this.rentalData.book_title3_lost,
        this.rentalData.book_title4_damaged,
        this.rentalData.book_title4_lost,
        this.rentalData.book_title5_damaged,
        this.rentalData.book_title5_lost,
        this.rentalData.book_title6_damaged,
        this.rentalData.book_title6_lost,
        this.rentalData.book_title7_damaged,
        this.rentalData.book_title7_lost,
        this.rentalData.book_title8_damaged,
        this.rentalData.book_title8_lost,
        this.rentalData.book_title9_damaged,
        this.rentalData.book_title9_lost
      ].some(issue => issue === 1);
    },
  },

  created() {
    this.fetchData();
    this.subject.date = this.currentDate;
    this.fetchItems();
    this.fetchBooks();
  },
  mounted() {
    this.fetchBooks(); 
  },
  methods: {
    getFilteredTitles(index) {
      const category = this.subject[`subject${index}`];
      if (!category) return [];
      return this.allBooks
        .filter(book => book.categ_name === category)
        .map(book => book.book_title);
    },
    async fetchBooks() {
      try {
        const response = await axios.get('/library/books');
        this.allBooks = response.data;
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    },
    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    handleCheckboxChange(index, type) {
      const damagedKey = `book_title${index}_damaged`;
      const lostKey = `book_title${index}_lost`;

      if (type === 'damaged' && this.rentalData[damagedKey] === 1) {
        this.rentalData[lostKey] = 0;
      } else if (type === 'lost' && this.rentalData[lostKey] === 1) {
        this.rentalData[damagedKey] = 0;
      }
    },
    initializeSelectedItem(index) {
      this.$set(this.selectedItem, `book_title${index}_damaged`, 0);
      this.$set(this.selectedItem, `book_title${index}_lost`, 0);
    },
    closeRecord() {
      this.dialogRecord = false;
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
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleString('en-US', options);
    },
    formatDate(dateString) {
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleString('en-US', options);
    },
    fetchData() {
      axios.get('/library/rental')
        .then(response => {
          const borrowStatusData = response.data;

          const studentIds = borrowStatusData.map(item => item.student_id);
          axios.get('/student', { params: { ids: studentIds } })
            .then(studentResponse => {
              const students = studentResponse.data.student;

              const bookIds = borrowStatusData.flatMap(item => [
                item.Araling_Panlipunan, item.English, item.Filipino, item.MAPEH,
                item.Mathematics, item.Science, item.TLE, item.CL, item.VE
              ]).filter(id => id); // filter out null/undefined values
              axios.get('/library/books', { params: { ids: bookIds } })
                .then(bookResponse => {
                  const books = bookResponse.data.reduce((acc, book) => {
                    acc[book.book_id] = book;
                    return acc;
                  }, {});

                  this.data = borrowStatusData.map(statusItem => {
                    const student = students.find(student => student.student_id === statusItem.student_id);

                    return {
                      ...statusItem,
                      student_name: student ? `${student.first_name} ${student.last_name}${student.extension ? ' ' + student.extension : ''}` : '',
                      grade_level: student ? `${student.grade_level}` : '',
                      rental_record: {
                        Araling_Panlipunan: books[statusItem.Araling_Panlipunan] ? books[statusItem.Araling_Panlipunan].rental_record : '',
                        English: books[statusItem.English] ? books[statusItem.English].rental_record : '',
                        Filipino: books[statusItem.Filipino] ? books[statusItem.Filipino].rental_record : '',
                        MAPEH: books[statusItem.MAPEH] ? books[statusItem.MAPEH].rental_record : '',
                        Mathematics: books[statusItem.Mathematics] ? books[statusItem.Mathematics].rental_record : '',
                        Science: books[statusItem.Science] ? books[statusItem.Science].rental_record : '',
                        TLE: books[statusItem.TLE] ? books[statusItem.TLE].rental_record : '',
                        CL: books[statusItem.CL] ? books[statusItem.CL].rental_record : '',
                        VE: books[statusItem.VE] ? books[statusItem.VE].rental_record : '',
                        AP_code: statusItem.AP_code,
                        E_code: statusItem.E_code,
                        F_code: statusItem.F_code,
                        MA_code: statusItem.MA_code,
                        M_code: statusItem.M_code,
                        S_code: statusItem.S_code,
                        T_code: statusItem.T_code,
                        C_code: statusItem.C_code,
                        V_code: statusItem.V_code
                      }
                    };
                  });
                  this.$forceUpdate();
                })
                .catch(bookError => {
                  console.error('Error fetching book data:', bookError);
                });
            })
            .catch(studentError => {
              console.error('Error fetching student data:', studentError);
            });
        })
        .catch(error => {
          console.error('Error fetching borrow status data:', error);
        });
    },
    showConfirmation() {
      this.fieldErrors = {
        student_id: this.editedItem.student_id.trim() === '',
        return_date: this.editedItem.return_date.trim() === '',
        ...[...Array(7)].reduce((acc, _, index) => {
          acc[`book_code${index + 1}`] = this.editedItem[`book_code${index + 1}`].trim() === '';
          return acc;
        }, {})
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
        this.editedItem.student_id.trim() !== '' &&
        this.editedItem.return_date.trim() !== ''
      );
    },
    closeConfirmation() {
      this.dialogConfirmation = false;
    },
    returnConfirmation(item) {
      this.selectedItem = {
        ...item,
        book_title1: item.Araling_Panlipunan,
        book_title2: item.English,
        book_title3: item.Filipino,
        book_title4: item.MAPEH,
        book_title5: item.Mathematics,
        book_title6: item.Science,
        book_title7: item.TLE,
        book_title8: item.CL,
        book_title9: item.VE,
        book_code1: item.AP_code,
        book_code2: item.E_code,
        book_code3: item.F_code,
        book_code4: item.MA_code,
        book_code5: item.M_code,
        book_code6: item.S_code,
        book_code7: item.T_code,
        book_code8: item.C_code,
        book_code9: item.V_code
      };
      this.rentalData = {
        book_title1_damaged: item.book_title1_damaged || 0,
        book_title2_damaged: item.book_title2_damaged || 0,
        book_title3_damaged: item.book_title3_damaged || 0,
        book_title4_damaged: item.book_title4_damaged || 0,
        book_title5_damaged: item.book_title5_damaged || 0,
        book_title6_damaged: item.book_title6_damaged || 0,
        book_title7_damaged: item.book_title7_damaged || 0,
        book_title8_damaged: item.book_title8_damaged || 0,
        book_title9_damaged: item.book_title9_damaged || 0,
        book_title1_lost: item.book_title1_lost || 0,
        book_title2_lost: item.book_title2_lost || 0,
        book_title3_lost: item.book_title3_lost || 0,
        book_title4_lost: item.book_title4_lost || 0,
        book_title5_lost: item.book_title5_lost || 0,
        book_title6_lost: item.book_title6_lost || 0,
        book_title7_lost: item.book_title7_lost || 0,
        book_title8_lost: item.book_title8_lost || 0,
        book_title9_lost: item.book_title9_lost || 0,
      };
      this.dialogConfirmation2= true;
    },
    viewRecord(item) {
      this.selectedItem = {
        ...item,
        book_title1: item.Araling_Panlipunan,
        book_title2: item.English,
        book_title3: item.Filipino,
        book_title4: item.MAPEH,
        book_title5: item.Mathematics,
        book_title6: item.Science,
        book_title7: item.TLE,
        book_title8: item.CL,
        book_title9: item.VE,
        book_code1: item.AP_code,
        book_code2: item.E_code,
        book_code3: item.F_code,
        book_code4: item.MA_code,
        book_code5: item.M_code,
        book_code6: item.S_code,
        book_code7: item.T_code,
        book_code8: item.C_code,
        book_code9: item.V_code,
      };
      this.dialogRecord = true;
    },
    closeConfirmation2() {
      this.dialogConfirmation2 = false;
    },
    back() {
      axios.put('/library/rental/return/' + this.selectedItem.rental_id)
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
      const updatedData = {
        ...this.selectedItem,
        ...this.rentalData,
      };

      axios.put(`/library/rental/${this.selectedItem.rental_id}`, updatedData)
        .then((response) => {
          if (response.data.success) {
            this.$emit('update-data');
            this.dialogConfirmation2 = false;
            this.$toast.success('Record updated successfully');
            this.fetchData();
          } else {
            this.$toast.error('Failed to update record');
          }
        })
        .catch((error) => {
          this.dialogConfirmation2 = false;
        });
    },
    save() {
      // Create a payload object and handle nullable book titles
      const payload = {
        student_id: this.editedItem.student_id,
        release_date: this.subject.date,
        return_date: this.editedItem.return_date,
        Araling_Panlipunan: this.editedItem.book_title1 || null,
        English: this.editedItem.book_title2 || null,
        Filipino: this.editedItem.book_title3 || null,
        MAPEH: this.editedItem.book_title4 || null,
        Mathematics: this.editedItem.book_title5 || null,
        Science: this.editedItem.book_title6 || null,
        TLE: this.editedItem.book_title7 || null,
        CL: this.editedItem.book_title8 || null,
        VE: this.editedItem.book_title9 || null,
        AP_code: this.editedItem.book_code1 || null,
        E_code: this.editedItem.book_code2 || null,
        F_code: this.editedItem.book_code3 || null,
        MA_code: this.editedItem.book_code4 || null,
        M_code: this.editedItem.book_code5 || null,
        S_code: this.editedItem.book_code6 || null,
        T_code: this.editedItem.book_code7 || null,
        C_code: this.editedItem.book_code8 || null,
        V_code: this.editedItem.book_code9 || null
      };

      axios.post('/library/rental', payload)
        .then(() => {
          this.closeConfirmation(); // Close the confirmation dialog
          this.close(); // Close the add record dialog
          this.fetchData(); // Refresh data to include new record
        })
        .catch(error => {
          Swal.fire('Error', 'Error adding record! Please try again. ', 'error');
        });
    },
    close() {
      this.dialog = false;
      this.editedItem = {
        book_id: '',
        student_id: '',
        student_grade: '',
        student_section: '',
        rental_record: '',
        date: '',
        return_date: '',
      };
    },
  },
};
</script>


<style scoped>
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
</style>
