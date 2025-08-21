<template>
    <div class="pa-1 text-center">
      <v-dialog
        width="auto"
        scrollable
      >
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            color="#2F3F64"
            text="St. Nicholas Academy General Privacy Notice"
            variant="text"
            v-bind="activatorProps"
            class="policy-btn"
          ></v-btn>
        </template>
  
        <template v-slot:default="{ isActive }">
          <v-card 
          >
          <h2>St. Nicholas Academy General Privacy Notice</h2>
          <v-card-text class="policy" style="max-width:1000px">
            <p>
              ST. NICHOLAS ACADEMY OF CASTILLEJOS, INC. ("we", "us", or "our") is committed to protecting your privacy. This Privacy Notice explains how we collect, use, disclose, and safeguard your information when you visit our web application.
            </p>
          
            <h4>Information We Collect</h4>
            <p>
              We may collect and process the following categories of personal information:
              <ul>
                <li>Contact Information: such as your name, email address, phone number.</li>
                <li>Usage Data: information about how you interact with our application, including IP address, browser type, and device identifiers.</li>
                <li>Communications: when you contact us or we contact you, we may collect the content of your communications.</li>
              </ul>
            </p>
          
            <h4>How We Use Your Information</h4>
            <p>
              We use the information we collect for the following purposes:
              <ul>
                <li>To provide and maintain our web application;</li>
                <li>To process your requests and transactions;</li>
                <li>To personalize your experience and improve our services;</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </p>
          
            <h4>Sharing of Your Information</h4>
            <p>
              We may share your information with third-party service providers who assist us in operating our application and providing services to you. These service providers are authorized to use your personal information only as necessary to provide these services to us.
            </p>
          
            <h4>Data Security</h4>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, please be aware that no method of transmission over the internet or electronic storage is completely secure.
            </p>
          
            <h4>Your Rights</h4>
            <p>
              You have the right to:
              <ul>
                <li>Access and receive a copy of your personal information;</li>
                <li>Correct any personal information that is inaccurate or incomplete;</li>
                <li>Request deletion of your personal information under certain circumstances;</li>
                <li>Object to the processing of your personal information.</li>
              </ul>
              To exercise these rights, please contact us using the contact information provided below.
            </p>
          
            <h4>Cookies and Similar Technologies</h4>
            <p>
              Our application may use cookies and similar technologies to enhance your experience. You can manage cookies through your browser settings.
            </p>
        
            <h4>Changes to This Privacy Notice</h4>
            <p>
              We may update this Privacy Notice from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the updated Privacy Notice on our website with a new effective date.
            </p>
          
            <h4>Contact Us</h4>
            <p>
              If you have any questions or concerns about our Privacy Notice or our data practices, please contact us at: <br>
              <span class="material-icons">email</span>st_nicholas_academy@hotmail.com <br>
              <span class="material-icons">call</span>+49 6022 261
            </p>
          </v-card-text>
          

            <v-card-actions>
            <v-spacer></v-spacer>

              <v-btn class="button button-cancel"  dark 
                text="Close"
                @click="isActive.value = false"
              ></v-btn>
  
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </div>
  </template>

  <script>
  export default {
    data () {
      return {
        dialog: '',
      }
    },
  }
</script>

<style lang="scss">
.policy-btn{
  font-weight: 900;
  text-decoration: underline;

}

h2{
  color: var(--dark);
  font-weight: 700;
  margin: 1.5rem;
  margin-bottom: 0.5rem;
}
.policy{
  margin: 1rem;

  h4{
    color: var(--dark);
    padding-top: 1.5rem;
    font-weight: 600;
  }
  .material-icons{
    position: relative;
    top: 5px;
    margin-right: 0.5rem;
    color: var(--dark);
  }
}

.button {
  padding: 10px 20px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.button-cancel {
  background-color: #f44336;
  color: white;
}

</style>