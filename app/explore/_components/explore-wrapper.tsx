import type { SortType } from "./sort-tabs"
import { ExploreClient } from "./explore-client"

const VALID_SORTS = new Set<SortType>(["popular", "likes", "recent"])

interface ExploreWrapperProps {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>
}

export async function ExploreWrapper({ searchParams }: ExploreWrapperProps) {
  const params = await searchParams

  const sort: SortType = VALID_SORTS.has(params.sort as SortType)
    ? (params.sort as SortType)
    : "popular"

  const page = Math.max(1, Number(params.page) || 1)
  const search = params.search ?? ""

  // Task 018 (API 구현) 완료 후 실제 Supabase 쿼리로 교체
  const tierCups: [] = []
  const total = 0

  return (
    <ExploreClient
      initialTierCups={tierCups}
      initialTotal={total}
      initialSort={sort}
      initialPage={page}
      initialSearch={search}
    />
  )
}
