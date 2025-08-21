<template>
    <div>
      <v-data-table
        :search="search"
        :headers="visibleHeaders"
        :items="displayedData"
        :sort-by="[{ key: 'borrow_id', order: 'desc' }]"
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

            <v-checkbox
              v-for="month in monthHeaders"
              :key="month.key"
              :label="month.title"
              v-model="visibleMonths[month.key]"
              hide-details
            ></v-checkbox>
          </v-toolbar>
        </template>
  
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.category }}</td>
            <td>{{ item.no_of_books }}</td>
            <template v-if="visibleMonths.january"><td>{{ item.january }}</td></template>
            <template v-if="visibleMonths.february"><td>{{ item.february }}</td></template>
            <template v-if="visibleMonths.march"><td>{{ item.march }}</td></template>
            <template v-if="visibleMonths.april"><td>{{ item.april }}</td></template>
            <template v-if="visibleMonths.may"><td>{{ item.may }}</td></template>
            <template v-if="visibleMonths.june"><td>{{ item.june }}</td></template>
            <template v-if="visibleMonths.july"><td>{{ item.july }}</td></template>
            <template v-if="visibleMonths.august"><td>{{ item.august }}</td></template>
            <template v-if="visibleMonths.september"><td>{{ item.september }}</td></template>
            <template v-if="visibleMonths.october"><td>{{ item.october }}</td></template>
            <template v-if="visibleMonths.november"><td>{{ item.november }}</td></template>
            <template v-if="visibleMonths.december"><td>{{ item.december }}</td></template>
            <td>{{ item.returned }}</td>
            <td>{{ item.lost }}</td>
            <td>{{ item.returned_with_fine }}</td>
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
        search: '',
        headers: [
          { title: 'Category', key: 'category' },
          { title: 'No of Books', key: 'no_of_books' },
          { title: 'January', key: 'january' },
          { title: 'February', key: 'february' },
          { title: 'March', key: 'march' },
          { title: 'April', key: 'april' },
          { title: 'May', key: 'may' },
          { title: 'June', key: 'june' },
          { title: 'July', key: 'july' },
          { title: 'August', key: 'august' },
          { title: 'September', key: 'september' },
          { title: 'October', key: 'october' },
          { title: 'November', key: 'november' },
          { title: 'December', key: 'december' },
          { title: 'Returned', key: 'returned' },
          { title: 'Lost', key: 'lost' },
          { title: 'Returned with Fine', key: 'returned_with_fine' }
        ],
        monthHeaders: [
          { title: 'January', key: 'january' },
          { title: 'February', key: 'february' },
          { title: 'March', key: 'march' },
          { title: 'April', key: 'april' },
          { title: 'May', key: 'may' },
          { title: 'June', key: 'june' },
          { title: 'July', key: 'july' },
          { title: 'August', key: 'august' },
          { title: 'September', key: 'september' },
          { title: 'October', key: 'october' },
          { title: 'November', key: 'november' },
          { title: 'December', key: 'december' }
        ],
                visibleMonths: {
        january: false,
        february: false,
        march: false,
        april: false,
        may: false,
        june: false,
        july: false,
        august: false,
        september: false,
        october: false,
        november: false,
        december: false
        },
        data: [],
        loading: false,
        dialog: false,
        dialogDelete: false,
        dialogConfirmation: false,
        dialogConfirmation2: false,
        editedItem: {
          book_id: '',
          student_id: '',
          access_no: ''
        },
        selected: []
      };
    },
    computed: {
      visibleHeaders() {
        return this.headers.filter(header => 
          !this.monthHeaders.some(monthHeader => 
            monthHeader.key === header.key && !this.visibleMonths[header.key]
          )
        );
      },
      displayedData() {
        if (this.search) {
          return this.data.filter((item) =>
            Object.values(item).some((value) =>
              value.toLowerCase().includes(this.search.toLowerCase())
            )
          );
        }
        return this.data;
      }
    },
    created() {
      this.fetchData();
    },
    methods: {
      fetchData() {
        axios.get('/library/borrowstatus')
          .then((response) => {
            this.data = response.data;
          })
          .catch((error) => {
            console.error('Error fetching borrow status data:', error);
          });
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
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
  