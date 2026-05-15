import Image from 'next/image'
import { TIER_ORDER } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Item, Tier } from '@/lib/types'

const DISPLAY_TIERS: Tier[] = TIER_ORDER.filter((t) => t !== '?')

// 퍼센트 → 불투명도 단계 (0%, 1~20%, 21~40%, 41~60%, 61~80%, 81~100%)
function getOpacityClass(pct: number): string {
  if (pct === 0) return 'opacity-0'
  if (pct <= 20) return 'opacity-20'
  if (pct <= 40) return 'opacity-40'
  if (pct <= 60) return 'opacity-60'
  if (pct <= 80) return 'opacity-80'
  return 'opacity-100'
}

const TIER_BG: Record<Tier, string> = {
  S: 'bg-yellow-400',
  A: 'bg-orange-400',
  B: 'bg-green-500',
  C: 'bg-blue-500',
  D: 'bg-purple-500',
  F: 'bg-red-500',
  '?': 'bg-gray-400',
}

interface StatsHeatmapProps {
  tierDistribution: Record<string, Record<Tier, number>>
  items: Item[]
  totalPlays: number
}

export function StatsHeatmap({ tierDistribution, items, totalPlays }: StatsHeatmapProps) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">아이템별 티어 분포</p>
        <p className="mt-0.5 text-xs text-muted-foreground">색이 진할수록 해당 티어에 많이 배치됨</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-36 px-4 py-2 text-left text-xs font-medium text-muted-foreground">아이템</th>
              {DISPLAY_TIERS.map((tier) => (
                <th key={tier} className="px-2 py-2 text-center text-xs font-bold" style={{ minWidth: 52 }}>
                  {tier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => {
              const dist = tierDistribution[item.id] ?? {}
              return (
                <tr key={item.id}>
                  {/* 아이템 정보 */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative size-8 shrink-0 overflow-hidden rounded bg-muted">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <span className="max-w-20 truncate text-sm">{item.name}</span>
                    </div>
                  </td>

                  {/* 티어별 셀 */}
                  {DISPLAY_TIERS.map((tier) => {
                    const count = dist[tier] ?? 0
                    const pct = totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0
                    return (
                      <td key={tier} className="px-2 py-2 text-center">
                        <div
                          className={cn(
                            'mx-auto flex size-10 items-center justify-center rounded text-xs font-semibold',
                            TIER_BG[tier],
                            getOpacityClass(pct),
                            pct === 0 ? 'border border-dashed border-muted-foreground/20 text-muted-foreground' : 'text-white',
                          )}
                          title={`${count}회 (${pct}%)`}
                        >
                          {pct > 0 ? `${pct}%` : ''}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
