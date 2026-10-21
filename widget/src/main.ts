import '@fontsource-variable/inter'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faChevronDown, faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import { onWidgetOpen } from './lib/embed'
import { useBookingStore } from './stores/booking'

library.add(faCheck, faChevronDown, faChevronLeft, faChevronRight, faXmark)

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(createPinia())

// Повторное открытие модалки после успешной записи — начинаем заново.
const booking = useBookingStore()
onWidgetOpen(() => {
  if (booking.step === 'done') void booking.reset()
})

app.mount('#app')
