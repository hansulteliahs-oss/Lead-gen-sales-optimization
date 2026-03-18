import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase admin client
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/utils/supabase/admin'

// PIPE-02 stage update, PIPE-05 signed_at, AUTO-04 last_contacted_at, AUTO-05 referral trigger
describe('Make.com callback API', () => {
  const VALID_TOKEN = 'test-secret-token-abc123'
  const LEAD_ID = 'lead-uuid-1234'
  const LCC_ID = 'lcc-uuid-5678'

  function makeGetRequest(id: string, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return new NextRequest(`http://localhost/api/leads/${id}`, { method: 'GET', headers })
  }

  function makePostRequest(id: string, body: object, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return new NextRequest(`http://localhost/api/leads/${id}/callback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MAKE_WEBHOOK_SECRET = VALID_TOKEN
  })

  // ── GET /api/leads/[id] ────────────────────────────────────────────────────

  describe('GET /api/leads/[id]', () => {
    it('returns 401 without Authorization header', async () => {
      const { GET } = await import('@/app/api/leads/[id]/route')
      const req = makeGetRequest(LEAD_ID)
      const res = await GET(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('returns 401 with wrong token', async () => {
      const { GET } = await import('@/app/api/leads/[id]/route')
      const req = makeGetRequest(LEAD_ID, 'wrong-token')
      const res = await GET(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(401)
    })

    it('returns 404 for non-existent lead', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } }),
            }),
          }),
        }),
      }
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

      const { GET } = await import('@/app/api/leads/[id]/route')
      const req = makeGetRequest('nonexistent-id', VALID_TOKEN)
      const res = await GET(req, { params: { id: 'nonexistent-id' } })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.error).toBe('Not found')
    })

    it('returns 200 with full lead data including lcc fields', async () => {
      const mockLead = {
        id: LEAD_ID,
        family_name: 'Smith Family',
        email: 'smith@example.com',
        phone: '+15551234567',
        message: 'We need help!',
        stage: 'Interested',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer2026',
        utm_content: null,
        consent_timestamp: '2026-03-17T12:00:00Z',
        last_contacted_at: null,
        signed_at: null,
        created_at: '2026-03-17T12:00:00Z',
        lcc: { id: LCC_ID, name: 'Premier Au Pairs', slug: 'premier-au-pairs' },
      }

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLead, error: null }),
            }),
          }),
        }),
      }
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

      const { GET } = await import('@/app/api/leads/[id]/route')
      const req = makeGetRequest(LEAD_ID, VALID_TOKEN)
      const res = await GET(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.id).toBe(LEAD_ID)
      expect(body.family_name).toBe('Smith Family')
      expect(body.email).toBe('smith@example.com')
      expect(body.lcc.name).toBe('Premier Au Pairs')
      expect(body.lcc.slug).toBe('premier-au-pairs')
    })
  })

  // ── POST /api/leads/[id]/callback ──────────────────────────────────────────

  describe('POST /api/leads/[id]/callback', () => {
    it('returns 401 without Authorization header', async () => {
      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { last_contacted_at: '2026-03-17T12:00:00Z' })
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('returns 401 with wrong token', async () => {
      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { last_contacted_at: '2026-03-17T12:00:00Z' }, 'bad-token')
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(401)
    })

    it('returns 422 with empty body (nothing to update)', async () => {
      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, {}, VALID_TOKEN)
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(422)
      const body = await res.json()
      expect(body.error).toBe('Nothing to update')
    })

    it('returns 422 for stage=Qualified (not allowed via callback)', async () => {
      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { stage: 'Qualified' }, VALID_TOKEN)
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(422)
      const body = await res.json()
      expect(body.error).toContain('Qualified')
    })

    it('returns 404 for non-existent lead', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } }),
            }),
          }),
        }),
      }
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest('nonexistent-id', { stage: 'Contacted' }, VALID_TOKEN)
      const res = await POST(req, { params: { id: 'nonexistent-id' } })
      expect(res.status).toBe(404)
    })

    it('updates last_contacted_at and returns 200', async () => {
      const mockFrom = vi.fn()
      mockFrom
        .mockReturnValueOnce({
          // First call: select existing lead
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: LEAD_ID, stage: 'Interested', lcc_id: LCC_ID },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Second call: update
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })

      vi.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as any)

      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { last_contacted_at: '2026-03-17T12:00:00Z' }, VALID_TOKEN)
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.updated).toContain('last_contacted_at')
    })

    it('updates stage Interested->Contacted and returns 200', async () => {
      const mockFrom = vi.fn()
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: LEAD_ID, stage: 'Interested', lcc_id: LCC_ID },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })

      vi.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as any)

      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { stage: 'Contacted' }, VALID_TOKEN)
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.updated).toContain('stage')
    })

    it('sets stage=Signed, sets signed_at, and fires referral_webhook_url', async () => {
      const referralWebhookUrl = 'https://hook.make.com/referral-trigger'
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

      const mockFrom = vi.fn()
      mockFrom
        .mockReturnValueOnce({
          // Fetch existing lead
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: LEAD_ID, stage: 'Contacted', lcc_id: LCC_ID },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Update lead
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })
        .mockReturnValueOnce({
          // Fetch LCC for referral_webhook_url
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { referral_webhook_url: referralWebhookUrl },
                error: null,
              }),
            }),
          }),
        })

      vi.mocked(createAdminClient).mockReturnValue({ from: mockFrom } as any)

      const { POST } = await import('@/app/api/leads/[id]/callback/route')
      const req = makePostRequest(LEAD_ID, { stage: 'Signed' }, VALID_TOKEN)
      const res = await POST(req, { params: { id: LEAD_ID } })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.updated).toContain('signed_at')

      // Verify referral webhook was fired
      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(fetchSpy).toHaveBeenCalledWith(
        referralWebhookUrl,
        expect.objectContaining({ method: 'POST' })
      )

      fetchSpy.mockRestore()
    })
  })
})
