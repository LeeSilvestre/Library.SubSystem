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
        </v-toolbar>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.student_name }}</td>
          <td>{{ item.book_title }}</td>
          <td>{{ item.access_no }}</td>
          <td>{{ formatDate2(item.borrowed_date) }}</td>
          <td :class="{'red-text': item.borrow_status === 4}">
            {{ item.borrow_status === 4 ? 'Lost' : formatDate(item.return_date) }}
          </td>
          <td>
              <v-chip :color="getStatusColor(item.borrow_status)" dark>{{ availableStatus[item.borrow_status] }}</v-chip>
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
      availableStatus: ["Pending", "Overdue", "Returned", "Returned with Damage", "Lost", "Returned with Damage", "Lost"],
      data: [],
      selectedColumns: ['student_id', 'book_title', 'access_no', 'borrowed_date', 'return_date', 'schoolYear', 'month', 'borrow_status'],
      search: '',
      headers: [
          { title: 'Student Name', key: 'student_name' },
          { title: 'Book Title', key: 'book_title' },
          { title: 'Book Code', key: 'access_no' },
          { title: 'Borrow Date', key: 'borrowed_date' },
          { title: 'Return Date', key: 'return_date' },
          { title: 'Return Status', key: 'borrow_status' },
      ],
      selectedSchoolYear: 'All',
      selectedMonthly: 'All',
      schoolYears: ['All'],
      monthlyOptions: [
        'All',
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      dialog: false,
      dialogDelete: false,
      };
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
          [2, 3, 4].includes(item.borrow_status) &&
          (this.selectedSchoolYear === 'All' || item.schoolYear === this.selectedSchoolYear) &&
          (this.selectedMonthly === 'All' || item.month === this.selectedMonthly) &&
          (this.search === '' ||
            Object.values(item).some(value =>
              value.toString().toLowerCase().includes(this.search.toLowerCase())
            ))
        ));
    },
    getFilteredDataWithColumns() {
      const filteredData = this.filteredData;
      return filteredData.map(item => {
        const selectedData = {};
        this.selectedColumns.forEach(col => {
          selectedData[col] = item[col];
        });
        return selectedData;
      });
    },
  },
  created(){
    this.fetchData();
  },
  methods: {
    getFilteredData() {
      return this.getFilteredDataWithColumns;
    },
    async fetchData() {
      try {
        const borrowStatusResponse = await axios.get('/library/borrowstatus');
        const borrowStatusData = borrowStatusResponse.data;

        const studentIds = borrowStatusData.map(item => item.student_id);
        const studentResponse = await axios.get('/student', { params: { ids: studentIds } });
        const students = studentResponse.data.student;

        const bookIds = borrowStatusData.map(item => item.book_title);
        const bookResponse = await axios.get('/library/books', { params: { ids: bookIds } });
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
            schoolYear: (new Date(statusItem.borrowed_date).getMonth() > 6 || (new Date(statusItem.borrowed_date).getMonth() === 6 && new Date(statusItem.borrowed_date).getDate() >= 29)) ? `${new Date(statusItem.borrowed_date).getFullYear()}-${new Date(statusItem.borrowed_date).getFullYear() + 1}` : `${new Date(statusItem.borrowed_date).getFullYear() - 1}-${new Date(statusItem.borrowed_date).getFullYear()}`,
            month: new Date(statusItem.borrowed_date).toLocaleString('default', { month: 'long' })
          };
        });

        // Update schoolYears based on data
        const schoolYears = [...new Set(
          this.data.map(item => item.schoolYear)
        )].sort((a, b) => b.split('-')[0] - a.split('-')[0]);
        this.schoolYears = ['All', ...schoolYears];

      } catch (error) {
        console.error('Error fetching data:', error);
      }
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
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      const date = new Date(dateString);
      return date.toLocaleString('en-US', options);
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
    save() {
      if (this.editedItem.id) {
        const index = this.data.findIndex((item) => item.id === this.editedItem.id);
        this.data.splice(index, 1, this.editedItem);
      } else {
        this.data.push({ ...this.editedItem });
      }
      this.close();
    },
    close() {
      this.dialog = false;
      this.editedItem = {
        id: '',
        student_lrn: '',
        student_name: '',
        book_title: '',
        borrow_date: '',
        return_date: '',
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
      const index = this.data.findIndex((item) => item.id === this.editedItem.id);
      this.data.splice(index, 1);
      this.closeDelete();
    },
    closeDelete() {
      this.dialogDelete = false;
      this.editedItem = {
        id: '',
        student_lrn: '',
        student_name: '',
        book_title: '',
        borrow_date: '',
        return_date: '',
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.red-text {
color: red;
}
.green-text {
color: green;
}
.v-data-table {
   height: 100%;
}
</style>