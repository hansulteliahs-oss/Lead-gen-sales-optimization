import { describe, it, expect } from 'vitest'
import { createAdminClient } from '@/utils/supabase/admin'

describe('AUTH-06: operator admin client bypasses RLS', () => {
  it('admin client can read all leads across all LCC tenants', async () => {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('leads').select('*')
    expect(error).toBeNull()
    // Should see all 6 leads (3 per LCC from seed)
    expect(data).not.toBeNull()
    expect(data!.length).toBeGreaterThanOrEqual(6)
  })

  it('service role key is NOT in any NEXT_PUBLIC_ env var', () => {
    // Verify the env var name pattern — NEXT_PUBLIC_ vars are bundled into client
    const envKeys = Object.keys(process.env)
    const exposedServiceKey = envKeys.find(
      (k) => k.startsWith('NEXT_PUBLIC_') && k.toLowerCase().includes('service')
    )
    expect(exposedServiceKey).toBeUndefined()
  })
})
