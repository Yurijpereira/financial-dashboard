<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import { useAppToast } from '@/composables/useAppToast'

const { user: sessionUser, fetch: refreshSession } = useUserSession()
const toast = useAppToast()

const loading = ref(true)
const loadError = ref(false)
const profileName = ref('')
const profileEmail = ref('')
const tenantName = ref('')
const tenantSlug = ref('')
const userRole = ref('')
const userCreatedAt = ref('')
const tenantCreatedAt = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const savingProfile = ref(false)
const savingPassword = ref(false)
const savingTenant = ref(false)

const isAdmin = computed(() => sessionUser.value?.role === 'ADMIN')

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

async function loadSettings(): Promise<void> {
  try {
    const data = await $fetch<{
      user: { name: string; email: string; role: string; createdAt: string }
      tenant: { name: string; slug: string; createdAt: string }
    }>('/api/settings')
    profileName.value = data.user.name
    profileEmail.value = data.user.email
    userRole.value = data.user.role
    userCreatedAt.value = data.user.createdAt
    tenantName.value = data.tenant.name
    tenantSlug.value = data.tenant.slug
    tenantCreatedAt.value = data.tenant.createdAt
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function saveProfile(): Promise<void> {
  if (savingProfile.value) return
  savingProfile.value = true

  try {
    await $fetch('/api/settings/profile', {
      method: 'PUT',
      body: { name: profileName.value, email: profileEmail.value },
    })
    await refreshSession()
    toast.success({ detail: 'Perfil atualizado com sucesso.' })
  } catch (err: unknown) {
    toast.apiError(err, 'Erro ao salvar perfil.')
  } finally {
    savingProfile.value = false
  }
}

async function savePassword(): Promise<void> {
  if (savingPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    toast.warn({ detail: 'As senhas não coincidem.' })
    return
  }
  savingPassword.value = true

  try {
    await $fetch('/api/settings/password', {
      method: 'PUT',
      body: { currentPassword: currentPassword.value, newPassword: newPassword.value },
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.success({ detail: 'Senha alterada com sucesso.' })
  } catch (err: unknown) {
    toast.apiError(err, 'Erro ao alterar senha.')
  } finally {
    savingPassword.value = false
  }
}

async function saveTenant(): Promise<void> {
  if (savingTenant.value) return
  savingTenant.value = true

  try {
    const res = await $fetch<{ tenant: { id: string; name: string; slug: string } }>(
      '/api/settings/tenant',
      {
        method: 'PUT',
        body: { name: tenantName.value },
      },
    )
    tenantSlug.value = res.tenant.slug
    toast.success({ detail: 'Dados da empresa atualizados.' })
  } catch (err: unknown) {
    toast.apiError(err, 'Erro ao salvar dados da empresa.')
  } finally {
    savingTenant.value = false
  }
}

onMounted(loadSettings)
</script>

<template>
  <section class="flex flex-col gap-6 max-w-3xl">
    <h1 class="text-xl font-semibold text-gray-900">Configurações</h1>

    <div
      v-if="loading"
      class="card-base flex items-center justify-center py-12"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-gray-400" />
    </div>

    <div
      v-else-if="loadError"
      class="card-base border border-red-200"
    >
      <p class="text-sm text-red-700 font-medium">Não foi possível carregar as configurações.</p>
      <p class="text-sm text-gray-500 mt-1">Tente novamente em instantes.</p>
    </div>

    <template v-else>
      <!-- Profile -->
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-indigo-500" />
            <span>Perfil</span>
          </div>
        </template>

        <template #content>
          <form
            class="flex flex-col gap-4"
            @submit.prevent="saveProfile"
          >
            <div class="flex flex-col gap-2">
              <label
                for="profile-name"
                class="text-sm font-medium text-gray-700"
                >Nome</label
              >
              <InputText
                id="profile-name"
                v-model="profileName"
                class="w-full"
                required
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="profile-email"
                class="text-sm font-medium text-gray-700"
                >Email</label
              >
              <InputText
                id="profile-email"
                v-model="profileEmail"
                type="email"
                class="w-full"
                required
              />
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span
                >Função: <strong class="text-gray-700">{{ userRole }}</strong></span
              >
              <span
                >Membro desde:
                <strong class="text-gray-700">{{ formatDate(userCreatedAt) }}</strong></span
              >
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                label="Salvar perfil"
                icon="pi pi-check"
                :loading="savingProfile"
              />
            </div>
          </form>
        </template>
      </Card>

      <!-- Password -->
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-lock text-indigo-500" />
            <span>Alterar senha</span>
          </div>
        </template>

        <template #content>
          <form
            class="flex flex-col gap-4"
            @submit.prevent="savePassword"
          >
            <div class="flex flex-col gap-2">
              <label
                for="current-password"
                class="text-sm font-medium text-gray-700"
                >Senha atual</label
              >
              <InputText
                id="current-password"
                v-model="currentPassword"
                type="password"
                class="w-full"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label
                  for="new-password"
                  class="text-sm font-medium text-gray-700"
                  >Nova senha</label
                >
                <InputText
                  id="new-password"
                  v-model="newPassword"
                  type="password"
                  class="w-full"
                  required
                  minlength="6"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label
                  for="confirm-password"
                  class="text-sm font-medium text-gray-700"
                  >Confirmar nova senha</label
                >
                <InputText
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  class="w-full"
                  required
                  minlength="6"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                label="Alterar senha"
                icon="pi pi-lock"
                :loading="savingPassword"
                severity="warning"
              />
            </div>
          </form>
        </template>
      </Card>

      <!-- Tenant (Admin only) -->
      <Card v-if="isAdmin">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-indigo-500" />
            <span>Dados da empresa</span>
          </div>
        </template>

        <template #content>
          <form
            class="flex flex-col gap-4"
            @submit.prevent="saveTenant"
          >
            <div class="flex flex-col gap-2">
              <label
                for="tenant-name"
                class="text-sm font-medium text-gray-700"
                >Nome da empresa</label
              >
              <InputText
                id="tenant-name"
                v-model="tenantName"
                class="w-full"
                required
              />
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span
                >Slug: <strong class="text-gray-700">{{ tenantSlug }}</strong></span
              >
              <span
                >Criada em:
                <strong class="text-gray-700">{{ formatDate(tenantCreatedAt) }}</strong></span
              >
            </div>

            <div class="flex justify-end">
              <Button
                type="submit"
                label="Salvar empresa"
                icon="pi pi-check"
                :loading="savingTenant"
              />
            </div>
          </form>
        </template>
      </Card>
    </template>
  </section>
</template>
