import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TripDetail from '@/views/TripDetail.vue'
import CreateTripStep1 from '@/views/CreateTripStep1.vue'
import CreateTripStep2 from '@/views/CreateTripStep2.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/trip/:id',
      name: 'trip-detail',
      component: TripDetail,
    },
    {
      path: '/trip/create/1',
      name: 'create-trip-step1',
      component: CreateTripStep1,
    },
    {
      path: '/trip/create/2',
      name: 'create-trip-step2',
      component: CreateTripStep2,
    },
  ],
})

export default router
