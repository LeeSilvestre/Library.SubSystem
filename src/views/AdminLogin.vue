<template >
  <v-app class="app">
      <v-container class=" fill-height" fluid>
        <v-row align="center" justify="center" >
          <v-col cols="12" sm="8" md="8" >
            <v-card class="elevation-12">
              <v-window v-model="step">
                  <v-row>
                    <v-col cols="12" md="5" class="rectangle-color">
                      
                      <v-card-text class="white--text mt-16 pt-14 mx-auto">
                        <div class="logo-container">
                        <!-- Logo positioned at the right side -->
                        <img src="/src/assets/schoolLogo3.png" max-height="900" max-width="900" class="logo">
                      </div>
                      <div class="text-container text-center">
                        <h1 class="mt-auto h1 font-weight-black">ST.NICHOLAS ACADEMY OF CASTILLEJOS INC.</h1>
                        <p class="h6 font-weight-normal">CASTILLEJOS, ZAMBALES</p>
                      </div>
                      
                    </v-card-text>
                    </v-col>
                    <v-col cols="12" md="7" class=""form-col>
                      
                      <v-card-text class="mt-1">
                        <div class="text-center">
                        <div class="text-center mb-1">
                          <img src="/src/assets/schoolLogo.png" class="logo-logo">
                        </div>
                        <h2 class="text-center lh-0 fs-4 fw-normal">
                          Welcome to  <span class="sna-text">SNACI!</span>
                        </h2>
                        <h4 class="text-center pt-0 fs-6">
                           LIBRARY ADMIN PORTAL
                        </h4>
                        <v-form novalidate autocomplete="off" class="center">
                          <v-text-field 
                            class="text-field"
                            v-model="email"
                            label="Email/ID"
                            name="Email"
                            prepend-icon="mdi-email"
                            type="text"
                            color="var(--dark)"
                            />
                          <v-text-field
                            class="text-field"
                            v-model="password"
                            label="Password"
                            name="Password"
                            prepend-icon="mdi-lock"
                            type="password"
                            color="var(--dark)"
                            />
                        </v-form> 
                        </div>
                      </v-card-text>
                      <div class="text-center pb-2 mx-md-auto">
                        <v-btn rectangle color="var(--dark)" @click="login" style="color:white; text-decoration: none; width: auto; font-size: 15px; ">Log in</v-btn>
                      </div>
                      <div class="text-center pb-2" PrivacyPolicy><PrivacyPolicy/>
                      </div>
                    </v-col>
                  </v-row>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-app>
</template>
<script>
import Swal from 'sweetalert2';
import axios from 'axios';
import PrivacyPolicy from '../components/PrivacyPolicy.vue';
 export default {
    components: { PrivacyPolicy },
    data: () => ({
      step: 1,
      email: '',
      password: '',
      errorMessage: '',
      emptyFieldsError: false
    }),
    props: {
      source: String
    },
    created(){
      this.email = '';
      this.password = '';
    },
    methods: {
      login() {
        if (!this.email || !this.password) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Fields cannot be empty!",
          });
        }
        else {
        axios.get('/library/librarian')
          .then(response => {
            const librarians = response.data;
            const librarian = librarians.find(l => l.lib_email === this.email && l.lib_pass === this.password);
            if (librarian) {
              this.$router.push('/librarydashboard');
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Successfully logged in.",
                showConfirmButton: false,
                timer: 1500
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Invalid credentials. Please try again!",
              });
            }
            this.email = '';
            this.password = '';
          })
          .catch(error => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error logging in. Please try again later!",
              });
          });
        };
      }
    }
  }
</script>

<style scoped> 
.center{
  text-align: center;
}

  .error-message {
    color: red;
    font-weight: bold;
  }
  .app {
    position: relative; /* Ensure the parent is positioned relative */
    background-image: url('../assets/newSNA.png');
    background-size: cover;
    background-repeat: no-repeat;
  }

  .app::before {
    content: ''; /* Required for pseudo-elements */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .logo-container {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 300px;
      height: 100%;
      right: 100%; /* Adjust this value to move the container to the left */
  }

  
  .logo {
    width: 600px; 
    height: 100%; 
    object-fit: cover; 
    filter: brightness(250%) grayscale(0%); 
    opacity: 10%;
  }

    .logo-logo {
    max-height: 150px;
    max-width: 150px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .sna-text{
    color: var(--dark);
    text-shadow: 0px 1px, 1px 0px, 1px 1px;
  }
  .text-container {
    position: relative;
    z-index: 1; 
    color: white;
  }
  .rectangle-color{
    background-color: var(--dark);
  }
  .form-col{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .text-field {
  width: 500px; 
  margin: 0 auto; 
}
  
</style>

