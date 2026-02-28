<script setup lang="ts">
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const router = useRouter()

async function submit() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })

    await router.push('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage ?? 'Falha na autenticação'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
    <div class="panel w-full p-6">
      <p class="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted-foreground))]">Mission Control</p>
      <h1 class="mt-1 text-xl font-semibold">Entrar</h1>

      <form class="mt-5 space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide">Email</label>
          <input
            v-model="email"
            class="w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm"
            placeholder="voce@empresa.com"
            type="email"
            required
          >
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide">Senha</label>
          <input
            v-model="password"
            class="w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm"
            placeholder="********"
            type="password"
            required
          >
        </div>

        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

        <button
          class="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-slate-100 dark:text-slate-900"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Processando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>