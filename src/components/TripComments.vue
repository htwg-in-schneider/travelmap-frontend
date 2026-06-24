<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { type Comment } from '@/data'
import { fetchCommentsByTrip, createComment, deleteComment } from '@/services/api'
import { auth0 } from '@/auth0'
import { PaperAirplaneIcon, UserIcon, TrashIcon } from '@heroicons/vue/24/solid'

const { isAuthenticated } = auth0

const props = defineProps<{
  tripId: string | string[]
}>()

const route = useRoute()

const comments = ref<Comment[]>([])
const loading = ref(true)
const error = ref('')
const newCommentText = ref('')
const posting = ref(false)
const postError = ref('')
const deletingIds = ref<Set<number>>(new Set())
const deleteError = ref('')

function resolveTripId(): number {
  const raw = Array.isArray(props.tripId) ? props.tripId[0] : props.tripId
  return Number(raw)
}

async function loadComments() {
  loading.value = true
  error.value = ''
  try {
    comments.value = await fetchCommentsByTrip(props.tripId)
  } catch (err) {
    console.error('Error fetching comments:', err)
    error.value = 'Fehler beim Laden der Kommentare.'
  } finally {
    loading.value = false
    if (route.hash === '#comments') {
      await nextTick()
      const el = document.getElementById('comments')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}

async function postComment() {
  const text = newCommentText.value.trim()
  if (!text) return

  posting.value = true
  postError.value = ''
  try {
    await createComment({
      text,
      trip: { id: resolveTripId() },
    })
    newCommentText.value = ''
    await loadComments()
  } catch (err) {
    console.error('Error posting comment:', err)
    postError.value = 'Fehler beim Posten des Kommentars.'
  } finally {
    posting.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    postComment()
  }
}

async function removeComment(comment: Comment) {
  if (!comment.canDelete) return
  const confirmed = window.confirm('Möchtest du diesen Kommentar wirklich löschen?')
  if (!confirmed) return

  deletingIds.value.add(comment.id)
  deleteError.value = ''
  try {
    await deleteComment(comment.id)
    comments.value = comments.value.filter((c) => c.id !== comment.id)
  } catch (err) {
    console.error('Error deleting comment:', err)
    deleteError.value = 'Fehler beim Löschen des Kommentars.'
  } finally {
    deletingIds.value.delete(comment.id)
  }
}

async function login() {
  try {
    await auth0.loginWithRedirect()
  } catch (err) {
    console.error('[TripComments] loginWithRedirect failed:', err)
  }
}

onMounted(() => loadComments())

watch(() => props.tripId, () => {
  loadComments()
})
</script>

<template>
  <div id="comments" class="mt-10">
    <h3 class="mb-4 text-xl font-semibold text-gray-900">Kommentare</h3>

    <div v-if="isAuthenticated" class="mb-4 flex items-end gap-2">
      <div class="flex-1">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Kommentar hinzufügen..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          :disabled="posting"
          @keydown="onKeydown"
        />
      </div>
      <button
        class="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        :disabled="!newCommentText.trim() || posting"
        @click="postComment"
      >
        <PaperAirplaneIcon class="h-5 w-5" />
      </button>
    </div>
    <div
      v-else
      class="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500"
    >
      <button class="font-medium text-blue-600 hover:underline" @click="login">
        Anmelden
      </button>
      , um einen Kommentar zu schreiben.
    </div>

    <div v-if="postError" class="mb-3 text-sm text-red-500">{{ postError }}</div>
    <div v-if="deleteError" class="mb-3 text-sm text-red-500">{{ deleteError }}</div>

    <div v-if="loading" class="text-gray-500">Laden...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="comments.length > 0" class="flex flex-col gap-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div class="mb-1 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <UserIcon class="h-4 w-4 text-gray-500" />
            <h5 class="font-semibold text-gray-900">{{ comment.authorName ?? 'Anonym' }}</h5>
          </div>
          <button
            v-if="comment.canDelete"
            :disabled="deletingIds.has(comment.id)"
            class="inline-flex items-center gap-1 rounded-lg p-1 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            :title="deletingIds.has(comment.id) ? 'Löschen…' : 'Kommentar löschen'"
            @click="removeComment(comment)"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <p class="text-sm text-gray-600">{{ comment.text }}</p>
      </div>
    </div>
    <div v-else class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      Noch keine Kommentare vorhanden.
    </div>
  </div>
</template>
