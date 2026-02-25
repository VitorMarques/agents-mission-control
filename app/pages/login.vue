<script setup lang="ts">
const email = ref('')
const password = ref('')
const name = ref('')
const mode = ref<'login' | 'register'>('login')
const isSubmitting = ref(false)
const errorMessage = ref('')

const router = useRouter()

async function submit() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    if (mode.value === 'register') {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.value,
          email: email.value,
          password: password.value,
        },
      })
    }

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
      <h1 class="mt-1 text-xl font-semibold">{{ mode === 'login' ? 'Entrar' : 'Criar conta inicial' }}</h1>

      <form class="mt-5 space-y-3" @submit.prevent="submit">
        <div v-if="mode === 'register'">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide">Nome</label>
          <input
            v-model="name"
            class="w-full rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm"
            placeholder="Seu nome"
            required
          >
        </div>

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
          {{ isSubmitting ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar e entrar' }}
        </button>
      </form>

      <button
        class="mt-3 text-sm text-[rgb(var(--muted-foreground))] underline"
        type="button"
        @click="mode = mode === 'login' ? 'register' : 'login'"
      >
        {{ mode === 'login' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta' }}
      </button>
    </div>
  </div>
</template>
