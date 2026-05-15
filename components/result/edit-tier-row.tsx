"use client"

import { GripVerticalIcon } from 'lucide-react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TierBadge } from '@/components/common/tier-badge'
import { EditItemCard } from '@/components/result/edit-item-card'
import { cn } from '@/lib/utils'
import type { ResultWithItem, Tier } from '@/lib/types'

interface EditTierRowProps {
  tier: Tier
  items: ResultWithItem[]
}

export function EditTierRow({ tier, items }: EditTierRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `tier-${tier}`,
    data: { type: 'tier', tier },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-tier-${tier}`,
    data: { tier },
  })

  const tierHandleStyle = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setDropRef}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        isOver && 'border-primary bg-primary/5',
        isDragging && 'opacity-40',
      )}
    >
      {/* 티어 핸들 */}
      <div
        ref={setDragRef}
        style={tierHandleStyle}
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted touch-none"
        title="드래그하여 티어 전체 이동"
      >
        <GripVerticalIcon className="size-4" />
      </div>

      {/* 티어 배지 */}
      <TierBadge tier={tier} size="lg" className="mt-1 shrink-0" />

      {/* 아이템 목록 */}
      <div
        className="flex min-h-[4rem] flex-1 flex-wrap gap-3"
      >
        {items.map((result) => (
          <EditItemCard key={result.item.id} result={result} />
        ))}
        {items.length === 0 && (
          <div className="flex items-center text-xs text-muted-foreground/50 italic">
            여기로 드롭하세요
          </div>
        )}
      </div>
    </div>
  )
}
