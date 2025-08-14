import { createRouter, createWebHistory } from 'vue-router'
import TrabajadorView from './views/TrabajadorView.vue'

const routes = [
  {
    path: '/',
    redirect: '/trabajador' // Redirige a tu dashboard
  },
  {
    path: '/trabajador',
    name: 'trabajador',
    component: TrabajadorView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router