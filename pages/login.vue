<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false,
})

const { fetch: refreshSession } = useUserSession()

const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')

const email = ref('')
const password = ref('')
const name = ref('')
const tenantName = ref('')

function toggleMode(): void {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
}

async function handleSubmit(): Promise<void> {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    if (isLogin.value) {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
        },
      })
    } else {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
          name: name.value,
          tenantName: tenantName.value,
        },
      })
    }

    await refreshSession()
    await navigateTo('/')
  } catch (error: unknown) {
    const e = error as {
      data?: { statusMessage?: string }
      statusMessage?: string
      message?: string
    }
    errorMessage.value =
      e.data?.statusMessage || e.statusMessage || e.message || 'Ocorreu um erro. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-2">
          <i class="pi pi-chart-line text-indigo-500 text-3xl" />
          <h1 class="text-2xl font-bold text-gray-900">FinDash</h1>
        </div>
        <p class="text-gray-500 text-sm">Dashboard financeiro B2B</p>
      </div>

      <Card class="shadow-lg">
        <template #title>
          <h2 class="text-lg font-semibold text-center">
            {{ isLogin ? 'Entrar' : 'Criar conta' }}
          </h2>
        </template>

        <template #content>
          <form
            class="flex flex-col gap-4"
            @submit.prevent="handleSubmit"
          >
            <template v-if="!isLogin">
              <div class="flex flex-col gap-2">
                <label
                  for="name"
                  class="text-sm font-medium text-gray-700"
                >
                  Seu nome
                </label>
                <InputText
                  id="name"
                  v-model="name"
                  placeholder="João Silva"
                  required
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="tenantName"
                  class="text-sm font-medium text-gray-700"
                >
                  Nome da empresa
                </label>
                <InputText
                  id="tenantName"
                  v-model="tenantName"
                  placeholder="Minha Empresa LTDA"
                  required
                  class="w-full"
                />
              </div>
            </template>

            <div class="flex flex-col gap-2">
              <label
                for="email"
                class="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                required
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="password"
                class="text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <InputText
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :minlength="isLogin ? 1 : 6"
                class="w-full"
              />
            </div>

            <Message
              v-if="errorMessage"
              severity="error"
              :closable="false"
            >
              {{ errorMessage }}
            </Message>

            <Button
              type="submit"
              :label="loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'"
              :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'"
              :disabled="loading"
              class="w-full mt-2"
            />

            <div class="text-center">
              <button
                type="button"
                class="text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                @click="toggleMode"
              >
                {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login' }}
              </button>
            </div>

            <div
              v-if="isLogin"
              class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800"
            >
              <strong>Demo:</strong> admin@acme.com / admin123
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>
