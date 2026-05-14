import { ItemCard } from '@/components/play/item-card'
import type { Item } from '@/lib/types'

interface ComparisonAreaProps {
  itemA: Item
  itemB: Item
  highlightedItemId: string | null
  isDisabled: boolean
  onSelectA: () => void
  onSelectB: () => void
}

export function ComparisonArea({
  itemA,
  itemB,
  highlightedItemId,
  isDisabled,
  onSelectA,
  onSelectB,
}: ComparisonAreaProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        둘 중 더 좋아하는 걸 선택하세요
      </p>
      <div className="relative grid grid-cols-2 gap-4">
        <ItemCard
          item={itemA}
          isHighlighted={highlightedItemId === itemA.id}
          isDisabled={isDisabled}
          onClick={onSelectA}
        />
        <ItemCard
          item={itemB}
          isHighlighted={highlightedItemId === itemB.id}
          isDisabled={isDisabled}
          onClick={onSelectB}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-background px-3 py-1 text-xl font-black text-muted-foreground shadow">
            VS
          </span>
        </div>
      </div>
    </div>
  )
}
