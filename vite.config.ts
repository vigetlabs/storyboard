/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const stubStaticAssets = {
  name: 'stub-static-assets',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (!process.env.VITEST) return
    if (/\.(gif|png|jpe?g|svg)$/.test(id)) {
      return '\0stub-asset:' + id
    }
  },
  load(id: string) {
    if (id.startsWith('\0stub-asset:')) {
      return 'export default "test-file-stub"'
    }
  },
}

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
    stubStaticAssets,
  ],
  resolve: {
    alias: {
      // storm-react-diagrams expects `_` to resolve to lodash
      _: path.resolve(rootDir, 'node_modules/lodash'),
      // Webpacker resolved_paths included vendor/assets
      redactor: path.resolve(rootDir, 'vendor/assets/redactor'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.tsx'],
    include: ['**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: path.resolve(rootDir, 'coverage-js'),
      reporter: ['text', 'json-summary'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'test/**',
        'vite-env.d.ts',
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 80,
        branches: 70,
      },
    },
  },
})
