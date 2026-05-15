"use client"

import Image from 'next/image'
import { GripVerticalIcon } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { ResultWithItem } from '@/lib/types'

interface EditItemCardProps {
  result: ResultWithItem
}

export function EditItemCard({ result }: EditItemCardProps) {
  const { item } = result
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { type: 'item', itemId: item.id },
  })

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col items-center gap-1 touch-none select-none',
        isDragging && 'opacity-40',
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
        title="드래그하여 이동"
      >
        <GripVerticalIcon className="size-3" />
      </div>
      <div className="relative size-14 overflow-hidden rounded-lg bg-muted">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <span className="max-w-14 truncate text-xs text-muted-foreground">{item.name}</span>
    </div>
  )
}
