import { Suspense } from "react"
import type { SortType } from "./_components/sort-tabs"
import { ExploreClient } from "./_components/explore-client"

const VALID_SORTS = new Set<SortType>(["popular", "likes", "recent"])

interface ExplorePageProps {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
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
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">전체 티어컵</h1>
      <Suspense>
        <ExploreClient
          initialTierCups={tierCups}
          initialTotal={total}
          initialSort={sort}
          initialPage={page}
          initialSearch={search}
        />
      </Suspense>
    </main>
  )
}
