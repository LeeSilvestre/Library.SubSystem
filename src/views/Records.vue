<template>
    <main>
      <div class="top-container">
        <h1 class="bg-title">Borrow Records</h1>
        <div class="Records">
          <span class="material-icons">save</span>
          <span class="text">Borrow Records</span>
        </div>
        <div class="buttons">
            <v-btn class="mb-2" color="#28a745" dark @click="printReport">Generate Report</v-btn>
        </div>
      </div>  
      <hr>
  
      <div class="main-content">
        <div class="record-table">
          <RecordTable ref="recordTable" />
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import RecordTable from '../components/RecordTable.vue';
  import * as XLSX from 'xlsx';
  import Swal from 'sweetalert2';
  
  export default {
    components: {
      RecordTable
    },
    methods: {
      async printReport() {
        try {
          // Get filtered data from RecordTable
          const recordTable = this.$refs.recordTable;
          const filteredData = recordTable.getFilteredData();

          if (!filteredData || !Array.isArray(filteredData)) {
            throw new Error('Invalid data received from RecordTable');
          }

          // Define status mapping
          const statusMapping = {
            1: "Overdue",
            2: "Returned",
            3: "Damaged",
            4: "Lost"
          };

          // Process data to replace null return_date and map borrow_status
          const processedData = filteredData.map(item => ({
            ...item,
            return_date: item.return_date === null ? "lost" : item.return_date,
            borrow_status: statusMapping[item.borrow_status] || "Unknown"
          }));

          const headers = [
            { header: 'Student ID', key: 'student_id', width: 25 },
            { header: 'Book Title', key: 'book_title', width: 15 },
            { header: 'Book Code', key: 'access_no', width: 15 },
            { header: 'Borrow Date', key: 'borrowed_date', width: 20 },
            { header: 'Return Date', key: 'return_date', width: 20 },
            { header: 'School Year', key: 'schoolYear', width: 20 },
            { header: 'Month', key: 'month', width: 20 },
            { header: 'Status', key: 'borrow_status', width: 15 }
          ];

          // Convert data to worksheet
          const ws = XLSX.utils.json_to_sheet(processedData);

          // Set column widths
          ws['!cols'] = Array(processedData[0] ? Object.keys(processedData[0]).length : 0).fill({ width: 22 }); // Approx. 135 pixels

          // Define cell style for center alignment
          const centerStyle = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };

          // Apply the style to each cell
          for (let cellAddress in ws) {
            if (cellAddress[0] === '!') continue; // Skip special keys
            if (!ws[cellAddress].s) ws[cellAddress].s = {}; // Create style object if it doesn't exist
            Object.assign(ws[cellAddress].s, centerStyle);
          }

          headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
            ws[cellAddress] = {
              v: header.header,
              s: { font: { bold: true }, alignment: centerStyle.alignment }
            };
          });

          // Create a new workbook
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Records');

          // Generate buffer
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

          // Create a blob and download it
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Borrow_Records_Report.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
          icon: 'success',
          title: 'Export Successful',
          text: 'The report has been successfully exported to Excel.'
        });
        } catch (error) {
          console.error('Error exporting to Excel:', error);
          Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'Failed to export to Excel. Please try again.'
          });
        }
      }
    }
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