import { StatsClient } from '@/components/stats/stats-client'
import { mockStatsData } from '@/lib/mock/stats'
import { mockItems, mockTierCupForPlay } from '@/lib/mock/play-session'

// TODO: 목업 데이터 → 실제 API 호출로 교체 필요
// TODO: params.playCode를 fetchStats(playCode) 등에 사용해야 함
export default function StatsPage({
  params: _params,
}: {
  params: Promise<{ playCode: string }>
}) {
  return (
    <StatsClient
      statsData={mockStatsData}
      tierCup={mockTierCupForPlay}
      items={mockItems}
    />
  )
}
