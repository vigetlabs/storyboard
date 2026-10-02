/// <reference types="vite/client" />

declare const SEED: {
  slug: string
  title: string
  description: string
  theme: string
  viewOnly: boolean
  isOffline: boolean
  backButton: boolean
  debuggable: boolean
  characterCard: boolean
  showSource: boolean
  story: {
    story: any
    meta: any
    portMeta: any
  }
}
