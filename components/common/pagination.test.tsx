import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/common/pagination'

describe('Pagination', () => {
  it('totalPages가 1 이하이면 null을 반환한다', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('totalPages가 0이면 null을 반환한다', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('이전/다음 버튼과 페이지 번호를 렌더링한다', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('이전 페이지')).toBeInTheDocument()
    expect(screen.getByLabelText('다음 페이지')).toBeInTheDocument()
  })

  it('첫 페이지에서 이전 버튼이 비활성화된다', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('이전 페이지')).toBeDisabled()
  })

  it('마지막 페이지에서 다음 버튼이 비활성화된다', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('다음 페이지')).toBeDisabled()
  })

  it('중간 페이지에서 이전/다음 버튼이 모두 활성화된다', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('이전 페이지')).not.toBeDisabled()
    expect(screen.getByLabelText('다음 페이지')).not.toBeDisabled()
  })

  it('현재 페이지 버튼에 aria-current="page"가 설정된다', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('3페이지')).toHaveAttribute('aria-current', 'page')
  })

  it('다음 버튼 클릭 시 onPageChange(currentPage + 1)를 호출한다', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByLabelText('다음 페이지'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('이전 버튼 클릭 시 onPageChange(currentPage - 1)를 호출한다', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByLabelText('이전 페이지'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('페이지 번호 클릭 시 onPageChange(page)를 호출한다', async () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByLabelText('1페이지'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('delta=2 알고리즘으로 페이지 범위를 표시한다 (3페이지 기준 1~5)', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('1페이지')).toBeInTheDocument()
    expect(screen.getByLabelText('5페이지')).toBeInTheDocument()
    expect(screen.queryByLabelText('6페이지')).not.toBeInTheDocument()
  })
})
