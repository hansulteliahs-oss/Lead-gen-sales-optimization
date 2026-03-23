import { createClient } from '@/utils/supabase/server'

const STAGES = ['Interested', 'Contacted', 'Qualified', 'Signed'] as const
type Stage = typeof STAGES[number]

export default async function LccDashboardPage() {
  const supabase = await createClient()

  // RLS auto-scopes this query to the authenticated LCC's tenant
  const { data: leads } = await supabase
    .from('leads')
    .select('id, family_name, email, phone, stage, utm_source, last_contacted_at, signed_at, created_at')
    .order('created_at', { ascending: false })

  const allLeads = leads ?? []

  // Group by stage in JS — avoids extra DB round-trips at LCC data volumes
  const byStage = Object.fromEntries(
    STAGES.map(s => [s, allLeads.filter(l => l.stage === s)])
  ) as Record<Stage, typeof allLeads>

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold text-brand-body mb-6">Your Pipeline</h1>

      {/* Pipeline stage columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAGES.map((stage) => (
          <div key={stage} data-testid={`stage-${stage}`}>
            {/* Stage header with count badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-brand-body">{stage}</span>
              <span
                data-testid="count-badge"
                className="bg-brand-cardBg text-brand-body text-xs rounded-full px-2 py-0.5"
              >
                {byStage[stage].length}
              </span>
            </div>

            {/* Lead cards */}
            {byStage[stage].length === 0 ? (
              <p className="text-brand-muted text-sm">No leads</p>
            ) : (
              byStage[stage].map((lead) => (
                <a
                  key={lead.id}
                  href={`/lcc/dashboard/leads/${lead.id}`}
                  data-testid="lead-card"
                  className="bg-white border border-brand-gold/30 rounded-lg p-3 mb-2 hover:border-brand-gold block"
                >
                  <p className="text-brand-body font-medium">{lead.family_name}</p>
                  <p className="text-brand-muted text-sm">{lead.email}</p>
                </a>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Commission section — signed count only, no dollar amounts */}
      <div
        data-testid="commission-section"
        className="bg-white border border-brand-gold/30 rounded-lg p-4 mt-8 inline-block"
      >
        <p className="text-brand-muted text-sm mb-1">Signed Families</p>
        <span
          data-testid="signed-count"
          className="text-2xl font-semibold text-brand-body"
        >
          {byStage.Signed.length}
        </span>
      </div>
    </div>
  )
}
