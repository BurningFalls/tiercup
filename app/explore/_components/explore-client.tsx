"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SearchBar } from "@/components/common/search-bar"
import { Pagination } from "@/components/common/pagination"
import { copyToClipboard } from "@/lib/utils/clipboard"
import type { TierCup } from "@/lib/types"
import { SortTabs, type SortType } from "./sort-tabs"
import { TierCupGrid } from "./tiercup-grid"

const PAGE_SIZE = 12

interface ExploreClientProps {
  initialTierCups: TierCup[]
  initialTotal: number
  initialSort: SortType
  initialPage: number
  initialSearch: string
}

export function ExploreClient({
  initialTierCups,
  initialTotal,
  initialSort,
  initialPage,
  initialSearch,
}: ExploreClientProps) {
  const router = useRouter()

  const [tierCups] = useState<TierCup[]>(initialTierCups)
  const [total] = useState(initialTotal)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const sort = initialSort
  const page = initialPage
  const search = initialSearch
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const pushParams = useCallback(
    (params: Partial<{ sort: SortType; page: number; search: string }>) => {
      const next = new URLSearchParams()
      next.set("sort", params.sort ?? initialSort)
      next.set("page", String(params.page ?? initialPage))
      const q = params.search !== undefined ? params.search : initialSearch
      if (q) next.set("search", q)
      router.push(`/explore?${next.toString()}`)
    },
    [router, initialSort, initialPage, initialSearch]
  )

  const handleSortChange = (nextSort: SortType) => {
    pushParams({ sort: nextSort, page: 1 })
  }

  const handleSearch = (query: string) => {
    pushParams({ search: query, page: 1 })
  }

  const handlePageChange = (nextPage: number) => {
    pushParams({ page: nextPage })
  }

  const handleShare = useCallback(async (tiercup: TierCup) => {
    const url = `${window.location.origin}/play/${tiercup.play_code}`
    const ok = await copyToClipboard(url)
    if (ok) {
      toast.success("링크가 복사되었어요!")
    } else {
      toast.error("복사에 실패했어요. 다시 시도해주세요.")
    }
  }, [])

  const handleLike = useCallback((tiercup: TierCup) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(tiercup.id)) {
        next.delete(tiercup.id)
      } else {
        next.add(tiercup.id)
      }
      return next
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SortTabs value={sort} onChange={handleSortChange} />
        <SearchBar
          defaultValue={search}
          onSearch={handleSearch}
          className="sm:w-72"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        총 <span className="font-medium text-foreground">{total.toLocaleString()}</span>개
      </div>

      <TierCupGrid
        tierCups={tierCups}
        search={search}
        onShare={handleShare}
        onLike={handleLike}
        likedIds={likedIds}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mt-2"
      />
    </div>
  )
}
