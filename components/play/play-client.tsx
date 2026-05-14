"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
// TODO: 실제 API 연동 시 mockInitialTierMap → props 또는 서버 응답으로 교체
// TODO: 실제 API 연동 시 mockTierUpdates → SubmitComparison API 응답으로 교체
import { mockInitialTierMap, mockTierUpdates } from '@/lib/mock/play-session'
import { PlayHeader } from '@/components/play/play-header'
import { ComparisonArea } from '@/components/play/comparison-area'
import { TierSidebar } from '@/components/play/tier-sidebar'
import { MobileTierDrawer } from '@/components/play/mobile-tier-drawer'
import { LeaveWarningDialog } from '@/components/common/leave-warning-dialog'
import type { Item, NextPairResponse, Tier, TierCup } from '@/lib/types'

// ItemCard의 transition-all duration-300과 맞춰야 함
const HIGHLIGHT_DURATION_MS = 300

interface PlayClientProps {
  tierCup: TierCup
  items: Item[]
  initialPairs: NextPairResponse[]
}

export function PlayClient({ tierCup, items, initialPairs }: PlayClientProps) {
  const router = useRouter()
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [tierMap, setTierMap] = useState<Record<string, Tier>>(() =>
    mockInitialTierMap(items),
  )
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false)

  const estimatedTotal = initialPairs[0]?.estimated_total ?? initialPairs.length
  const currentPair = initialPairs[currentPairIndex]

  // 모든 비교 완료 시 결과 페이지로 이동
  useEffect(() => {
    if (currentPairIndex >= initialPairs.length) {
      router.push('/result/mock-result-001')
    }
  }, [currentPairIndex, initialPairs.length, router])

  // 브라우저 이탈 경고 (첫 비교 시작 후부터)
  useEffect(() => {
    if (currentPairIndex === 0) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [currentPairIndex])

  const handleSelect = useCallback(
    (winnerId: string) => {
      if (highlightedItemId !== null) return // 연타 방지

      setHighlightedItemId(winnerId)

      setTimeout(() => {
        setHighlightedItemId(null)
        setCurrentPairIndex((prev) => {
          const nextIndex = prev + 1
          const updates = mockTierUpdates[nextIndex]
          if (updates) {
            setTierMap((tierPrev) => ({ ...tierPrev, ...updates }))
          }
          return nextIndex
        })
      }, HIGHLIGHT_DURATION_MS)
    },
    [highlightedItemId],
  )

  const handleFinishEarly = useCallback(() => {
    router.push('/result/mock-result-001')
  }, [router])

  const handleLeave = useCallback(() => {
    setLeaveWarningOpen(true)
  }, [])

  if (!currentPair) return null

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <PlayHeader
        title={tierCup.title}
        currentCount={currentPairIndex}
        estimatedTotal={estimatedTotal}
        onLeave={handleLeave}
      />

      <div className="mt-6 flex gap-6">
        {/* 메인 비교 영역 */}
        <div className="min-w-0 flex-1">
          <ComparisonArea
            itemA={currentPair.item_a}
            itemB={currentPair.item_b}
            highlightedItemId={highlightedItemId}
            isDisabled={highlightedItemId !== null}
            onSelectA={() => handleSelect(currentPair.item_a.id)}
            onSelectB={() => handleSelect(currentPair.item_b.id)}
          />
        </div>

        {/* 데스크톱 우측 사이드바 */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-72 shrink-0 overflow-y-auto md:block">
          <TierSidebar
            items={items}
            tierMap={tierMap}
            onFinishEarly={handleFinishEarly}
          />
        </aside>
      </div>

      {/* 모바일 하단 드로어 */}
      <MobileTierDrawer
        items={items}
        tierMap={tierMap}
        onFinishEarly={handleFinishEarly}
      />

      <LeaveWarningDialog
        open={leaveWarningOpen}
        onOpenChange={setLeaveWarningOpen}
        onConfirm={() => router.push('/')}
        title="플레이를 그만하시겠어요?"
        description="지금까지의 비교 결과가 저장되지 않아요. 그래도 나가시겠어요?"
      />
    </div>
  )
}
