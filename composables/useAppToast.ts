import { useToast } from 'primevue/usetoast'

interface ToastOptions {
  detail: string
  summary?: string
  life?: number
}

export function useAppToast() {
  const toast = useToast()

  function success({ detail, summary = 'Sucesso', life = 3000 }: ToastOptions): void {
    toast.add({ severity: 'success', summary, detail, life })
  }

  function error({ detail, summary = 'Erro', life = 5000 }: ToastOptions): void {
    toast.add({ severity: 'error', summary, detail, life })
  }

  function warn({ detail, summary = 'Atenção', life = 4000 }: ToastOptions): void {
    toast.add({ severity: 'warn', summary, detail, life })
  }

  function info({ detail, summary = 'Info', life = 3000 }: ToastOptions): void {
    toast.add({ severity: 'info', summary, detail, life })
  }

  function extractErrorMessage(err: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
    const e = err as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }
    return e.data?.statusMessage || e.data?.message || e.statusMessage || e.message || fallback
  }

  function apiError(err: unknown, fallback?: string): void {
    error({ detail: extractErrorMessage(err, fallback) })
  }

  return { success, error, warn, info, apiError, extractErrorMessage }
}
