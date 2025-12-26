import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'splash',
      component: () => import('../views/SplashView.vue')
    },
    {
      path:'/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
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
      path:'/dashboard',
      name:'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path:'/worldoverview',
      name:'worldoverview',
      component: () => import('../views/Supabase.vue'),
    },
    {
      path:'/intelligence-hq',
      name:'intelligence-hq',
      component: () => import('../views/IntelligenceHQView.vue'),
    }
  ]
})

export default router
