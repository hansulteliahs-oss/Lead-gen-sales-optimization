import Anthropic from '@anthropic-ai/sdk'

// IMPORTANT: Only call this from server-side code (Server Actions, Route Handlers).
// NEVER import in Client Components — ANTHROPIC_API_KEY must not reach the browser.
export function createAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('[createAnthropicClient] ANTHROPIC_API_KEY env var is not set')
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 0, // Disable retries — fire-and-forget; failure leaves field null
  })
}
