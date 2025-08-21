<template>
  <main>
    <div class="top-container">
      <h1 class="bg-title">Rental Records</h1>
      <div class="RentalRecords">
        <span class="material-icons">book</span>
        <span class="text">Rental Records</span>
      </div>
      <div class="buttons">
            <v-btn class="mb-2" color="#28a745" dark @click="printReport">Generate Report</v-btn>
        </div>
    </div>
    <hr>
    <div class="main-content">
      <div class="rentalrecords-table">
        <RentalRecordsTable ref="rentalrecordsTable"/>
      </div>
    </div>
  </main>
</template>

<script>
import RentalRecordsTable from '../components/RentalRecordsTable.vue';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default {
  components: {
    RentalRecordsTable
  },
  methods: {
    async printReport() {
    try {
        // Get filtered data from RentalRecordsTable
        const rentalrecordsTable = this.$refs.rentalrecordsTable;
        const filteredData = rentalrecordsTable.getFilteredData();

        if (!filteredData || !Array.isArray(filteredData)) {
            throw new Error('Invalid data received from RentalRecordsTable');
        }

        const headers = [
            { header: 'School Year', key: 'schoolYear', width: 20 },
            { header: 'Month', key: 'month', width: 20 },
            { header: 'Student ID', key: 'student_id', width: 25 },
            { header: 'Araling Panlipunan', key: 'Araling_Panlipunan', width: 25 },
            { header: 'Book Code', key: 'AP_code', width: 15 },
            { header: 'English', key: 'English', width: 25 },
            { header: 'Book Code', key: 'E_code', width: 15 },
            { header: 'Filipino', key: 'Filipino', width: 25 },
            { header: 'Book Code', key: 'F_code', width: 15 },
            { header: 'MAPEH', key: 'MAPEH', width: 25 },
            { header: 'Book Code', key: 'MA_code', width: 15 },
            { header: 'Mathematics', key: 'Mathematics', width: 25 },
            { header: 'Book Code', key: 'M_code', width: 15 },
            { header: 'Science', key: 'Science', width: 25 },
            { header: 'Book Code', key: 'S_code', width: 15 },
            { header: 'TLE', key: 'TLE', width: 25 },
            { header: 'Book Code', key: 'T_code', width: 15 },
            { header: 'CL', key: 'CL', width: 25 },
            { header: 'Book Code', key: 'C_code', width: 15 },
            { header: 'VE', key: 'VE', width: 25 },
            { header: 'Book Code', key: 'V_code', width: 15 },
          ];

        // Convert filteredData to worksheet
        const ws = XLSX.utils.json_to_sheet(filteredData);

        // Set column widths
        ws['!cols'] = Array(headers.length).fill({ width: 22 }); // Adjust width as needed

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
        XLSX.utils.book_append_sheet(wb, ws, 'Rental Records');

        // Generate buffer
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Create a blob and download it
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Rental_Records_Report.xlsx';
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


  .RentalRecords {
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

  .rentalrecords-table {
    border-radius: 10px;
    background-color: #f0f0f0;
    padding: 0.5rem;
    height: 100%;
  }
}
</style>
