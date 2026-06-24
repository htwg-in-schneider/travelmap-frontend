<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/vue/24/solid'
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
  ApiError,
} from '@/services/api'
import Button from '@/components/Button.vue'
import OptionsMenu from '@/components/OptionsMenu.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
  ADMIN_USER_LIMITS,
  firstError,
  validateAdminUserFields,
  validationMessageFromApi,
  type AdminUserFieldErrors,
} from '@/utils/formValidation'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')
const saveMessage = ref('')
const saveError = ref('')
const searchTerm = ref('')
const editingId = ref<number | null>(null)
const savingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const userPendingDelete = ref<AdminUser | null>(null)
const editForm = ref<Partial<AdminUser>>({})
const fieldErrors = ref<AdminUserFieldErrors>({})

const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return users.value
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(term) ||
      u.displayName.toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term) ||
      (u.city ?? '').toLowerCase().includes(term) ||
      (u.country ?? '').toLowerCase().includes(term),
  )
})

function formatAddress(user: AdminUser): string {
  const parts = [
    user.street,
    [user.postalCode, user.city].filter(Boolean).join(' '),
    user.country,
  ].filter((part) => part && part.trim().length > 0)
  return parts.length > 0 ? parts.join(', ') : '–'
}

function roleBadgeClass(user: AdminUser): string {
  switch (user.role) {
    case 'admin': return 'bg-blue-100 text-blue-700'
    case 'support': return 'bg-amber-100 text-amber-700'
    case 'marketing': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function roleLabel(user: AdminUser): string {
  switch (user.role) {
    case 'admin': return 'Admin'
    case 'support': return 'Support'
    case 'marketing': return 'Marketing'
    default: return 'User'
  }
}

function startEdit(user: AdminUser) {
  editForm.value = {
    username: user.username,
    displayName: user.displayName,
    email: user.email ?? '',
    bio: user.bio ?? '',
    street: user.street ?? '',
    postalCode: user.postalCode ?? '',
    city: user.city ?? '',
    country: user.country ?? '',
    role: user.role ?? 'user',
  }
  editingId.value = user.id
  saveMessage.value = ''
  saveError.value = ''
  fieldErrors.value = {}
}

function cancelEdit() {
  editingId.value = null
  saveError.value = ''
  fieldErrors.value = {}
}

async function saveEdit(user: AdminUser) {
  const displayName = editForm.value.displayName?.trim() ?? ''
  const username = editForm.value.username?.trim() ?? ''
  const email = editForm.value.email?.trim() ?? ''
  fieldErrors.value = validateAdminUserFields({
    displayName,
    username,
    email,
    bio: editForm.value.bio ?? '',
    street: editForm.value.street ?? '',
    postalCode: editForm.value.postalCode ?? '',
    city: editForm.value.city ?? '',
    country: editForm.value.country ?? '',
    role: editForm.value.role ?? 'user',
  })
  const validationError = firstError(fieldErrors.value)
  if (validationError) {
    saveError.value = validationError
    return
  }

  savingId.value = user.id
  saveError.value = ''
  saveMessage.value = ''

  try {
    const updated = await updateAdminUser(user.id, {
      username,
      displayName,
      email,
      bio: editForm.value.bio?.trim() || null,
      street: editForm.value.street?.trim() || null,
      postalCode: editForm.value.postalCode?.trim() || null,
      city: editForm.value.city?.trim() || null,
      country: editForm.value.country?.trim() || null,
      role: editForm.value.role ?? 'user',
    })
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users.value[index] = updated
    }
    editingId.value = null
    saveMessage.value = 'Benutzer:in gespeichert.'
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error updating user:', err)
    let message = 'Fehler beim Speichern.'
    if (
      err instanceof ApiError &&
      typeof err.body === 'object' &&
      err.body !== null &&
      'error' in err.body
    ) {
      message = validationMessageFromApi(String((err.body as { error: string }).error))
    } else if (err instanceof ApiError && err.status === 403) {
      message = 'Keine Berechtigung.'
    }
    saveError.value = message
  } finally {
    savingId.value = null
  }
}

function requestRemoveUser(user: AdminUser) {
  userPendingDelete.value = user
}

async function removeUser() {
  const user = userPendingDelete.value
  if (!user) return
  deletingId.value = user.id
  saveError.value = ''
  saveMessage.value = ''

  try {
    await deleteAdminUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    if (editingId.value === user.id) {
      editingId.value = null
    }
    userPendingDelete.value = null
    saveMessage.value = 'Benutzer:in gelöscht.'
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error deleting user:', err)
    let message = 'Fehler beim Löschen.'
    if (
      err instanceof ApiError &&
      typeof err.body === 'object' &&
      err.body !== null &&
      'error' in err.body
    ) {
      message = String((err.body as { error: string }).error)
    } else if (err instanceof ApiError && err.status === 403) {
      message = 'Keine Berechtigung.'
    }
    saveError.value = message
  } finally {
    deletingId.value = null
  }
}

onMounted(async () => {
  try {
    users.value = await fetchAdminUsers()
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Fehler beim Laden der Benutzer:innen.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div
      class="mb-6 flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3"
    >
      <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Suchen nach Name, E-Mail, Ort oder Land"
        class="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>

    <div v-if="saveMessage" class="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
      {{ saveMessage }}
    </div>
    <div v-if="error" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
      {{ error }}
    </div>

    <div v-if="loading" class="text-gray-500">Laden...</div>

    <div
      v-else-if="filteredUsers.length === 0"
      class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500"
    >
      Keine Benutzer:innen gefunden.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div class="hidden rounded-2xl border border-gray-200 bg-white md:block">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Adresse</th>
              <th class="px-4 py-3 font-medium">Rolle</th>
              <th class="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in filteredUsers" :key="user.id">
              <tr class="border-t border-gray-100">
                <td class="px-4 py-3 text-gray-900">
                  <div class="font-medium">{{ user.displayName }}</div>
                  <div class="text-xs text-gray-500">@{{ user.username }}</div>
                  <div v-if="user.email" class="text-xs text-gray-500">{{ user.email }}</div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ formatAddress(user) }}</td>
                <td class="px-4 py-3">
                  <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeClass(user)]">
                    {{ roleLabel(user) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <OptionsMenu label="Benutzeroptionen">
                    <template #default="{ close }">
                      <button
                        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                        role="menuitem"
                        @click="close(); startEdit(user)"
                      >
                        <PencilIcon class="h-4 w-4" />
                        Bearbeiten
                      </button>
                      <button
                        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        role="menuitem"
                        :disabled="deletingId === user.id"
                        @click="close(); requestRemoveUser(user)"
                      >
                        <TrashIcon class="h-4 w-4" />
                        {{ deletingId === user.id ? 'Löschen…' : 'Löschen' }}
                      </button>
                    </template>
                  </OptionsMenu>
                </td>
              </tr>
              <tr v-if="editingId === user.id" class="border-t border-gray-100 bg-gray-50">
                <td colspan="4" class="px-4 py-4">
                  <div v-if="saveError" class="mb-3 text-sm text-red-500">{{ saveError }}</div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-name-${user.id}`"
                        >Name *</label
                      >
                      <input
                        :id="`edit-name-${user.id}`"
                        v-model="editForm.displayName"
                        type="text"
                        required
                        :maxlength="ADMIN_USER_LIMITS.displayName"
                        :aria-invalid="fieldErrors.displayName ? 'true' : 'false'"
                        :aria-describedby="`edit-name-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.displayName"
                        :id="`edit-name-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.displayName }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-username-${user.id}`"
                        >Username *</label
                      >
                      <input
                        :id="`edit-username-${user.id}`"
                        v-model="editForm.username"
                        type="text"
                        required
                        :minlength="ADMIN_USER_LIMITS.usernameMin"
                        :maxlength="ADMIN_USER_LIMITS.usernameMax"
                        :aria-invalid="fieldErrors.username ? 'true' : 'false'"
                        :aria-describedby="`edit-username-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.username"
                        :id="`edit-username-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.username }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-email-${user.id}`"
                        >E-Mail</label
                      >
                      <input
                        :id="`edit-email-${user.id}`"
                        v-model="editForm.email"
                        type="email"
                        :maxlength="ADMIN_USER_LIMITS.email"
                        :aria-invalid="fieldErrors.email ? 'true' : 'false'"
                        :aria-describedby="`edit-email-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.email"
                        :id="`edit-email-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.email }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-street-${user.id}`"
                        >Straße</label
                      >
                      <input
                        :id="`edit-street-${user.id}`"
                        v-model="editForm.street"
                        type="text"
                        :maxlength="ADMIN_USER_LIMITS.street"
                        :aria-invalid="fieldErrors.street ? 'true' : 'false'"
                        :aria-describedby="`edit-street-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.street"
                        :id="`edit-street-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.street }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-postal-${user.id}`"
                        >PLZ</label
                      >
                      <input
                        :id="`edit-postal-${user.id}`"
                        v-model="editForm.postalCode"
                        type="text"
                        :maxlength="ADMIN_USER_LIMITS.postalCode"
                        :aria-invalid="fieldErrors.postalCode ? 'true' : 'false'"
                        :aria-describedby="`edit-postal-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.postalCode"
                        :id="`edit-postal-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.postalCode }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-city-${user.id}`"
                        >Ort</label
                      >
                      <input
                        :id="`edit-city-${user.id}`"
                        v-model="editForm.city"
                        type="text"
                        :maxlength="ADMIN_USER_LIMITS.city"
                        :aria-invalid="fieldErrors.city ? 'true' : 'false'"
                        :aria-describedby="`edit-city-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.city"
                        :id="`edit-city-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.city }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-country-${user.id}`"
                        >Land</label
                      >
                      <input
                        :id="`edit-country-${user.id}`"
                        v-model="editForm.country"
                        type="text"
                        :maxlength="ADMIN_USER_LIMITS.country"
                        :aria-invalid="fieldErrors.country ? 'true' : 'false'"
                        :aria-describedby="`edit-country-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.country"
                        :id="`edit-country-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.country }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5 sm:col-span-2">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-bio-${user.id}`"
                        >Bio</label
                      >
                      <textarea
                        :id="`edit-bio-${user.id}`"
                        v-model="editForm.bio"
                        rows="3"
                        :maxlength="ADMIN_USER_LIMITS.bio"
                        :aria-invalid="fieldErrors.bio ? 'true' : 'false'"
                        :aria-describedby="`edit-bio-${user.id}-error`"
                        class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      />
                      <p
                        v-if="fieldErrors.bio"
                        :id="`edit-bio-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.bio }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700" :for="`edit-role-${user.id}`"
                        >Rolle</label
                      >
                      <select
                        :id="`edit-role-${user.id}`"
                        v-model="editForm.role"
                        :aria-invalid="fieldErrors.role ? 'true' : 'false'"
                        :aria-describedby="`edit-role-${user.id}-error`"
                        class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                      >
                        <option value="user">User</option>
                        <option value="support">Support</option>
                        <option value="marketing">Marketing</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p
                        v-if="fieldErrors.role"
                        :id="`edit-role-${user.id}-error`"
                        class="text-sm text-red-500"
                      >
                        {{ fieldErrors.role }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end gap-3">
                    <Button variant="secondary" @click="cancelEdit">
                      <XMarkIcon class="h-4 w-4" />
                      <span class="ml-1.5">Abbrechen</span>
                    </Button>
                    <Button :disabled="savingId === user.id" @click="saveEdit(user)">
                      <CheckIcon class="h-4 w-4" />
                      <span class="ml-1.5">{{ savingId === user.id ? 'Speichern…' : 'Speichern' }}</span>
                    </Button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 md:hidden">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="rounded-2xl border border-gray-200 bg-white p-4"
        >
          <div class="mb-3 flex items-start justify-between">
            <div>
              <div class="font-medium text-gray-900">{{ user.displayName }}</div>
              <div class="text-xs text-gray-500">@{{ user.username }}</div>
              <div v-if="user.email" class="text-xs text-gray-500">{{ user.email }}</div>
            </div>
            <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeClass(user)]">
              {{ roleLabel(user) }}
            </span>
          </div>
          <div class="mb-3 text-sm text-gray-600">{{ formatAddress(user) }}</div>
          <OptionsMenu label="Benutzeroptionen">
            <template #default="{ close }">
              <button
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                role="menuitem"
                @click="close(); startEdit(user)"
              >
                <PencilIcon class="h-4 w-4" />
                Bearbeiten
              </button>
              <button
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                role="menuitem"
                :disabled="deletingId === user.id"
                @click="close(); requestRemoveUser(user)"
              >
                <TrashIcon class="h-4 w-4" />
                {{ deletingId === user.id ? 'Löschen…' : 'Löschen' }}
              </button>
            </template>
          </OptionsMenu>

          <div v-if="editingId === user.id" class="mt-4 border-t border-gray-100 pt-4">
            <div v-if="saveError" class="mb-3 text-sm text-red-500">{{ saveError }}</div>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700" :for="`mobile-edit-name-${user.id}`"
                  >Name *</label
                >
                <input
                  :id="`mobile-edit-name-${user.id}`"
                  v-model="editForm.displayName"
                  type="text"
                  required
                  :maxlength="ADMIN_USER_LIMITS.displayName"
                  :aria-invalid="fieldErrors.displayName ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-name-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.displayName"
                  :id="`mobile-edit-name-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.displayName }}
                </p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-sm font-medium text-gray-700"
                  :for="`mobile-edit-username-${user.id}`"
                  >Username *</label
                >
                <input
                  :id="`mobile-edit-username-${user.id}`"
                  v-model="editForm.username"
                  type="text"
                  required
                  :minlength="ADMIN_USER_LIMITS.usernameMin"
                  :maxlength="ADMIN_USER_LIMITS.usernameMax"
                  :aria-invalid="fieldErrors.username ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-username-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.username"
                  :id="`mobile-edit-username-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.username }}
                </p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700" :for="`mobile-edit-email-${user.id}`"
                  >E-Mail</label
                >
                <input
                  :id="`mobile-edit-email-${user.id}`"
                  v-model="editForm.email"
                  type="email"
                  :maxlength="ADMIN_USER_LIMITS.email"
                  :aria-invalid="fieldErrors.email ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-email-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.email"
                  :id="`mobile-edit-email-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.email }}
                </p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-sm font-medium text-gray-700"
                  :for="`mobile-edit-street-${user.id}`"
                  >Straße</label
                >
                <input
                  :id="`mobile-edit-street-${user.id}`"
                  v-model="editForm.street"
                  type="text"
                  :maxlength="ADMIN_USER_LIMITS.street"
                  :aria-invalid="fieldErrors.street ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-street-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.street"
                  :id="`mobile-edit-street-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.street }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label
                    class="text-sm font-medium text-gray-700"
                    :for="`mobile-edit-postal-${user.id}`"
                    >PLZ</label
                  >
                  <input
                    :id="`mobile-edit-postal-${user.id}`"
                    v-model="editForm.postalCode"
                    type="text"
                    :maxlength="ADMIN_USER_LIMITS.postalCode"
                    :aria-invalid="fieldErrors.postalCode ? 'true' : 'false'"
                    :aria-describedby="`mobile-edit-postal-${user.id}-error`"
                    class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                  />
                  <p
                    v-if="fieldErrors.postalCode"
                    :id="`mobile-edit-postal-${user.id}-error`"
                    class="text-sm text-red-500"
                  >
                    {{ fieldErrors.postalCode }}
                  </p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700" :for="`mobile-edit-city-${user.id}`"
                    >Ort</label
                  >
                  <input
                    :id="`mobile-edit-city-${user.id}`"
                    v-model="editForm.city"
                    type="text"
                    :maxlength="ADMIN_USER_LIMITS.city"
                    :aria-invalid="fieldErrors.city ? 'true' : 'false'"
                    :aria-describedby="`mobile-edit-city-${user.id}-error`"
                    class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                  />
                  <p
                    v-if="fieldErrors.city"
                    :id="`mobile-edit-city-${user.id}-error`"
                    class="text-sm text-red-500"
                  >
                    {{ fieldErrors.city }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-sm font-medium text-gray-700"
                  :for="`mobile-edit-country-${user.id}`"
                  >Land</label
                >
                <input
                  :id="`mobile-edit-country-${user.id}`"
                  v-model="editForm.country"
                  type="text"
                  :maxlength="ADMIN_USER_LIMITS.country"
                  :aria-invalid="fieldErrors.country ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-country-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.country"
                  :id="`mobile-edit-country-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.country }}
                </p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700" :for="`mobile-edit-bio-${user.id}`"
                  >Bio</label
                >
                <textarea
                  :id="`mobile-edit-bio-${user.id}`"
                  v-model="editForm.bio"
                  rows="3"
                  :maxlength="ADMIN_USER_LIMITS.bio"
                  :aria-invalid="fieldErrors.bio ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-bio-${user.id}-error`"
                  class="resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                />
                <p
                  v-if="fieldErrors.bio"
                  :id="`mobile-edit-bio-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.bio }}
                </p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-gray-700" :for="`mobile-edit-role-${user.id}`"
                  >Rolle</label
                >
                <select
                  :id="`mobile-edit-role-${user.id}`"
                  v-model="editForm.role"
                  :aria-invalid="fieldErrors.role ? 'true' : 'false'"
                  :aria-describedby="`mobile-edit-role-${user.id}-error`"
                  class="rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-600"
                >
                  <option value="user">User</option>
                  <option value="support">Support</option>
                  <option value="marketing">Marketing</option>
                  <option value="admin">Admin</option>
                </select>
                <p
                  v-if="fieldErrors.role"
                  :id="`mobile-edit-role-${user.id}-error`"
                  class="text-sm text-red-500"
                >
                  {{ fieldErrors.role }}
                </p>
              </div>
            </div>
            <div class="mt-4 flex justify-end gap-3">
              <Button variant="secondary" @click="cancelEdit">
                <XMarkIcon class="h-4 w-4" />
                <span class="ml-1.5">Abbrechen</span>
              </Button>
              <Button :disabled="savingId === user.id" @click="saveEdit(user)">
                <CheckIcon class="h-4 w-4" />
                <span class="ml-1.5">{{ savingId === user.id ? 'Speichern…' : 'Speichern' }}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="userPendingDelete !== null"
      title="Benutzer:in löschen?"
      :message="`Soll '${userPendingDelete?.displayName ?? ''}' (@${userPendingDelete?.username ?? ''}) wirklich gelöscht werden? Alle Reisen, Kommentare und Likes dieser Person werden ebenfalls entfernt.`"
      confirm-label="Benutzer:in löschen"
      :loading="userPendingDelete ? deletingId === userPendingDelete.id : false"
      @cancel="userPendingDelete = null"
      @confirm="removeUser"
    />
  </div>
</template>
