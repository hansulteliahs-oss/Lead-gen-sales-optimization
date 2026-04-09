'use client'
import { useFormStatus } from 'react-dom'
import { submitLeadForm } from './actions'

interface LeadCaptureFormProps {
  lccId: string
  lccSlug: string
  lccName: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 px-4 bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-60 text-white font-semibold rounded-full text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
    >
      {pending ? 'Submitting...' : 'Get in Touch'}
    </button>
  )
}

export default function LeadCaptureForm({
  lccId,
  lccSlug,
  lccName,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
}: LeadCaptureFormProps) {
  const tcpaText = `By checking this box, I consent to receive automated SMS text messages and emails from ${lccName} regarding au pair childcare services. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase or service.`

  return (
    <form action={submitLeadForm} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="lccId" value={lccId} />
      <input type="hidden" name="lccSlug" value={lccSlug} />
      <input type="hidden" name="lccName" value={lccName} />
      {utmSource && <input type="hidden" name="utmSource" value={utmSource} />}
      {utmMedium && <input type="hidden" name="utmMedium" value={utmMedium} />}
      {utmCampaign && <input type="hidden" name="utmCampaign" value={utmCampaign} />}
      {utmContent && <input type="hidden" name="utmContent" value={utmContent} />}

      {/* Family name */}
      <div>
        <label htmlFor="familyName" className="block text-sm font-semibold text-brand-body mb-1.5">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="familyName"
          name="familyName"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full px-4 py-3 border border-brand-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-brand-body mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className="w-full px-4 py-3 border border-brand-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-brand-body mb-1.5">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="(555) 867-5309"
          pattern="[0-9]{10}"
          title="Please enter a 10-digit US phone number (digits only)"
          className="w-full px-4 py-3 border border-brand-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Message (optional) */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brand-body mb-1.5">
          Message <span className="text-brand-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Tell us a bit about your family and childcare needs..."
          className="w-full px-4 py-3 border border-brand-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none transition-colors"
        />
      </div>

      {/* TCPA consent checkbox */}
      <div className="flex items-start gap-3">
        <input
          id="tcpaConsent"
          name="tcpaConsent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary flex-shrink-0 accent-brand-primary"
        />
        <label htmlFor="tcpaConsent" className="text-xs text-brand-muted leading-snug">
          {tcpaText}
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}
