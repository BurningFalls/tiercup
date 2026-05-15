import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/common/search-bar'

describe('SearchBar', () => {
  it('기본 렌더링 — 검색 버튼이 보인다', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument()
  })

  it('defaultValue가 input에 표시된다', () => {
    render(<SearchBar defaultValue="초기값" onSearch={vi.fn()} />)
    expect(screen.getByDisplayValue('초기값')).toBeInTheDocument()
  })

  it('placeholder가 표시된다', () => {
    render(<SearchBar placeholder="검색어 입력" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('검색어 입력')).toBeInTheDocument()
  })

  it('입력 후 검색 버튼 클릭 시 onSearch가 호출된다', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox'), '검색어')
    await userEvent.click(screen.getByRole('button', { name: '검색' }))
    expect(onSearch).toHaveBeenCalledWith('검색어')
  })

  it('엔터 키로 폼 제출 시 onSearch가 호출된다', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox'), '키워드{Enter}')
    expect(onSearch).toHaveBeenCalledWith('키워드')
  })

  it('앞뒤 공백을 trim하여 onSearch를 호출한다', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.type(screen.getByRole('textbox'), '  공백  ')
    await userEvent.click(screen.getByRole('button', { name: '검색' }))
    expect(onSearch).toHaveBeenCalledWith('공백')
  })

  it('빈 문자열로 onSearch를 호출할 수 있다', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    await userEvent.click(screen.getByRole('button', { name: '검색' }))
    expect(onSearch).toHaveBeenCalledWith('')
  })
})
