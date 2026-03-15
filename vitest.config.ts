import { defineConfig } from 'vitest/config'
import path from 'path'
import { readFileSync } from 'fs'

// Load .env.local for test environment (Vitest does not load Next.js env files by default)
function loadEnvLocal(): Record<string, string> {
  try {
    const content = readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: loadEnvLocal(),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
