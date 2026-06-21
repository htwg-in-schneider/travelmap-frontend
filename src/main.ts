import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/style.css'
import 'flag-icons/css/flag-icons.min.css'

import App from './App.vue'
import router from './router'
import { auth0 } from './auth0'

const app = createApp(App)

app.use(createPinia())
app.use(auth0)
app.use(router)

app.mount('#app')
