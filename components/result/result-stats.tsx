import { calcDurationSeconds, formatDuration } from '@/lib/utils/date'

interface ResultStatsProps {
  comparisonCount: number
  totalItems: number
  startedAt: string
  completedAt: string | null
}

export function ResultStats({ comparisonCount, totalItems, startedAt, completedAt }: ResultStatsProps) {
  const durationSeconds = calcDurationSeconds(startedAt, completedAt)

  const stats = [
    { label: '비교 횟수', value: `${comparisonCount}회` },
    { label: '총 항목 수', value: `${totalItems}개` },
    { label: '소요 시간', value: formatDuration(durationSeconds) },
  ]

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-semibold">플레이 정보</p>
      <dl className="flex flex-col gap-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
