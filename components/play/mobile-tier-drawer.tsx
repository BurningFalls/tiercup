"use client"

import { useState, useEffect } from 'react'
import { ChevronUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/common/tier-badge'
import { cn } from '@/lib/utils'
import { TIER_ORDER } from '@/lib/constants'
import { groupItemsByTier } from '@/lib/utils'
import type { Item, Tier } from '@/lib/types'

interface MobileTierDrawerProps {
  items: Item[]
  tierMap: Record<string, Tier>
  onFinishEarly: () => void
}

export function MobileTierDrawer({ items, tierMap, onFinishEarly }: MobileTierDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const grouped = groupItemsByTier(items, tierMap)

  // Escape 키로 드로어 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="md:hidden">
      {/* 토글 버튼 — 드로어가 열려있을 때 숨김 */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-1 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-lg"
        >
          <ChevronUpIcon className="size-4" />
          티어 현황 보기
        </button>
      )}

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 드로어 */}
      <div
        className={cn(
          'fixed bottom-0 inset-x-0 z-40 rounded-t-2xl border-t bg-background px-4 pb-8 pt-4 transition-transform duration-300',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">실시간 티어</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-muted-foreground underline"
          >
            닫기
          </button>
        </div>

        <div className="mb-4 space-y-1">
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

        <Button
          className="w-full"
          onClick={() => {
            setIsOpen(false)
            onFinishEarly()
          }}
        >
          지금 결과 확정하기
        </Button>
      </div>
    </div>
  )
}
