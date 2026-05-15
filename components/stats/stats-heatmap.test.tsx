import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsHeatmap } from '@/components/stats/stats-heatmap'
import { mockStatsData } from '@/lib/mock/stats'
import { mockItems } from '@/lib/mock/play-session'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('StatsHeatmap', () => {
  it('"아이템별 티어 분포" 헤더를 렌더링한다', () => {
    render(
      <StatsHeatmap tierDistribution={mockStatsData.tier_distribution} items={mockItems} />,
    )
    expect(screen.getByText('아이템별 티어 분포')).toBeInTheDocument()
  })

  it('티어 헤더(S/A/B/C/D/F)가 렌더링된다', () => {
    render(
      <StatsHeatmap tierDistribution={mockStatsData.tier_distribution} items={mockItems} />,
    )
    for (const tier of ['S', 'A', 'B', 'C', 'D', 'F']) {
      expect(screen.getAllByText(tier).length).toBeGreaterThan(0)
    }
  })

  it('아이템 이름이 표시된다', () => {
    render(
      <StatsHeatmap tierDistribution={mockStatsData.tier_distribution} items={mockItems} />,
    )
    mockItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })

  it('빈 아이템 배열이면 행이 렌더링되지 않는다', () => {
    render(
      <StatsHeatmap tierDistribution={mockStatsData.tier_distribution} items={[]} />,
    )
    expect(screen.queryAllByRole('row').length).toBe(1) // 헤더 행만
  })

  it('퍼센트 값이 셀 title 속성에 포함된다', () => {
    render(
      <StatsHeatmap tierDistribution={mockStatsData.tier_distribution} items={[mockItems[0]]} />,
    )
    // item-01의 S티어: 45/(45+30+15+7+2+1) = 45% (반올림)
    const cells = document.querySelectorAll('[title]')
    const sTierCell = Array.from(cells).find((el) => el.getAttribute('title')?.includes('45'))
    expect(sTierCell).toBeTruthy()
  })

  it('분포 데이터가 없는 아이템도 렌더링된다', () => {
    const itemWithNoData = {
      id: 'item-no-data',
      tier_cup_id: 'cup-1',
      name: '데이터없는아이템',
      image_url: null,
      display_order: 99,
      created_at: '2026-01-01T00:00:00Z',
    }
    render(<StatsHeatmap tierDistribution={{}} items={[itemWithNoData]} />)
    expect(screen.getByText('데이터없는아이템')).toBeInTheDocument()
  })
})
