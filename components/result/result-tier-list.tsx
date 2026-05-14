import Image from 'next/image'
import { TierBadge } from '@/components/common/tier-badge'
import { TIER_ORDER } from '@/lib/constants'
import type { ResultWithItem, Tier } from '@/lib/types'

interface ResultTierListProps {
  results: ResultWithItem[]
}

export function ResultTierList({ results }: ResultTierListProps) {
  const DISPLAY_TIERS: Tier[] = TIER_ORDER.filter((t) => t !== '?')

  const grouped = DISPLAY_TIERS.reduce<Record<Tier, ResultWithItem[]>>(
    (acc, tier) => {
      acc[tier] = results.filter((r) => r.tier === tier).sort((a, b) => a.tier_order - b.tier_order)
      return acc
    },
    {} as Record<Tier, ResultWithItem[]>,
  )

  return (
    <div className="flex flex-col divide-y">
      {DISPLAY_TIERS.map((tier) => {
        const items = grouped[tier]
        if (items.length === 0) return null
        return (
          <div key={tier} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
            <TierBadge tier={tier} size="lg" className="mt-1 shrink-0" />
            <div className="flex flex-wrap gap-3">
              {items.map(({ item }) => (
                <div key={item.id} className="flex flex-col items-center gap-1">
                  <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <span className="max-w-16 truncate text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
