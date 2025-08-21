<template>
    <main>
        <div class="top-container">
          <div class="studentProfile">
                <span class="material-icons">inventory</span>
                <span class="text">Archived Books</span>
          </div>
          <div class="buttons">
              <v-btn class="mb-2" color="primary" dark @click="returnToInventory">Return</v-btn>
          </div>
  
        </div>  
        <hr>
  
        <div class="main-content">
  
            <div class="student-table">
                <BookArchiveTable/>
            </div>
        </div>
  
        
  </main>
  
  </template>
  
  <script>
  // import AddStudent from '../components/AddStudent.vue';
  import BookArchiveTable from '../components/BookArchiveTable.vue';
  
  export default {
  components: {
    // AddStudent,
    BookArchiveTable
  },
  methods:{
    returnToInventory() {
      this.$router.push('/bookinventory');
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
  .top-container{
    display: flex;
    margin: 0.5rem;
    .studentProfile{
        flex: 1;
        
        .material-icons{
            color: var(--dark);
            font-size: 2.5rem;
        }
        .text{
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
    margin-right: 10px;
  
    .student-table{
        border-radius: 10px;
        background-color: #f0f0f0;
        padding: 0.5rem;
        height: 100%;
    }
  }
  
  </style>