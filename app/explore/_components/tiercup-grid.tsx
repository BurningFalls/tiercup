import { TierCupCard } from "@/components/tiercup/tiercup-card"
import type { TierCup } from "@/lib/types"

interface TierCupGridProps {
  tierCups: TierCup[]
  search: string
  onShare: (tiercup: TierCup) => void
  onLike: (tiercup: TierCup) => void
  likedIds: Set<string>
}

export function TierCupGrid({
  tierCups,
  search,
  onShare,
  onLike,
  likedIds,
}: TierCupGridProps) {
  if (tierCups.length === 0) {
    const message = search
      ? "검색 결과가 없어요"
      : "아직 티어컵이 없어요. 첫 번째로 만들어보세요!"

    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground">
        {message}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tierCups.map((tiercup) => (
        <TierCupCard
          key={tiercup.id}
          tiercup={tiercup}
          onShare={onShare}
          onLike={onLike}
          isLiked={likedIds.has(tiercup.id)}
        />
      ))}
    </div>
  )
}
