<template>
    <main>
        <div class="top-container">
            <div class="studentProfile">
                <span class="material-icons">auto_stories</span>
                <span class="text">Book Category</span>
            </div>
            <div class="buttons">
                <v-btn class="mb-2" color="primary" dark @click="returnToInventory">Return</v-btn>
            </div>
            <span></span>
            <div class="buttons" style="margin-right: 10px;">
                <v-btn class="mb-2" color="#B71C1C" dark style="color: white;" @click="categoryArchives">Archived Categories</v-btn>
            </div>
  
        </div>  
        <hr>
  
        <div class="main-content">
  
            <div class="category-table">
                <CategoryTable/>
            </div>
        </div>
  
        
  </main>
  
  </template>
  
  <script>
  // import AddStudent from '../components/AddStudent.vue';
  import CategoryTable from '../components/CategoryTable.vue';
  
  export default {
  components: {
    // AddStudent,
    CategoryTable
  },
  methods:{
    returnToInventory() {
      this.$router.push('/bookinventory');
    },
    categoryArchives() {
      this.$router.push('/categoryarchives');
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
  
    .category-table{
        border-radius: 10px;
        background-color: #f0f0f0;
        padding: 0.5rem;
        height: 100%;
    }
  }
  
  
  </style>