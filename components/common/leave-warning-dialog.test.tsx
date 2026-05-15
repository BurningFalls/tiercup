import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeaveWarningDialog } from '@/components/common/leave-warning-dialog'

describe('LeaveWarningDialog', () => {
  it('open=true일 때 다이얼로그가 렌더링된다', () => {
    render(
      <LeaveWarningDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(screen.getByText('페이지를 떠나시겠습니까?')).toBeInTheDocument()
  })

  it('open=false일 때 다이얼로그가 보이지 않는다', () => {
    render(
      <LeaveWarningDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(screen.queryByText('페이지를 떠나시겠습니까?')).not.toBeInTheDocument()
  })

  it('기본 description 텍스트가 표시된다', () => {
    render(
      <LeaveWarningDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(screen.getByText(/저장되지 않은 변경사항/)).toBeInTheDocument()
  })

  it('커스텀 title/description을 표시한다', () => {
    render(
      <LeaveWarningDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="커스텀 제목"
        description="커스텀 설명"
      />,
    )
    expect(screen.getByText('커스텀 제목')).toBeInTheDocument()
    expect(screen.getByText('커스텀 설명')).toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 onOpenChange(false)가 호출된다', async () => {
    const onOpenChange = vi.fn()
    render(
      <LeaveWarningDialog open={true} onOpenChange={onOpenChange} onConfirm={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn()
    render(
      <LeaveWarningDialog open={true} onOpenChange={vi.fn()} onConfirm={onConfirm} />,
    )
    await userEvent.click(screen.getByRole('button', { name: '페이지 떠나기' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('확인 버튼 클릭 시 onConfirm 후 onOpenChange(false)가 호출된다', async () => {
    const calls: string[] = []
    const onConfirm = vi.fn(() => calls.push('confirm'))
    const onOpenChange = vi.fn((v: boolean) => { if (!v) calls.push('close') })
    render(
      <LeaveWarningDialog open={true} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    )
    await userEvent.click(screen.getByRole('button', { name: '페이지 떠나기' }))
    expect(calls).toEqual(['confirm', 'close'])
  })
})
