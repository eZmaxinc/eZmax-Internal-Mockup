import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TaskView from './views/TaskView.vue'
import ExampleView from './views/ExampleView.vue'
import GalleryView from './views/GalleryView.vue'

export const router = createRouter({
   history: createWebHashHistory(),
   routes: [
      { path: '/', component: HomeView },
      { path: '/p/:taskId/:versionId?', component: TaskView, props: true },
      { path: '/e/:name', component: ExampleView, props: true },
      { path: '/gallery', component: GalleryView },
   ],
})
