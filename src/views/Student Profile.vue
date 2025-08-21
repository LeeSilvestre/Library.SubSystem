<template>
  <main>
    <div class="top-container">
      <h1 class="bg-title">Book Inventory</h1>
      <div class="studentProfile">
        <span class="material-icons">inventory</span>
        <span class="text">Book Inventory</span>
      </div>
      <div class="buttons">
        <v-btn class="mb-2" color="#28a745" dark @click="showReportOptions">Generate Inventory</v-btn>
      </div>
      <div class="buttons">
        <v-btn class="mb-2" color="primary" dark @click="manageCategories">Manage Categories</v-btn>
      </div>
      <div class="buttons" style="margin-right: 10px;">
        <v-btn class="mb-2" color="#B71C1C" dark style="color: white;" @click="manageArchives">Archives</v-btn>
      </div>
    </div>
    <hr>
    <div class="main-content">
      <div class="student-table">
        <StudentTable ref="student-table" />
      </div>
    </div>
    <!-- Confirmation Dialog -->
    <v-dialog v-model="dialogConfirmation" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmation</v-card-title>
        <v-card-text>
          Are you sure you want to add this book information?
          <div>
            <strong>Title:</strong> {{ editedItem.book_title }}
          </div>
          <div>
            <strong>Author:</strong> {{ editedItem.book_auth }}
          </div>
          <div>
            <strong>Category ID:</strong> {{ editedItem.categ_name }} 
          </div>
          <div>
            <strong>Publication Date:</strong> {{ editedItem.pub_date }} 
          </div>
          <div>
            <strong>Copyright Owner:</strong> {{ editedItem.copyright_owner }} 
          </div>
          <div>
            <strong>No. of Copies:</strong> {{ editedItem.book_qty }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="button button-save" @click="save">Yes</v-btn>
          <v-btn class="button button-cancel" @click="closeConfirmation">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

<script>
import StudentTable from '../components/StudentTable.vue';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  data() {
    return {
      books: [],
      selectedReports: {
        titleReport: false,
        authorReport: false,
        categoryReport: false,
        pubDateReport: false,
        copyrightOwnerReport: false,
        copiesReport: false,
      },
      categories: [],
      dialogConfirmation: false,
      editedItem: {
        book_title: '',
        book_auth: '',
        categ_name: '',
        pub_date: '',
        copyright_owner: '',
        book_qty: '',
      }
    };
  },
  components: {
    StudentTable,
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get('/library/books');
        this.books = response.data.filter(book => book.is_archived === 0);
      } catch {
        // Handle error appropriately
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get('/library/categories');
        this.categories = response.data;
      } catch {
        // Handle error appropriately
      }
    },
    manageCategories() {
      this.$router.push('/categories');
    },
    manageArchives() {
      this.$router.push('/bookarchives');
    },
    async showReportOptions() {
  await this.fetchCategories(); // Fetch categories for selection

  const { value: reportOptions } = await Swal.fire({
    title: 'Select Report Options',
    html: `
      <div style="text-align: left;">
        <label>
          <br>
          <input type="checkbox" id="titleReport"> Title Report
        </label><br><br>
        <label>
          <input type="checkbox" id="authorReport"> Author Report
        </label><br><br>
        <label>
          <input type="checkbox" id="categoryReport"> Category Report
        </label><br><br>
        <label>
          <input type="checkbox" id="pubDateReport"> Publication Date Report
        </label><br><br>
        <label>
          <input type="checkbox" id="copyrightOwnerReport"> Copyright Owner Report
        </label><br><br>
        <label>
          <input type="checkbox" id="damageFineReport"> Damage Fine Report
        </label><br><br>
        <label>
          <input type="checkbox" id="lostFineReport"> Lost Fine Report
        </label><br><br>
        <label>
          <input type="checkbox" id="copiesReport"> No of Copies Report
        </label><br><br>
        <label>
          <input type="checkbox" id="borrowedBooksReport"> Borrowed Books Report
        </label><br><br>
        <label>
          <input type="checkbox" id="damagedReport"> Damaged Report
        </label><br><br>
        <label>
          <input type="checkbox" id="lostReport"> Lost Report
        </label>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745',
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#dc3545',
    
    preConfirm: () => {
      return {
        titleReport: document.getElementById('titleReport').checked,
        authorReport: document.getElementById('authorReport').checked,
        categoryReport: document.getElementById('categoryReport').checked,
        pubDateReport: document.getElementById('pubDateReport').checked,
        copyrightOwnerReport: document.getElementById('copyrightOwnerReport').checked,
        copiesReport: document.getElementById('copiesReport').checked,
        borrowedBooksReport: document.getElementById('borrowedBooksReport').checked,
        damageFineReport: document.getElementById('damageFineReport').checked,
        lostFineReport: document.getElementById('lostFineReport').checked,
        damagedReport: document.getElementById('damagedReport').checked,
        lostReport: document.getElementById('lostReport').checked
      };
    },
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton();
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      const updateButtonState = () => {
        confirmButton.disabled = ![...checkboxes].some(cb => cb.checked);
      };

      checkboxes.forEach(cb => cb.addEventListener('change', updateButtonState));
      updateButtonState(); // Initial check
    }
  });

  if (reportOptions) {
    this.selectedReports = {
      titleReport: reportOptions.titleReport,
      authorReport: reportOptions.authorReport,
      categoryReport: reportOptions.categoryReport,
      pubDateReport: reportOptions.pubDateReport,
      copyrightOwnerReport: reportOptions.copyrightOwnerReport,
      copiesReport: reportOptions.copiesReport,
      borrowedBooksReport: reportOptions.borrowedBooksReport, // Added borrowedBooksReport
      damageFineReport: reportOptions.damageFineReport, // Added damageFineReport
      lostFineReport: reportOptions.lostFineReport, // Added lostFineReport
      damagedReport: reportOptions.damagedReport, // Added damagedReport
      lostReport: reportOptions.lostReport // Added lostReport
    };
    this.printReport();
      }
    },
    async printReport() {
  await this.fetchBooks();

  if (!this.books.length) {
    Swal.fire({
      icon: 'warning',
      title: 'No Data',
      text: 'No books available to generate a report.',
    });
    return;
  }

  let filteredBooks = this.books;

  if (this.selectedReports.categoryReport) {
    const categoryId = this.categories.find(cat => cat.name === this.selectedCategory)?.id;
    if (categoryId) {
      filteredBooks = filteredBooks.filter(book => book.category.id === categoryId);
    }
  }

  const workbook = XLSX.utils.book_new();
  const worksheetData = filteredBooks.map(book => {
    const data = {};
    if (this.selectedReports.titleReport) data.TITLE = book.book_title;
    if (this.selectedReports.authorReport) data.AUTHOR = book.book_auth;
    if (this.selectedReports.categoryReport) data.CATEGORY = book.category.categ_name;
    if (this.selectedReports.pubDateReport) data['PUB. DATE'] = this.formatDate(book.pub_date);
    if (this.selectedReports.copyrightOwnerReport) data['C/O'] = book.copyright_owner;
    if (this.selectedReports.damageFineReport) data['DAMAGE FINE'] = book.damaged_fine; // Added damageFineReport
    if (this.selectedReports.lostFineReport) data['LOST FINE'] = book.lost_fine; // Added lostFineReport
    if (this.selectedReports.copiesReport) data['NO. OF COPIES'] = book.book_qty;
    if (this.selectedReports.borrowedBooksReport) data['BORROWED BOOKS'] = book.borrowed; // Added borrowedBooksReport
    if (this.selectedReports.damagedReport) data['DAMAGED'] = book.damaged ? 'Yes' : 'No'; // Added damagedReport
    if (this.selectedReports.lostReport) data['LOST'] = book.lost ? 'Yes' : 'No'; // Added lostReport
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

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Book Inventory');
      XLSX.writeFile(workbook, `Book_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

      Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Report successfully generated.",
                showConfirmButton: false,
                timer: 1500
              });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    save() {
      this.dialogConfirmation = false;
    },
    closeConfirmation() {
      this.dialogConfirmation = false;
    }
  },
};
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.top-container {
  display: flex;
  margin: 0.5rem;

  .bg-title {
    z-index: -1;
    position: absolute;
    opacity: 10%;
    margin-top: -40px;
    font-size: 100px;
    font-family: Impact, fantasy;
  }
  .studentProfile {
    flex: 1;

    .material-icons {
      position: relative;
      color: var(--dark);
      font-size: 2.5rem;
    }
    .text {
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
  margin-right: 10px;

  .student-table {
    border-radius: 10px;
    background-color: #f0f0f0;
    padding: 0.5rem;
    height: 100%;
  }
}
</style>
