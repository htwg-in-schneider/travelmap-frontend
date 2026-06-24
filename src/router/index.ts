import { watch } from 'vue'
import { createRouter, createWebHistory, type NavigationGuard, type RouteLocationNormalized } from 'vue-router'
import { auth0, isAuthConfigured, loginWithRedirectSafe } from '@/auth0'
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

async function ensureAuthenticated(to: RouteLocationNormalized) {
  await waitForAuthReady()
  if (!isAuthConfigured) {
    return { name: 'home', query: { message: 'auth-unavailable' } }
  }
  if (!auth0.isAuthenticated.value) {
    await loginWithRedirectSafe({ appState: { target: to.fullPath } })
    return false
  }
  return true
}

const requireAuth: NavigationGuard = async (to) => ensureAuthenticated(to)

// Like authGuard, but additionally requires the admin permission (only known to the
// backend, derived from the access token - see CurrentUserService.isAdmin).
const adminGuard: NavigationGuard = async (to) => {
  const authResult = await ensureAuthenticated(to)
  if (authResult !== true) return authResult
  try {
    const me = await fetchMe()
    if (me.admin) {
      return true
    } else {
      return { name: 'home' }
    }
  } catch {
    return { name: 'home' }
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
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: requireAuth,
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
      beforeEnter: requireAuth,
    },
    {
      path: '/trip/create/1',
      name: 'create-trip-step1',
      component: CreateTripStep1,
      beforeEnter: requireAuth,
    },
    {
      path: '/trip/create/2',
      name: 'create-trip-step2',
      component: CreateTripStep2,
      beforeEnter: requireAuth,
    },
    {
      path: '/trip/:id/edit',
      name: 'edit-trip',
      component: EditTripView,
      beforeEnter: requireAuth,
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

router.beforeEach(async (to) => {
  await waitForAuthReady()
  if (!auth0.isAuthenticated.value) return true
  if (to.name === 'admin-users') return true
  try {
    const me = await fetchMe()
    if (me.admin && (to.name === 'home' || to.name === 'feed')) {
      return { name: 'admin-users' }
    }
  } catch {
    // ignore: let the route resolve normally if /api/me is unreachable
  }
  return true
})

export default router
