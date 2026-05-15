import Image from 'next/image'
import { TrophyIcon, ThumbsDownIcon, SwordsIcon } from 'lucide-react'
import type { Item } from '@/lib/types'

interface ItemCardProps {
  item: Item
}

function HighlightItemCard({ item }: ItemCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <span className="max-w-20 truncate text-center text-sm font-medium">{item.name}</span>
    </div>
  )
}

interface StatsHighlightsProps {
  topSTier: Item | null
  topFTier: Item | null
  mostContested: { item_a: Item; item_b: Item } | null
}

export function StatsHighlights({ topSTier, topFTier, mostContested }: StatsHighlightsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* S티어 1위 */}
      <div className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center">
        <div className="flex items-center gap-1.5">
          <TrophyIcon className="size-4 text-yellow-500" />
          <p className="text-sm font-semibold">S티어 1위</p>
        </div>
        {topSTier ? (
          <HighlightItemCard item={topSTier} />
        ) : (
          <p className="text-sm text-muted-foreground">데이터 없음</p>
        )}
      </div>

      {/* F티어 1위 */}
      <div className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center">
        <div className="flex items-center gap-1.5">
          <ThumbsDownIcon className="size-4 text-red-500" />
          <p className="text-sm font-semibold">F티어 1위</p>
        </div>
        {topFTier ? (
          <HighlightItemCard item={topFTier} />
        ) : (
          <p className="text-sm text-muted-foreground">데이터 없음</p>
        )}
      </div>

      {/* 가장 치열한 대결 */}
      <div className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center">
        <div className="flex items-center gap-1.5">
          <SwordsIcon className="size-4 text-blue-500" />
          <p className="text-sm font-semibold">가장 치열한 대결</p>
        </div>
        {mostContested ? (
          <div className="flex items-center gap-3">
            <HighlightItemCard item={mostContested.item_a} />
            <span className="text-sm font-bold text-muted-foreground">VS</span>
            <HighlightItemCard item={mostContested.item_b} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">데이터 없음</p>
        )}
      </div>
    </div>
  )
}
