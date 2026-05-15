"use client"

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PencilIcon, SaveIcon, XIcon } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { LeaveWarningDialog } from '@/components/common/leave-warning-dialog'
import { EditTierRow } from '@/components/result/edit-tier-row'
import { EditItemCard } from '@/components/result/edit-item-card'
import { TIER_ORDER } from '@/lib/constants'
import type { PlayResultsResponse, ResultWithItem, Tier, TierCup } from '@/lib/types'

interface ResultEditClientProps {
  resultData: PlayResultsResponse
  tierCup: TierCup
  resultCode: string
}

function buildInitialTierMap(results: ResultWithItem[]): Record<string, Tier> {
  return Object.fromEntries(results.map((r) => [r.item.id, r.tier]))
}

export function ResultEditClient({ resultData, tierCup, resultCode }: ResultEditClientProps) {
  const router = useRouter()
  const results = resultData.results

  const initialTierMap = useMemo(() => buildInitialTierMap(results), [results])
  const [tierMap, setTierMap] = useState<Record<string, Tier>>(initialTierMap)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)

  const isDirty = useMemo(
    () => results.some((r) => tierMap[r.item.id] !== initialTierMap[r.item.id]),
    [results, tierMap, initialTierMap],
  )

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  const groupedResults = useMemo(() => {
    return TIER_ORDER.reduce<Record<Tier, ResultWithItem[]>>(
      (acc, tier) => {
        acc[tier] = results
          .filter((r) => tierMap[r.item.id] === tier)
          .sort((a, b) => a.tier_order - b.tier_order)
        return acc
      },
      {} as Record<Tier, ResultWithItem[]>,
    )
  }, [results, tierMap])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeId = String(active.id)
      const overId = String(over.id)

      // droppable-tier-{Tier} 형식에서 티어 추출
      const targetTier = overId.startsWith('droppable-tier-')
        ? (overId.replace('droppable-tier-', '') as Tier)
        : null

      if (!targetTier) return

      if (activeId.startsWith('item-')) {
        const itemId = activeId.replace('item-', '')
        setTierMap((prev) => ({ ...prev, [itemId]: targetTier }))
      } else if (activeId.startsWith('tier-')) {
        const sourceTier = activeId.replace('tier-', '') as Tier
        if (sourceTier === targetTier) return
        setTierMap((prev) => {
          const next = { ...prev }
          for (const r of results) {
            if (next[r.item.id] === sourceTier) next[r.item.id] = targetTier
            else if (next[r.item.id] === targetTier) next[r.item.id] = sourceTier
          }
          return next
        })
      }
    },
    [results],
  )

  const handleSave = useCallback(() => {
    const allUnassigned = results.every((r) => tierMap[r.item.id] === '?')
    if (allUnassigned) {
      setSaveError('최소 1개 아이템은 티어에 배치해주세요.')
      return
    }
    setSaveError(null)
    // TODO: API 연동 시 PATCH /api/results/:resultCode 호출
    router.push(`/result/${resultCode}`)
  }, [results, tierMap, resultCode, router])

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setCancelDialogOpen(true)
    } else {
      router.push(`/result/${resultCode}`)
    }
  }, [isDirty, resultCode, router])

  const activeResult = useMemo(() => {
    if (!activeId || !activeId.startsWith('item-')) return null
    const itemId = activeId.replace('item-', '')
    return results.find((r) => r.item.id === itemId) ?? null
  }, [activeId, results])

  const activeTier = useMemo(() => {
    if (!activeId || !activeId.startsWith('tier-')) return null
    return activeId.replace('tier-', '') as Tier
  }, [activeId])

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PencilIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">{tierCup.title}</h1>
          <span className="text-sm text-muted-foreground">— 티어 수정</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <XIcon className="size-4" />
            취소
          </Button>
          <Button onClick={handleSave}>
            <SaveIcon className="size-4" />
            저장
          </Button>
        </div>
      </div>

      {/* 저장 에러 */}
      {saveError && (
        <p className="mt-3 text-sm text-destructive">{saveError}</p>
      )}

      {/* 티어 목록 */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="mt-6 flex flex-col gap-2">
          {TIER_ORDER.map((tier) => (
            <EditTierRow key={tier} tier={tier} items={groupedResults[tier]} />
          ))}
        </div>

        <DragOverlay>
          {activeResult && (
            <div className="opacity-90">
              <EditItemCard result={activeResult} />
            </div>
          )}
          {activeTier && (
            <div className="rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-lg">
              {activeTier}티어 {groupedResults[activeTier]?.length ?? 0}개
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* 취소 확인 다이얼로그 */}
      <LeaveWarningDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={() => router.push(`/result/${resultCode}`)}
        title="변경사항이 저장되지 않아요."
        description="변경사항을 저장하지 않고 취소할까요?"
      />
    </div>
  )
}
