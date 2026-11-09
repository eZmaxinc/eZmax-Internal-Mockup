import { createApp } from 'vue'
import { EzPlugin } from '@ez'
import ShellApp from './ShellApp.vue'
import { router } from './router'
import '@/app.css'

createApp(ShellApp).use(EzPlugin).use(router).mount('#app')
