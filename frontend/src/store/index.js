import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Favorites Store ────────────────────────────────────────────────────────
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => {
        const exists = get().favorites.find(f => f.id === item.id)
        if (!exists) set(s => ({ favorites: [...s.favorites, item] }))
      },
      removeFavorite: (id) =>
        set(s => ({ favorites: s.favorites.filter(f => f.id !== id) })),
      isFavorite: (id) => get().favorites.some(f => f.id === id),
    }),
    { name: 'familystream-favorites' }
  )
)

// ─── Watch History Store ─────────────────────────────────────────────────────
export const useHistoryStore = create(
  persist(
    (set, get) => ({
      history: [], // { id, title, poster, media_type, progress, duration, watchedAt }
      addToHistory: (item) => {
        const filtered = get().history.filter(h => h.id !== item.id)
        set({ history: [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50) })
      },
      updateProgress: (id, progress, duration) => {
        set(s => ({
          history: s.history.map(h =>
            h.id === id ? { ...h, progress, duration, watchedAt: Date.now() } : h
          ),
        }))
      },
      getProgress: (id) => {
        const item = get().history.find(h => h.id === id)
        return item?.progress || 0
      },
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'familystream-history' }
  )
)

// ─── UI Store ────────────────────────────────────────────────────────────────
export const useUIStore = create(set => ({
  selectedMedia: null,
  isModalOpen: false,
  openModal: (media) => set({ selectedMedia: media, isModalOpen: true }),
  closeModal: () => set({ selectedMedia: null, isModalOpen: false }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}))
