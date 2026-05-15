import { StatsClient } from '@/components/stats/stats-client'
import { mockStatsData } from '@/lib/mock/stats'
import { mockItems, mockTierCupForPlay } from '@/lib/mock/play-session'

export default function StatsPage() {
  return (
    <StatsClient
      statsData={mockStatsData}
      tierCup={mockTierCupForPlay}
      items={mockItems}
    />
  )
}
