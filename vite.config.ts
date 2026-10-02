import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [RubyPlugin(), react()],
  resolve: {
    alias: {
      // storm-react-diagrams expects `_` to resolve to lodash
      _: path.resolve(rootDir, 'node_modules/lodash'),
      // Webpacker resolved_paths included vendor/assets
      redactor: path.resolve(rootDir, 'vendor/assets/redactor'),
    },
  },
})
