import { UsersIcon, SwordsIcon, ClockIcon } from 'lucide-react'
import { formatDuration } from '@/lib/utils/date'

interface StatsOverviewProps {
  totalPlays: number
  totalComparisons: number
  avgDurationSeconds: number
}

export function StatsOverview({ totalPlays, totalComparisons, avgDurationSeconds }: StatsOverviewProps) {
  const items = [
    { icon: UsersIcon, label: '전체 참여자', value: `${totalPlays.toLocaleString()}명` },
    { icon: SwordsIcon, label: '총 비교 횟수', value: `${totalComparisons.toLocaleString()}회` },
    { icon: ClockIcon, label: '평균 소요 시간', value: formatDuration(avgDurationSeconds) },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-col items-center gap-1 rounded-lg border p-4 text-center">
          <Icon className="size-5 text-muted-foreground" />
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  )
}
