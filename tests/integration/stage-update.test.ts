import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase admin client
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/utils/supabase/admin'

// Mock @supabase/ssr for the JWT role check in PIPE-04
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'

// Wave 0 stubs for PIPE-04 (operator-only stage update endpoint)
// Operator PATCH /api/leads/[id]/stage — role checked via JWT app_metadata.role

describe('Stage Update API (PIPE-04)', () => {
  const LEAD_ID = 'lead-uuid-1234'

  function makePatchRequest(id: string, body: object) {
    return new NextRequest(`http://localhost/api/leads/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // cookies not needed — createServerClient is mocked
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 403 when caller JWT role is not operator', async () => {
    // lcc role should be rejected
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { app_metadata: { role: 'lcc' } } },
        }),
      },
    } as any)

    const { PATCH } = await import('@/app/api/leads/[id]/stage/route')
    const req = makePatchRequest(LEAD_ID, { stage: 'Qualified' })
    const res = await PATCH(req, { params: { id: LEAD_ID } })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 422 for invalid stage value', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { app_metadata: { role: 'operator' } } },
        }),
      },
    } as any)

    const { PATCH } = await import('@/app/api/leads/[id]/stage/route')
    const req = makePatchRequest(LEAD_ID, { stage: 'Invalid' })
    const res = await PATCH(req, { params: { id: LEAD_ID } })
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 200 and updated lead for valid operator request', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { app_metadata: { role: 'operator' } } },
        }),
      },
    } as any)

    const mockLead = { id: LEAD_ID, stage: 'Qualified', signed_at: null }
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockLead, error: null }),
            }),
          }),
        }),
      }),
    }
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

    const { PATCH } = await import('@/app/api/leads/[id]/stage/route')
    const req = makePatchRequest(LEAD_ID, { stage: 'Qualified' })
    const res = await PATCH(req, { params: { id: LEAD_ID } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(LEAD_ID)
  })

  it('sets signed_at when stage is set to Signed', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { app_metadata: { role: 'operator' } } },
        }),
      },
    } as any)

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: LEAD_ID, stage: 'Signed', signed_at: new Date().toISOString() },
            error: null,
          }),
        }),
      }),
    })
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: updateMock,
      }),
    }
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

    const { PATCH } = await import('@/app/api/leads/[id]/stage/route')
    const req = makePatchRequest(LEAD_ID, { stage: 'Signed' })
    const res = await PATCH(req, { params: { id: LEAD_ID } })
    expect(res.status).toBe(200)

    // signed_at must be included in the update payload
    const updateCallArg = updateMock.mock.calls[0][0]
    expect(updateCallArg).toHaveProperty('signed_at')
    expect(updateCallArg.signed_at).toBeTruthy()
  })

  it('does NOT set signed_at when stage is not Signed', async () => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { app_metadata: { role: 'operator' } } },
        }),
      },
    } as any)

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: LEAD_ID, stage: 'Contacted', signed_at: null },
            error: null,
          }),
        }),
      }),
    })
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: updateMock,
      }),
    }
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

    const { PATCH } = await import('@/app/api/leads/[id]/stage/route')
    const req = makePatchRequest(LEAD_ID, { stage: 'Contacted' })
    const res = await PATCH(req, { params: { id: LEAD_ID } })
    expect(res.status).toBe(200)

    // signed_at must NOT be in the update payload for non-Signed stages
    const updateCallArg = updateMock.mock.calls[0][0]
    expect(updateCallArg).not.toHaveProperty('signed_at')
  })
})
