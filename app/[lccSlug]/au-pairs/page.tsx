import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

interface Props {
  params: { lccSlug: string }
}

export default async function AuPairsPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: lcc } = await supabase
    .from('lccs')
    .select('name')
    .eq('slug', params.lccSlug)
    .single()

  if (!lcc) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-brand-body mb-4">
        Understanding the Au Pair Program
      </h1>
      <p className="text-brand-muted leading-relaxed mb-8">
        The au pair program is an excellent option for families seeking flexible, affordable
        live-in childcare with a cultural exchange dimension. Whether you have one child or
        four, an au pair can provide the consistent, personalized care your family needs.
      </p>

      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">

        {/* Section 1: How It Works */}
        <details className="group py-1">
          <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-brand-body hover:text-brand-gold transition-colors">
            How It Works
            <svg
              className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="pb-6 text-brand-muted leading-relaxed">
            <p>
              Au pairs are young adults (ages 18–26) from abroad who live with a host family,
              providing up to 45 hours per week of childcare as part of a federally regulated
              cultural exchange program. They become a true part of your family while sharing
              their language and culture with your children.
            </p>
            <p className="mt-3">
              Cultural Care Au Pair is the agency that matches families with au pair candidates,
              manages the visa process, and provides year-round support. As your Local Childcare
              Coordinator (LCC), I am your local point of contact throughout the entire program —
              from matching through the end of your year together.
            </p>
          </div>
        </details>

        {/* Section 2: Program Costs */}
        <details className="group py-1">
          <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-brand-body hover:text-brand-gold transition-colors">
            Program Costs
            <svg
              className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="pb-6 text-brand-muted leading-relaxed">
            <p>
              The weekly stipend paid directly to your au pair is set by federal law —
              approximately $195.75 per week as of 2024. This is not negotiable and ensures
              fair compensation for all au pairs in the program.
            </p>
            <p className="mt-3">
              The program fee paid to Cultural Care covers candidate matching, J-1 visa support,
              insurance, and 12 months of full program coverage. Total annual cost typically
              falls between $20,000 and $30,000 depending on the plan you choose — often
              significantly less than full-time daycare or a private nanny in major cities.
            </p>
          </div>
        </details>

        {/* Section 3: Au Pair vs. Nanny */}
        <details className="group py-1" open>
          <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-brand-body hover:text-brand-gold transition-colors">
            Au Pair vs. Nanny
            <svg
              className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="pb-6 text-brand-muted leading-relaxed">
            <p className="mb-4">
              Not sure if an au pair is right for your family? Here is a side-by-side comparison
              to help you decide.
            </p>
            <table className="w-full text-sm border-collapse mt-4">
              <thead>
                <tr className="bg-brand-pageBg">
                  <th className="text-left py-2 px-3 font-medium text-brand-body border border-gray-200">Feature</th>
                  <th className="text-left py-2 px-3 font-medium text-brand-body border border-gray-200">Au Pair</th>
                  <th className="text-left py-2 px-3 font-medium text-brand-body border border-gray-200">Nanny</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Cost per week</td>
                  <td className="py-2 px-3 border border-gray-200">~$195.75 (federally set)</td>
                  <td className="py-2 px-3 border border-gray-200">$600–$1,500+ (market rate)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Lives with family</td>
                  <td className="py-2 px-3 border border-gray-200">Yes — live-in arrangement</td>
                  <td className="py-2 px-3 border border-gray-200">Usually no</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Hours per week</td>
                  <td className="py-2 px-3 border border-gray-200">Up to 45 hrs (regulated)</td>
                  <td className="py-2 px-3 border border-gray-200">Varies by contract</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Cultural exchange</td>
                  <td className="py-2 px-3 border border-gray-200">Yes — core program element</td>
                  <td className="py-2 px-3 border border-gray-200">Not typically</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Agency support</td>
                  <td className="py-2 px-3 border border-gray-200">Full matching, visa, LCC</td>
                  <td className="py-2 px-3 border border-gray-200">Agency optional, extra cost</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-gray-200 text-brand-body">Program duration</td>
                  <td className="py-2 px-3 border border-gray-200">12 months (extendable)</td>
                  <td className="py-2 px-3 border border-gray-200">Open-ended</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        {/* Section 4: Common Questions & Myths */}
        <details className="group py-1">
          <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-brand-body hover:text-brand-gold transition-colors">
            Common Questions &amp; Myths
            <svg
              className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="pb-6 text-brand-muted leading-relaxed">
            <ul className="space-y-5">
              <li>
                <p className="font-medium text-brand-body">Myth: Au pairs are only for wealthy families.</p>
                <p className="mt-1">Reality: The au pair program is often more affordable than full-time daycare or a private nanny, especially for families with two or more children. The federally regulated stipend keeps costs predictable.</p>
              </li>
              <li>
                <p className="font-medium text-brand-body">Myth: It is hard to find a good match.</p>
                <p className="mt-1">Reality: Cultural Care Au Pair uses a thorough screening and matching process. You review profiles and interview candidates before committing — you are always in control of who joins your family.</p>
              </li>
              <li>
                <p className="font-medium text-brand-body">Myth: Having a live-in caregiver means no privacy.</p>
                <p className="mt-1">Reality: Most host families find the arrangement works smoothly with clear expectations set upfront. Your LCC helps you navigate boundaries and house rules from day one.</p>
              </li>
              <li>
                <p className="font-medium text-brand-body">Myth: Au pairs can only care for older children.</p>
                <p className="mt-1">Reality: Au pairs can care for children of all ages, including infants, as long as the au pair meets the infant care requirements set by Cultural Care (including specific experience hours with children under two).</p>
              </li>
            </ul>
          </div>
        </details>

      </div>
    </div>
  )
}
