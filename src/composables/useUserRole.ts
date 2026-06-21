import { computed } from 'vue'
import { auth0 } from '@/auth0'

const ROLES_CLAIM = 'https://travelmap.api/roles'

export function useUserRole() {
  const roles = computed<string[]>(() => (auth0.user.value?.[ROLES_CLAIM] as string[] | undefined) ?? [])
  const isAdmin = computed(() => roles.value.includes('admin'))

  return { roles, isAdmin }
}
