import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/login',
      name:'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path:'/signup',
      name:'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path:'/admin-crud',
      name:'admin-crud',
      component: () => import('../views/AdminCrudView.vue'),
    },
    {
      path:'/cipher-puzzle',
      name:'cipher-puzzle',
      component: () => import('../views/CipherPuzzleView.vue'),
    }
  ]
})

export default router
