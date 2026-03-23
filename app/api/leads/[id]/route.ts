import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate: shared secret header
  const authHeader = request.headers.get('Authorization')
  const expectedToken = process.env.MAKE_WEBHOOK_SECRET
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      id,
      family_name,
      email,
      phone,
      message,
      stage,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      consent_timestamp,
      last_contacted_at,
      signed_at,
      created_at,
      generated_intro_message,
      lcc:lccs (
        id,
        name,
        slug
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(lead)
}
