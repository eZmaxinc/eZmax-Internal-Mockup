import { createApp } from 'vue'
import { EzPlugin } from '@ez'
import FrameApp from './FrameApp.vue'
import '@/app.css'

createApp(FrameApp).use(EzPlugin).mount('#app')
