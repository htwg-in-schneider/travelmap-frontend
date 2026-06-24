import { ref, watch, computed } from 'vue'
import { auth0 } from '@/auth0'
import { fetchMe } from '@/services/api'

// Module-level so the /api/me call happens once per login, not once per component.
const isAdmin = ref(false)
const role = ref<string>('user')
const displayName = ref<string | null>(null)
const username = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)
const profileFetched = ref(false)

const isSupport = computed(() => role.value === 'support')
const isMarketing = computed(() => role.value === 'marketing')

watch(
  auth0.isAuthenticated,
  async (authenticated) => {
    if (!authenticated) {
      isAdmin.value = false
      role.value = 'user'
      displayName.value = null
      username.value = null
      avatarUrl.value = null
      profileFetched.value = false
      return
    }
    try {
      const me = await fetchMe()
      isAdmin.value = me.admin
      role.value = me.role ?? 'user'
      displayName.value = me.displayName
      username.value = me.username
      avatarUrl.value = me.avatarUrl || null
      profileFetched.value = true
    } catch (err) {
      console.error('Failed to load /api/me:', err)
    }
  },
  { immediate: true },
)

export function syncProfileFrom(me: { admin: boolean; role?: string; displayName: string; username: string; avatarUrl?: string | null }) {
  isAdmin.value = me.admin
  role.value = me.role ?? 'user'
  displayName.value = me.displayName
  username.value = me.username
  avatarUrl.value = me.avatarUrl || null
  profileFetched.value = true
}

export function useUserRole() {
  return { isAdmin, isSupport, isMarketing, role, displayName, username, avatarUrl, profileFetched }
}