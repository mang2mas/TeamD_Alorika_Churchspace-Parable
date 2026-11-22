import { create } from 'zustand'

interface ToastState {
  message: string
  show: (message: string) => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = create<ToastState>((set) => ({
  message: '',
  show: (message) => {
    if (timer) clearTimeout(timer)
    set({ message })
    timer = setTimeout(() => set({ message: '' }), 2600)
  },
}))

export const toast = (message: string) => useToast.getState().show(message)
