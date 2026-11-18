import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TaskView from './views/TaskView.vue'
import ExampleView from './views/ExampleView.vue'
import GalleryView from './views/GalleryView.vue'
import ShareView from './views/ShareView.vue'

export const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
      { path: '/', component: HomeView },
      { path: '/p/:taskId/:versionId?', component: TaskView, props: true },
      { path: '/e/:name', component: ExampleView, props: true },
      { path: '/gallery', component: GalleryView },
      // Clean shared links: /mockup/<slug> (or /mockup/<slug>/<version>), plus legacy /s/<code>
      { path: '/mockup/:taskId/:versionId?', component: ShareView, props: true },
      { path: '/s/:code', component: ShareView, props: true },
      // Unknown routes redirect to root with the direct-link / not-found message
      { path: '/:pathMatch(.*)*', redirect: () => ({ path: '/', query: { notfound: '1' } }) },
   ],
})
