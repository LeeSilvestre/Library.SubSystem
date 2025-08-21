<template>
    <main>
      <div class="top-container">
        <div class="Records">
          <span class="material-icons">report</span>
          <span class="text">Report</span>
        </div>
      </div>  
      <hr>
  
      <div class="main-content">
        <div class="record-table">
          <ReportTable/>
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import ReportTable from '../components/ReportTable.vue';
  
  export default {
    components: {
      ReportTable
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .top-container {
    display: flex;
    margin: 0.5rem;
  
    .Records {
      flex: 1;
  
      .material-icons {
        color: var(--dark);
        font-size: 2.5rem;
      }
  
      .text {
        position: relative;
        color: var(--dark);
        font-size: 1.5rem;
        font-weight: 900;
        bottom: 0.5rem;
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