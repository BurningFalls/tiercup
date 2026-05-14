"use client"

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Item } from '@/lib/types'

interface ItemCardProps {
  item: Item
  isHighlighted: boolean
  isDisabled: boolean
  onClick: () => void
}

export function ItemCard({ item, isHighlighted, isDisabled, onClick }: ItemCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'flex w-full flex-col items-center gap-3 rounded-xl border-2 border-transparent p-4 transition-all duration-300',
        'hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isHighlighted && 'border-primary bg-primary/10 scale-[1.02] shadow-lg',
        isDisabled && 'cursor-not-allowed opacity-80',
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {item.image_url && !imgError ? (
          // next/image 미사용 이유: 외부 이미지 도메인 설정이 아직 미정이라 <img> 임시 사용
          // TODO: next.config.ts remotePatterns 설정 후 next/image로 교체
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" />
            {imgError && (
              <span className="text-xs">이미지를 불러올 수 없어요</span>
            )}
          </div>
        )}
      </div>
      <span className="text-center text-base font-semibold leading-snug">{item.name}</span>
    </button>
  )
}
