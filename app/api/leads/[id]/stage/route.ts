import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'

const VALID_STAGES = ['Interested', 'Contacted', 'Qualified', 'Signed'] as const
type ValidStage = (typeof VALID_STAGES)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Step 1: Authenticate via JWT session cookie — operator only
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data } = await supabase.auth.getClaims()
  const role = data?.claims?.app_metadata?.role
  if (role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Step 2: Validate request body
  let body: { stage?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { stage } = body
  if (!stage || !VALID_STAGES.includes(stage as ValidStage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 422 })
  }

  // Step 3: Build update payload — set signed_at when transitioning to Signed
  const updates: Record<string, unknown> = { stage }
  if (stage === 'Signed') {
    updates.signed_at = new Date().toISOString()
  }

  // Step 4: Apply update via admin client (bypasses RLS — operator can update any LCC's lead)
  const adminClient = createAdminClient()
  const { data: updatedLead, error } = await adminClient
    .from('leads')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error || !updatedLead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(updatedLead)
}
