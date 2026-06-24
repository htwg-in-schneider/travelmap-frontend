import { watch } from 'vue'
import { createRouter, createWebHistory, type NavigationGuard, type RouteLocationNormalized } from 'vue-router'
import { auth0, isAuthConfigured, loginWithRedirectSafe } from '@/auth0'
import { fetchMe } from '@/services/api'
import { syncProfileFrom } from '@/composables/useUserRole'
import HomeView from '@/views/HomeView.vue'
import FeedView from '@/views/FeedView.vue'
import TripDetail from '@/views/TripDetail.vue'
import CreateTripStep0 from '@/views/CreateTripStep0.vue'
import CreateTripStep1 from '@/views/CreateTripStep1.vue'
import CreateTripStep2 from '@/views/CreateTripStep2.vue'
import EditTripView from '@/views/EditTripView.vue'
import ProfileView from '@/views/ProfileView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import SupportView from '@/views/SupportView.vue'
import MarketingView from '@/views/MarketingView.vue'
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
    }
    return { name: 'home' }
  } catch {
    return { name: 'home' }
  }
}

const supportGuard: NavigationGuard = async (to) => {
  const authResult = await ensureAuthenticated(to)
  if (authResult !== true) return authResult
  try {
    const me = await fetchMe()
    if (me.role === 'support' || me.admin) {
      return true
    }
    return { name: 'home' }
  } catch {
    return { name: 'home' }
  }
}

const marketingGuard: NavigationGuard = async (to) => {
  const authResult = await ensureAuthenticated(to)
  if (authResult !== true) return authResult
  try {
    const me = await fetchMe()
    if (me.role === 'marketing' || me.admin) {
      return true
    }
    return { name: 'home' }
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
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      beforeEnter: adminGuard,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      redirect: { name: 'admin-dashboard', query: { tab: 'users' } },
      beforeEnter: adminGuard,
    },
    {
      path: '/support',
      name: 'support',
      component: SupportView,
      beforeEnter: supportGuard,
    },
    {
      path: '/marketing',
      name: 'marketing',
      component: MarketingView,
      beforeEnter: marketingGuard,
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
  if (['admin-dashboard', 'admin-users', 'support', 'marketing'].includes(to.name as string)) return true
  try {
    const me = await fetchMe()
    syncProfileFrom(me)
    const onPublicEntry = to.name === 'home' || to.name === 'feed'
    if (onPublicEntry) {
      if (me.admin) return { name: 'admin-dashboard' }
      if (me.role === 'support') return { name: 'support' }
      if (me.role === 'marketing') return { name: 'marketing' }
    }
  } catch {
    // ignore: let the route resolve normally if /api/me is unreachable
  }
  return true
})

export default router
