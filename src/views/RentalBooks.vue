<template>
    <main>
      <div class="top-container">
        <h1 class="bg-title">Rental Books</h1>
        <div class="rentalBooks">
          <span class="material-icons">book</span>
          <span class="text">Rental Books</span>
        </div>
      </div>
      <hr>
      <div class="main-content">
        <div class="rentalbooks-table">
          <RentalBooksTable />
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import RentalBooksTable from '../components/RentalBooksTable.vue';
  
  export default {
    components: {
      RentalBooksTable
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
  
    .rentalBooks {
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
  
    .rentalbooks-table {
      border-radius: 10px;
      background-color: #f0f0f0;
      padding: 0.5rem;
      height: 100%;
    }
  }
  </style>
  