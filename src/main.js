import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import 'vuetify/dist/vuetify.min.css';
import axios from "axios";

window.axios = axios
axios.defaults.withCredentials = false
// axios.defaults.baseURL = "http://26.81.173.255:8000/api"
//let backendUrl = "http://localhost:8000/api/"
//let backendUrl = "http://127.0.0.1:8000/api/"
//let backendUrl = "http://26.81.173.255:8000/api"
let backendUrl = "http://192.168.181.165:8000/api"
//let backendUrl = "http://192.168.2.150:8000/api"

axios.defaults.baseURL = backendUrl

loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')

