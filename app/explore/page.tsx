import { Suspense } from "react"
import { ExploreWrapper } from "./_components/explore-wrapper"

interface ExplorePageProps {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">전체 티어컵</h1>
      <Suspense fallback={<div className="text-center py-16 text-muted-foreground">불러오는 중...</div>}>
        <ExploreWrapper searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
