import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TaskView from './views/TaskView.vue'
import ExampleView from './views/ExampleView.vue'
import GalleryView from './views/GalleryView.vue'
import ShareView from './views/ShareView.vue'

export const router = createRouter({
   history: createWebHashHistory(),
   routes: [
      { path: '/', component: HomeView },
      { path: '/p/:taskId/:versionId?', component: TaskView, props: true },
      { path: '/e/:name', component: ExampleView, props: true },
      { path: '/gallery', component: GalleryView },
      // A shared link: one version, or the versions of one task, behind an opaque code (share.ts)
      { path: '/s/:code', component: ShareView, props: true },
   ],
})
