import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TierCupCard } from '@/components/tiercup/tiercup-card'
import { mockPopularTierCups } from '@/lib/mock/tier-cups'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockTierCup = mockPopularTierCups[0]

describe('TierCupCard', () => {
  it('제목을 렌더링한다', () => {
    render(<TierCupCard tiercup={mockTierCup} />)
    expect(screen.getAllByText(mockTierCup.title).length).toBeGreaterThan(0)
  })

  it('플레이 횟수를 렌더링한다', () => {
    render(<TierCupCard tiercup={mockTierCup} />)
    expect(screen.getByText(/플레이/)).toBeInTheDocument()
  })

  it('좋아요 수를 렌더링한다', () => {
    render(<TierCupCard tiercup={mockTierCup} />)
    expect(screen.getByText(/좋아요/)).toBeInTheDocument()
  })

  it('공유/좋아요/통계 버튼이 렌더링된다', () => {
    render(<TierCupCard tiercup={mockTierCup} />)
    expect(screen.getByLabelText('공유')).toBeInTheDocument()
    expect(screen.getByLabelText('좋아요')).toBeInTheDocument()
    expect(screen.getByLabelText('통계')).toBeInTheDocument()
  })

  it('플레이 링크가 올바른 href를 가진다', () => {
    render(<TierCupCard tiercup={mockTierCup} />)
    const links = screen.getAllByRole('link')
    const playLinks = links.filter((l) => l.getAttribute('href') === `/play/${mockTierCup.play_code}`)
    expect(playLinks.length).toBeGreaterThan(0)
  })

  it('공유 버튼 클릭 시 onShare가 호출된다', async () => {
    const onShare = vi.fn()
    render(<TierCupCard tiercup={mockTierCup} onShare={onShare} />)
    await userEvent.click(screen.getByLabelText('공유'))
    expect(onShare).toHaveBeenCalledWith(mockTierCup)
  })

  it('좋아요 버튼 클릭 시 onLike가 호출된다', async () => {
    const onLike = vi.fn()
    render(<TierCupCard tiercup={mockTierCup} onLike={onLike} />)
    await userEvent.click(screen.getByLabelText('좋아요'))
    expect(onLike).toHaveBeenCalledWith(mockTierCup)
  })

  it('isLiked=true일 때 좋아요 버튼에 rose 색상 클래스가 적용된다', () => {
    render(<TierCupCard tiercup={mockTierCup} isLiked={true} />)
    expect(screen.getByLabelText('좋아요')).toHaveClass('text-rose-500')
  })

  it('isLiked=false일 때 rose 색상 클래스가 없다', () => {
    render(<TierCupCard tiercup={mockTierCup} isLiked={false} />)
    expect(screen.getByLabelText('좋아요')).not.toHaveClass('text-rose-500')
  })
})
