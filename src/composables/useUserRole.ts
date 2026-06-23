import { ref, watch } from 'vue'
import { auth0 } from '@/auth0'
import { fetchMe } from '@/services/api'

// Module-level so the /api/me call happens once per login, not once per component.
const isAdmin = ref(false)
const displayName = ref<string | null>(null)
const username = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)
const profileFetched = ref(false)

watch(
  auth0.isAuthenticated,
  async (authenticated) => {
    if (!authenticated) {
      isAdmin.value = false
      displayName.value = null
      username.value = null
      avatarUrl.value = null
      profileFetched.value = false
      return
    }
    try {
      const me = await fetchMe()
      isAdmin.value = me.admin
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

export function useUserRole() {
  return { isAdmin, displayName, username, avatarUrl, profileFetched }
}