<template>
  <div>
    <v-data-table
      :search="search"
      :headers="visibleHeaders"
      :items="sortedData"
      :sort-by="[{ key: 'login_date', order: 'desc' }]"
    >
    <template v-slot:top>
  <v-toolbar flat>
    <!-- Container for search field aligned to the left -->
    <div class="d-flex align-center">
      <v-text-field
        v-model="search"
        style="width: 800px;"
        class="mr-4"
        density="compact"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </div>


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
          <td>{{ studentNames[item.student_id] }}</td>
          <td>{{ formatDate(item.login_date) }}</td>
          <td>{{ formatTime(item.login_time) }}</td>
          <td>{{ formatTime(item.logout_time) }}</td>
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
      selectedColumns: ['student_id', 'login_date', 'login_time', 'logout_time', 'schoolYear', 'month'],
      headers: [
        { title: 'Student Name', key: 'studentNames' },
        { title: 'Date', key: 'login_date' },
        { title: 'Time In', key: 'login_time' },
        { title: 'Time Out', key: 'logout_time' }
      ],
      data: [],
      schoolYears: ['All'], 
      monthlyOptions: [
        'All',
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      selectedSchoolYear: 'All',  
      selectedMonthly: 'All', 
      studentNames: {},    
    };
  },
  computed: {
    visibleHeaders() {
      return this.headers;
    },
    filteredData() {
      return this.data
        .map(item => {
          const date = new Date(item.login_date);
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
    sortedData() {
      return this.filteredData.sort((b, a) => {
        const dateA = new Date(`${a.login_date}T${a.login_time}`);
        const dateB = new Date(`${b.login_date}T${b.login_time}`);
        return dateA - dateB;
      });
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
  async fetchData() {
    try {
      // Fetch logs data
      const logsResponse = await axios.get('/library/logs');
      this.data = logsResponse.data;

      // Determine school years for filtering
      const schoolYears = [...new Set(
        this.data.map(item => {
          const date = new Date(item.login_date);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          return month > 6 || (month === 6 && day >= 29) ? `${year}-${year + 1}` : `${year - 1}-${year}`;
        })
      )].sort((a, b) => {
        const [startYearA] = a.split('-').map(Number);
        const [startYearB] = b.split('-').map(Number);
        return startYearB - startYearA;
      });

      this.schoolYears = ['All', ...schoolYears];

      // Fetch student names
      const studentIds = [...new Set(this.data.map(item => item.student_id))];
      const studentResponse = await axios.get('/student', { params: { ids: studentIds } });

      console.log('Student response:', studentResponse.data); // Log to inspect response

      // Adjust based on actual response structure
      const students = studentResponse.data.student || [];

      // Map student IDs to names
      this.studentNames = students.reduce((acc, student) => {
        acc[student.student_id] = `${student.first_name} ${student.last_name}`;
        return acc;
      }, {});
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
    getFilteredData() {
      return this.getFilteredDataWithColumns;
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
      formatTime(timeString) {
        if (typeof timeString !== 'string') {
          return '';
        }

        const [hours, minutes] = timeString.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.warn('Invalid time value:', timeString);
          return '';
        }

        const isPM = hours >= 12;
        const formattedHours = ((hours % 12) || 12).toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const period = isPM ? 'PM' : 'AM';
        
        return `${formattedHours}:${formattedMinutes} ${period}`;
      }
  }
};
</script>

<style lang="scss" scoped>
.v-data-table {
  height: 100%;
}
</style>
