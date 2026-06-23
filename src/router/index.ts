import { watch } from 'vue'
import { createRouter, createWebHistory, type NavigationGuardWithThis } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import { auth0 } from '@/auth0'
import { fetchMe } from '@/services/api'
import HomeView from '@/views/HomeView.vue'
import FeedView from '@/views/FeedView.vue'
import TripDetail from '@/views/TripDetail.vue'
import CreateTripStep0 from '@/views/CreateTripStep0.vue'
import CreateTripStep1 from '@/views/CreateTripStep1.vue'
import CreateTripStep2 from '@/views/CreateTripStep2.vue'
import EditTripView from '@/views/EditTripView.vue'
import ProfileView from '@/views/ProfileView.vue'
import AdminUsersView from '@/views/AdminUsersView.vue'
import ImpressumView from '@/views/ImpressumView.vue'
import DatenschutzView from '@/views/DatenschutzView.vue'
import KontaktView from '@/views/KontaktView.vue'

function waitForAuthReady(): Promise<void> {
  if (!auth0.isLoading.value) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(auth0.isLoading, (loading) => {
      if (!loading) {
        stop()
        resolve()
      }
    })
  })
}

// Like authGuard, but additionally requires the admin permission (only known to the
// backend, derived from the access token - see CurrentUserService.isAdmin).
const adminGuard: NavigationGuardWithThis<undefined> = async (to, _from, next) => {
  await waitForAuthReady()
  if (!auth0.isAuthenticated.value) {
    await auth0.loginWithRedirect({ appState: { target: to.fullPath } })
    return
  }
  try {
    const me = await fetchMe()
    if (me.admin) {
      next()
    } else {
      next({ name: 'home' })
    }
  } catch {
    next({ name: 'home' })
  }
}

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
      path: '/feed',
      name: 'feed',
      component: FeedView,
    },
    {
      path: '/u/:username',
      name: 'profile-username',
      component: ProfileView,
    },
    {
      path: '/trip/:id',
      name: 'trip-detail',
      component: TripDetail,
    },
    {
      path: '/trip/create',
      name: 'create-trip-step0',
      component: CreateTripStep0,
      beforeEnter: authGuard,
    },
    {
      path: '/trip/create/1',
      name: 'create-trip-step1',
      component: CreateTripStep1,
      beforeEnter: authGuard,
    },
    {
      path: '/trip/create/2',
      name: 'create-trip-step2',
      component: CreateTripStep2,
      beforeEnter: authGuard,
    },
    {
      path: '/trip/:id/edit',
      name: 'edit-trip',
      component: EditTripView,
      beforeEnter: authGuard,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: authGuard,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      beforeEnter: adminGuard,
    },
    {
      path: '/impressum',
      name: 'impressum',
      component: ImpressumView,
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: DatenschutzView,
    },
    {
      path: '/kontakt',
      name: 'kontakt',
      component: KontaktView,
    },
  ],
})

export default router
