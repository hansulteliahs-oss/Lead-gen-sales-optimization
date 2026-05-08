import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclosureProps {
  question: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  questionTag?: 'h3' | 'h4'
}

export function Disclosure({
  question,
  children,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
  questionTag: QuestionTag = 'h3',
}: DisclosureProps) {
  return (
    <details
      className={cn('group border-b border-brand-ink-rule [&_summary::-webkit-details-marker]:hidden', className)}
      open={defaultOpen}
    >
      <summary
        className={cn(
          'flex items-center justify-between gap-4 py-5 text-left text-brand-ink cursor-pointer list-none transition-colors duration-200 ease-out-quart hover:text-brand-spot-deep',
          triggerClassName,
        )}
      >
        <QuestionTag className="font-medium text-base md:text-lg m-0">
          {question}
        </QuestionTag>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-brand-bark transition-transform duration-200 ease-out-quart group-open:rotate-180"
        />
      </summary>
      <div
        className={cn(
          'pb-5 pt-0 leading-relaxed text-brand-ink-soft opsz-body text-[1.05rem]',
          contentClassName,
        )}
      >
        {children}
      </div>
    </details>
  )
}
