<template>
    <main>
      <div class="top-container">
        <h1 class="bg-title">Logging Report</h1>
        <div class="LoggingReport">
          <span class="material-icons">report</span>
          <span class="text">Logging Report</span>
        </div>
        <div class="buttons">
            <v-btn class="mb-2" color="#28a745" dark @click="printReport">Generate Report</v-btn>
        </div>
      </div>  
      <hr>
  
      <div class="main-content">
        <div class="loggingreport-table">
          <LoggingReportTable ref="loggingReportTable"/>
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import LoggingReportTable from '../components/LoggingReportTable.vue';
  import * as XLSX from 'xlsx';
  
  export default {
    components: {
      LoggingReportTable
    },
    methods: {
      async printReport() {
        try {
          const loggingReportTable = this.$refs.loggingReportTable;
          const filteredData = loggingReportTable.getFilteredData();

          if (!filteredData || !Array.isArray(filteredData)) {
            throw new Error('Invalid data received from LoggingReportTable');
          }

          const ws = XLSX.utils.json_to_sheet(filteredData);

          ws['!cols'] = Array(filteredData[0] ? Object.keys(filteredData[0]).length : 0).fill({ width: 18 });

          const centerStyle = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };

          for (let cellAddress in ws) {
            if (cellAddress[0] === '!') continue; 
            if (!ws[cellAddress].s) ws[cellAddress].s = {}; 
            Object.assign(ws[cellAddress].s, centerStyle);
          }
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Logs');

          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Logging Report.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error exporting to Excel:', error);
          alert('Failed to export to Excel. Please try again.');
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
  
    .LoggingReport {
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
  
    .loggingreport-table {
      border-radius: 10px;
      background-color: #f0f0f0;
      padding: 0.5rem;
      height: 100%;
    }
  }
  </style>