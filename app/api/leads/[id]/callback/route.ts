import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Stages allowed to be set via Make.com callback
// Interested → Contacted: Make.com confirms first contact was made (AUTO-04)
// * → Signed: Make.com notifies when family converts (AUTO-05 referral trigger)
// NOT allowed via callback: Contacted → Qualified (operator action, Phase 3)
const CALLBACK_ALLOWED_STAGES = ['Contacted', 'Signed'] as const
type AllowedStage = (typeof CALLBACK_ALLOWED_STAGES)[number]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate: shared secret header
  const authHeader = request.headers.get('Authorization')
  const expectedToken = process.env.MAKE_WEBHOOK_SECRET
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { stage?: string; last_contacted_at?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { stage, last_contacted_at } = body

  // Validate: at least one field must be provided
  if (!stage && !last_contacted_at) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 422 })
  }

  // Validate stage if provided
  if (stage && !CALLBACK_ALLOWED_STAGES.includes(stage as AllowedStage)) {
    return NextResponse.json(
      {
        error: `Stage '${stage}' cannot be set via callback. Allowed: ${CALLBACK_ALLOWED_STAGES.join(', ')}`,
      },
      { status: 422 }
    )
  }

  const supabase = createAdminClient()

  // Fetch existing lead (need lcc_id for referral webhook lookup)
  const { data: existing, error: fetchError } = await supabase
    .from('leads')
    .select('id, stage, lcc_id')
    .eq('id', params.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Build update payload
  const updates: Record<string, unknown> = {}
  if (last_contacted_at) {
    updates.last_contacted_at = last_contacted_at
  }
  if (stage) {
    updates.stage = stage
    if (stage === 'Signed') {
      updates.signed_at = new Date().toISOString()
    }
  }

  const { error: updateError } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', params.id)

  if (updateError) {
    console.error('[callback] DB update error:', updateError)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Trigger referral webhook when stage transitions to Signed
  if (stage === 'Signed') {
    const { data: lcc } = await supabase
      .from('lccs')
      .select('referral_webhook_url')
      .eq('id', existing.lcc_id)
      .single()

    if (lcc?.referral_webhook_url) {
      try {
        const response = await fetch(lcc.referral_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: params.id }),
          signal: AbortSignal.timeout(10000),
        })
        if (!response.ok) {
          console.error(`[callback] Referral webhook failed: ${response.status}`)
        }
      } catch (err) {
        console.error('[callback] Referral webhook network error:', err)
      }
    }
  }

  return NextResponse.json({ success: true, updated: Object.keys(updates) })
}
