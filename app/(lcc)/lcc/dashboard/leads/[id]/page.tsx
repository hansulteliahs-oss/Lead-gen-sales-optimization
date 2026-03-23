import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Lead query — RLS auto-filters by tenant; returns null if not owned by this LCC
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!lead) notFound()

  // LCC query — for automation status (DASH-05)
  const { data: claimsData } = await supabase.auth.getClaims()
  const lccId = claimsData?.claims?.app_metadata?.lcc_id as string
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name, webhook_url, referral_webhook_url')
    .eq('id', lccId)
    .single()

  const createdAtDisplay = new Date(lead.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const lastContactedDisplay = lead.last_contacted_at
    ? new Date(lead.last_contacted_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never'

  const signedAtDisplay = lead.signed_at
    ? new Date(lead.signed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="px-6 py-8">
      {/* Back link */}
      <a
        href="/lcc/dashboard"
        className="text-brand-muted hover:text-brand-body text-sm mb-6 inline-block"
      >
        ← Back to pipeline
      </a>

      {/* Lead detail card */}
      <div className="bg-white border border-brand-gold/30 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1
            data-testid="lead-family-name"
            className="text-2xl font-semibold text-brand-body"
          >
            {lead.family_name}
          </h1>
          <span className="bg-brand-cardBg text-brand-body text-sm rounded-full px-3 py-1 font-medium">
            {lead.stage}
          </span>
        </div>

        {/* Detail rows */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Email</span>
            <span data-testid="lead-email" className="text-brand-body text-sm">
              {lead.email}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Phone</span>
            <span data-testid="lead-phone" className="text-brand-body text-sm">
              {lead.phone ?? '—'}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Source</span>
            <span className="text-brand-body text-sm">
              {lead.utm_source ?? 'Direct'}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Created</span>
            <span data-testid="lead-created-at" className="text-brand-body text-sm">
              {createdAtDisplay}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Last Contacted</span>
            <span className="text-brand-body text-sm">{lastContactedDisplay}</span>
          </div>

          <div className="flex gap-2">
            <span className="text-brand-muted text-sm w-32 flex-shrink-0">Signed At</span>
            <span className="text-brand-body text-sm">{signedAtDisplay}</span>
          </div>

          {lead.message && (
            <div className="flex gap-2">
              <span className="text-brand-muted text-sm w-32 flex-shrink-0">Message</span>
              <span className="text-brand-body text-sm">{lead.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Automation status section (DASH-05) */}
      <section
        data-testid="automations-section"
        className="bg-white border border-brand-gold/30 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-brand-body mb-4">Automations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm">Lead Nurture Webhook</span>
            <span className="text-brand-body text-sm font-medium">
              {lcc?.webhook_url ? 'Webhook configured' : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm">Referral Webhook</span>
            <span className="text-brand-body text-sm font-medium">
              {lcc?.referral_webhook_url ? 'Webhook configured' : 'Not configured'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
