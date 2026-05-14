import Link from "next/link"
import { TierCupCard } from "@/components/tiercup/tiercup-card"
import type { TierCup } from "@/lib/types"

interface TierCupSectionProps {
  title: string
  tiercups: TierCup[]
  moreHref: string
  likedIds: Set<string>
  onShare: (tiercup: TierCup) => void
  onLike: (tiercup: TierCup) => void
}

export function TierCupSection({
  title,
  tiercups,
  moreHref,
  likedIds,
  onShare,
  onLike,
}: TierCupSectionProps) {
  if (tiercups.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <Link
            href={moreHref}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            더보기 →
          </Link>
        </div>
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 티어컵이 없어요. 첫 번째로 만들어보세요!
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link
          href={moreHref}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          더보기 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiercups.map((tiercup) => (
          <TierCupCard
            key={tiercup.id}
            tiercup={tiercup}
            onShare={onShare}
            onLike={onLike}
            isLiked={likedIds.has(tiercup.id)}
          />
        ))}
      </div>
    </section>
  )
}
