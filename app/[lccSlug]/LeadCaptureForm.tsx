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
      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-lg text-base transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
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
      {/* Hidden fields — passed to server action via FormData */}
      <input type="hidden" name="lccId" value={lccId} />
      <input type="hidden" name="lccSlug" value={lccSlug} />
      <input type="hidden" name="lccName" value={lccName} />
      {utmSource && <input type="hidden" name="utmSource" value={utmSource} />}
      {utmMedium && <input type="hidden" name="utmMedium" value={utmMedium} />}
      {utmCampaign && <input type="hidden" name="utmCampaign" value={utmCampaign} />}
      {utmContent && <input type="hidden" name="utmContent" value={utmContent} />}

      {/* Family name */}
      <div>
        <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="familyName"
          name="familyName"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Message (optional) */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Tell us a bit about your family and childcare needs..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
      </div>

      {/* TCPA consent checkbox */}
      <div className="flex items-start gap-3">
        <input
          id="tcpaConsent"
          name="tcpaConsent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 flex-shrink-0"
        />
        <label htmlFor="tcpaConsent" className="text-xs text-gray-500 leading-snug">
          {tcpaText}
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}
