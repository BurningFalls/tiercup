import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TierBadge } from '@/components/common/tier-badge'
import type { Tier } from '@/lib/types'

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D', 'F', '?']

describe('TierBadge', () => {
  it.each(TIERS)('모든 Tier(%s)를 렌더링한다', (tier) => {
    render(<TierBadge tier={tier} />)
    expect(screen.getByText(tier)).toBeInTheDocument()
  })

  it.each(TIERS)('aria-label이 "%s 티어"이다', (tier) => {
    render(<TierBadge tier={tier} />)
    expect(screen.getByLabelText(`${tier} 티어`)).toBeInTheDocument()
  })

  it('size prop 없이도 렌더링된다 (기본값 md)', () => {
    render(<TierBadge tier="S" />)
    const badge = screen.getByLabelText('S 티어')
    expect(badge).toBeInTheDocument()
  })

  it('size="sm"으로 렌더링된다', () => {
    render(<TierBadge tier="A" size="sm" />)
    expect(screen.getByLabelText('A 티어')).toBeInTheDocument()
  })

  it('size="lg"으로 렌더링된다', () => {
    render(<TierBadge tier="B" size="lg" />)
    expect(screen.getByLabelText('B 티어')).toBeInTheDocument()
  })

  it('className을 추가로 적용할 수 있다', () => {
    render(<TierBadge tier="S" className="custom-class" />)
    expect(screen.getByLabelText('S 티어')).toHaveClass('custom-class')
  })
})
