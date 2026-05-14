import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/common/tier-badge'
import { TIER_ORDER } from '@/lib/constants'
import { groupItemsByTier } from '@/lib/utils'
import type { Item, Tier } from '@/lib/types'

interface TierSidebarProps {
  items: Item[]
  tierMap: Record<string, Tier>
  onFinishEarly: () => void
}

export function TierSidebar({ items, tierMap, onFinishEarly }: TierSidebarProps) {
  const grouped = groupItemsByTier(items, tierMap)

  return (
    <div className="flex h-full flex-col gap-2">
      <p className="text-sm font-semibold">실시간 티어</p>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="flex min-h-8 items-start gap-2 rounded-md px-1 py-1">
            <TierBadge tier={tier} size="sm" className="mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {grouped[tier].map((item) => (
                <div
                  key={item.id}
                  className="size-6 overflow-hidden rounded bg-muted"
                  title={item.name}
                >
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-auto w-full" onClick={onFinishEarly}>
        지금 결과 확정하기
      </Button>
    </div>
  )
}
