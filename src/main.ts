import { createApp } from 'vue'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './app.css'
import App from './App.vue'

createApp(App).use(Quasar).mount('#app')
