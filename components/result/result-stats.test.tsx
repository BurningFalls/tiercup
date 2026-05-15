import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultStats } from '@/components/result/result-stats'

describe('ResultStats', () => {
  const baseProps = {
    comparisonCount: 12,
    totalItems: 8,
    startedAt: '2026-05-14T10:00:00Z',
    completedAt: '2026-05-14T10:02:34Z',
  }

  it('"플레이 정보" 헤더를 렌더링한다', () => {
    render(<ResultStats {...baseProps} />)
    expect(screen.getByText('플레이 정보')).toBeInTheDocument()
  })

  it('비교 횟수를 올바르게 표시한다', () => {
    render(<ResultStats {...baseProps} />)
    expect(screen.getByText('12회')).toBeInTheDocument()
  })

  it('총 항목 수를 올바르게 표시한다', () => {
    render(<ResultStats {...baseProps} />)
    expect(screen.getByText('8개')).toBeInTheDocument()
  })

  it('소요 시간을 포맷하여 표시한다 (2분 34초)', () => {
    render(<ResultStats {...baseProps} />)
    expect(screen.getByText('2분 34초')).toBeInTheDocument()
  })

  it('completedAt=null일 때 소요 시간을 "0초"로 표시한다', () => {
    render(<ResultStats {...baseProps} completedAt={null} />)
    expect(screen.getByText('0초')).toBeInTheDocument()
  })

  it('라벨 텍스트가 모두 표시된다', () => {
    render(<ResultStats {...baseProps} />)
    expect(screen.getByText('비교 횟수')).toBeInTheDocument()
    expect(screen.getByText('총 항목 수')).toBeInTheDocument()
    expect(screen.getByText('소요 시간')).toBeInTheDocument()
  })
})
