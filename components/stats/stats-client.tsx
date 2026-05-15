import Link from 'next/link'
import { BarChart2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsOverview } from '@/components/stats/stats-overview'
import { StatsHeatmap } from '@/components/stats/stats-heatmap'
import { StatsHighlights } from '@/components/stats/stats-highlights'
import type { Item, StatsResponse, TierCup } from '@/lib/types'

interface StatsClientProps {
  statsData: StatsResponse
  tierCup: TierCup
  items: Item[]
}

export function StatsClient({ statsData, tierCup, items }: StatsClientProps) {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <BarChart2Icon className="size-6 text-blue-500" />
          <h1 className="text-2xl font-bold">{tierCup.title}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">전체 통계</p>
      </div>

      {/* 집계 지표 */}
      <div className="mt-8">
        <StatsOverview
          totalPlays={statsData.total_plays}
          totalComparisons={statsData.total_comparisons}
          avgDurationSeconds={statsData.avg_duration_seconds}
        />
      </div>

      {/* 재미있는 통계 */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">재미있는 통계</p>
        <StatsHighlights
          topSTier={statsData.top_s_tier}
          topFTier={statsData.top_f_tier}
          mostContested={statsData.most_contested}
        />
      </div>

      {/* 히트맵 */}
      <div className="mt-6">
        <StatsHeatmap
          tierDistribution={statsData.tier_distribution}
          items={items}
        />
      </div>

      {/* 나도 해보기 */}
      <div className="mt-8 text-center">
        <Button size="lg" asChild>
          <Link href={`/play/${tierCup.play_code}`}>나도 해보기</Link>
        </Button>
      </div>
    </div>
  )
}
