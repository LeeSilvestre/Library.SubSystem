<template>
    <main>
      <div class="top-container">
        <h1 class="bg-title">With Fine</h1>
        <div class="Records">
          <span class="material-icons">pending</span>
          <span class="text">With Fine</span>
        </div>
        <div class="buttons">
        <v-btn class="mb-2" color="#28a745" dark @click="showReportOptions">Generate Report</v-btn>
      </div>
      </div>  
      <hr>
  
      <div class="main-content">
        <div class="record-table">
          <RecordTable :books="books"/>
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import RecordTable from '../components/PendingReceiptTable.vue';
  import * as XLSX from 'xlsx';
  import Swal from 'sweetalert2';
  import axios from 'axios';
  
  export default {
    components: {
      RecordTable
    },
    data() {
    return {
      books: [],
      selectedReports: {
        studentNameReport: false,
        bookTitleReport: false,
        bookCodeReport: false,
        borrowDateReport: false,
        returnDueDateReport: false,
      },
    };
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get('/library/borrowstatus');
        console.log(response.data); // Add this line to check the API response
        this.books = response.data.filter(book => book.borrow_status === 5 || book.borrow_status === 6 || book.borrow_status === 7);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch overdue books data.'
        });
      }

    },
    async showReportOptions() {
      await this.fetchBooks(); // Fetch overdue books first

      const { value: reportOptions } = await Swal.fire({
        title: 'Select Report Options',
        html: `
          <div style="text-align: left;">
            ${this.createCheckbox('studentNameReport', 'Student Name')}
            ${this.createCheckbox('bookTitleReport', 'Book Title')}
            ${this.createCheckbox('bookCodeReport', 'Book Code')}
            ${this.createCheckbox('borrowDateReport', 'Borrow Date')}
            ${this.createCheckbox('returnDueDateReport', 'Return Due Date')}
            ${this.createCheckbox('fineReport', 'Fine')}
            ${this.createCheckbox('statusReport', 'Status')}
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Generate Report',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#dc3545',
        preConfirm: () => {
          return {
            studentNameReport: document.getElementById('studentNameReport').checked,
            bookTitleReport: document.getElementById('bookTitleReport').checked,
            bookCodeReport: document.getElementById('bookCodeReport').checked,
            borrowDateReport: document.getElementById('borrowDateReport').checked,
            returnDueDateReport: document.getElementById('returnDueDateReport').checked,
            fineReport: document.getElementById('fineReport').checked,
            statusReport: document.getElementById('statusReport').checked,
          };
        },
        didOpen: () => {
          const confirmButton = Swal.getConfirmButton();
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          const updateButtonState = () => {
            confirmButton.disabled = ![...checkboxes].some(cb => cb.checked);
          };

          checkboxes.forEach(cb => cb.addEventListener('change', updateButtonState));
          updateButtonState();
        }
      });

      if (reportOptions) {
        this.selectedReports = { ...reportOptions };
        this.generateReport(); 
      }
    },
    createCheckbox(id, label) {
      return `
        <label>
          <input type="checkbox" id="${id}"> ${label}
        </label><br><br>
      `;
    },
    async generateReport() {
      if (!this.books.length) {
        Swal.fire({
          icon: 'warning',
          title: 'No Data',
          text: 'No overdue books available to generate a report.',
        });
        return;
      }

      const statusMap = {
        5: 'Damaged',
        6: 'Lost',
        7: 'Overdue'
      };

      const workbook = XLSX.utils.book_new();
      const worksheetData = this.books.map(book => {
        const data = {};
        if (this.selectedReports.studentNameReport) data['STUDENT ID'] = book.student_id || 'N/A';
        if (this.selectedReports.bookTitleReport) data['BOOK TITLE'] = book.book_title || 'N/A';
        if (this.selectedReports.bookCodeReport) data['BOOK CODE'] = book.access_no || 'N/A';
        if (this.selectedReports.borrowDateReport) data['BORROW DATE'] = this.formatDate(book.borrowed_date) || 'N/A';
        if (this.selectedReports.returnDueDateReport) data['RETURN DUE DATE'] = this.formatDate(book.return_duedate) || 'N/A';
        if (this.selectedReports.fineReport) data['FINE'] = book.total_fine || '0';
        if (this.selectedReports.statusReport) data['STATUS'] = statusMap[book.borrow_status] || 'N/A';
        if (this.selectedReports.actionReport) data['ACTION'] = 'To be defined'; 
        return data;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      const columnWidths = Object.keys(worksheetData[0] || {}).map(() => ({ wch: 22 }));

      worksheet['!cols'] = columnWidths;
      worksheet['!rows'] = worksheetData.map(() => ({
        hpt: 16,
        hpx: 16,
      }));

      for (let cell in worksheet) {
        if (cell[0] === '!') continue;
        worksheet[cell].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'With Fine Books Report');
      XLSX.writeFile(workbook, `Fined_Books_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

      Swal.fire({
        icon: 'success',
        title: 'Report Generated',
        text: 'The overdue books report has been generated successfully!',
      });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  },
  };
  </script>
  
  <style lang="scss" scoped>
  .top-container {
    display: flex;
    margin: 0.5rem;

    .bg-title{
                z-index: -1;
                position: absolute;
                opacity: 10%;
                margin-top: -40px;
                font-size: 100px;
                font-family: Impact, fantasy;
    }
  
    .Records {
      flex: 1;
  
      .material-icons {
        color: var(--dark);
        font-size: 2.5rem;
      }
  
      .text{
                    position: relative;
                    color: var(--dark);
                    font-size: 2.5rem;
                    font-weight: 900;
                    bottom: 0.5rem;
                    text-shadow: 0 1px 1px;
                    margin-left: 1rem;
      }
    }
  } 
  
  .main-content {
    display: flex;
    flex-direction: column;
  
    .record-table {
      border-radius: 10px;
      background-color: #f0f0f0;
      padding: 0.5rem;
      height: 100%;
    }
  }
  </style>