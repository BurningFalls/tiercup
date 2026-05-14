"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SearchBar } from "@/components/common/search-bar"
import { TierCupSection } from "@/components/home/tier-cup-section"
import { copyToClipboard } from "@/lib/utils/clipboard"
import type { TierCup } from "@/lib/types"

interface HomeClientProps {
  popularTierCups: TierCup[]
  likedTierCups: TierCup[]
  recentTierCups: TierCup[]
}

export function HomeClient({
  popularTierCups,
  likedTierCups,
  recentTierCups,
}: HomeClientProps) {
  const router = useRouter()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const handleShare = async (tiercup: TierCup) => {
    const url = `${window.location.origin}/play/${tiercup.play_code}`
    const success = await copyToClipboard(url)
    if (success) {
      toast.success("링크가 복사되었어요!")
    } else {
      toast.error("복사에 실패했어요. 다시 시도해주세요.")
    }
  }

  // TODO: API 연동 시 서버에 좋아요 상태를 반영해야 함
  const handleLike = (tiercup: TierCup) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(tiercup.id)) {
        next.delete(tiercup.id)
      } else {
        next.add(tiercup.id)
      }
      return next
    })
  }

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/explore?search=${encodeURIComponent(query)}`)
    } else {
      router.push("/explore")
    }
  }

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          className="mx-auto max-w-xl"
        />
      </div>

      <div className="flex flex-col gap-10">
        <TierCupSection
          title="🔥 인기 티어컵"
          tiercups={popularTierCups}
          moreHref="/explore?sort=popular"
          likedIds={likedIds}
          onShare={handleShare}
          onLike={handleLike}
        />
        <TierCupSection
          title="❤️ 사람들이 좋아한 티어컵"
          tiercups={likedTierCups}
          moreHref="/explore?sort=likes"
          likedIds={likedIds}
          onShare={handleShare}
          onLike={handleLike}
        />
        <TierCupSection
          title="🆕 새로운 티어컵"
          tiercups={recentTierCups}
          moreHref="/explore?sort=recent"
          likedIds={likedIds}
          onShare={handleShare}
          onLike={handleLike}
        />
      </div>
    </main>
  )
}
