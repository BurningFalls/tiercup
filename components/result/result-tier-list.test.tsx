import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultTierList } from '@/components/result/result-tier-list'
import { mockResultData } from '@/lib/mock/result'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('ResultTierList', () => {
  it('결과 데이터를 렌더링한다 (smoke)', () => {
    const { container } = render(<ResultTierList results={mockResultData.results} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('S 티어 아이템 이름이 표시된다', () => {
    render(<ResultTierList results={mockResultData.results} />)
    const sItems = mockResultData.results.filter((r) => r.tier === 'S')
    sItems.forEach(({ item }) => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })

  it('? 티어 아이템은 표시되지 않는다', () => {
    const resultsWithQuestion = [
      ...mockResultData.results,
      {
        id: 'pr-99',
        play_session_id: 'mock-session-001',
        item_id: 'item-99',
        tier: '?' as const,
        tier_order: 1,
        item: {
          id: 'item-99',
          tier_cup_id: 'cup-1',
          name: '미분류아이템',
          image_url: null,
          display_order: 99,
          created_at: '2026-01-01T00:00:00Z',
        },
      },
    ]
    render(<ResultTierList results={resultsWithQuestion} />)
    expect(screen.queryByText('미분류아이템')).not.toBeInTheDocument()
  })

  it('빈 결과 배열이면 아무것도 렌더링되지 않는다', () => {
    const { container } = render(<ResultTierList results={[]} />)
    expect(container.querySelector('[class*="divide-y"]')?.children.length).toBe(0)
  })

  it('아이템에 image_url이 없으면 img 태그 없이 렌더링된다', () => {
    const noImageResults = mockResultData.results.map((r) => ({
      ...r,
      item: { ...r.item, image_url: null },
    }))
    render(<ResultTierList results={noImageResults} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
