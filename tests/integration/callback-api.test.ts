import { describe, it, expect } from 'vitest'

// PIPE-02 stage update, PIPE-05 signed_at, AUTO-04 last_contacted_at, AUTO-05 referral trigger
describe('Make.com callback API', () => {
  it.todo('POST /api/leads/[id]/callback with valid secret updates last_contacted_at')
  it.todo('POST /api/leads/[id]/callback with stage=Contacted updates stage')
  it.todo('POST /api/leads/[id]/callback rejects stage transitions other than Interested->Contacted')
  it.todo('POST /api/leads/[id]/callback with stage=Signed sets signed_at timestamp')
  it.todo('Setting stage=Signed fires referral_webhook_url')
  it.todo('POST /api/leads/[id]/callback without valid Authorization header returns 401')
  it.todo('GET /api/leads/[id] without valid Authorization header returns 401')
  it.todo('GET /api/leads/[id] returns lead with all fields Make.com needs')
})
