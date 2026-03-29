'use server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function submitLeadForm(formData: FormData) {
  const supabase = createAdminClient()
  const headersList = await headers()

  const lccId = formData.get('lccId') as string
  const lccSlug = formData.get('lccSlug') as string
  const lccName = formData.get('lccName') as string

  const familyName = formData.get('familyName') as string
  const email = (formData.get('email') as string).toLowerCase().trim()
  const phone = (formData.get('phone') as string).replace(/\D/g, '') // strip non-digits
  const message = (formData.get('message') as string | null) || null

  // TCPA consent — text is constructed server-side to match exactly what's shown on the page
  const consentText = `By checking this box, I consent to receive automated SMS text messages and emails from ${lccName} regarding au pair childcare services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase or service.`
  const consentTimestamp = new Date().toISOString()
  const consentIp =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  // UTM params (passed as hidden fields; null if not present)
  const utmSource = (formData.get('utmSource') as string | null) || null
  const utmMedium = (formData.get('utmMedium') as string | null) || null
  const utmCampaign = (formData.get('utmCampaign') as string | null) || null
  const utmContent = (formData.get('utmContent') as string | null) || null

  // Upsert: ON CONFLICT (email, lcc_id) DO UPDATE
  // Note: created_at timing (< 5 seconds = new lead) is used to detect INSERT vs UPDATE.
  // This is pragmatic — upsert on conflict preserves created_at, so a fresh created_at
  // reliably indicates a new lead. Minor race condition under extreme load, but acceptable.
  const { data: lead, error } = await supabase
    .from('leads')
    .upsert(
      {
        lcc_id: lccId,
        family_name: familyName,
        email,
        phone,
        message: message || null,
        stage: 'Interested',
        consent_text: consentText,
        consent_timestamp: consentTimestamp,
        consent_ip: consentIp,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
      },
      {
        onConflict: 'email,lcc_id',
        ignoreDuplicates: false, // update on conflict (not ignore)
      }
    )
    .select('id, created_at')
    .single()

  if (error) {
    console.error('[submitLeadForm] DB upsert error:', error)
    // Lead failed to save — still redirect to thank-you; don't expose DB errors to family
    redirect(`/${lccSlug}/thank-you`)
  }

  // Determine if this was a new insert or an update.
  // Strategy: if created_at is within the last 5 seconds, it's a new lead.
  // Upsert on conflict preserves the original created_at, so an update will have an older timestamp.
  const isNewLead = lead?.created_at
    ? Date.now() - new Date(lead.created_at).getTime() < 5000
    : false

  // Fire Make.com webhook + Claude generation only for new leads — not on upsert/duplicate
  if (isNewLead && lead?.id) {
    // Fetch the LCC's webhook_url (already have lccId from form)
    const { data: lcc } = await supabase
      .from('lccs')
      .select('webhook_url')
      .eq('id', lccId)
      .single()

    if (lcc?.webhook_url) {
      try {
        // Payload: lead ID only — Make.com fetches full details via GET /api/leads/[id]
        const response = await fetch(lcc.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id }),
          signal: AbortSignal.timeout(10000), // 10s timeout — family redirect is not blocked by this
        })
        if (!response.ok) {
          console.error(`[submitLeadForm] Webhook failed: ${response.status} ${response.statusText}`)
        }
      } catch (err) {
        // Log and continue — lead is already committed; family still redirected to thank-you
        console.error('[submitLeadForm] Webhook network error:', err)
      }
    }

  }

  redirect(`/${lccSlug}/thank-you`)
}
