import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from '@/lib/utils/clipboard'

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('성공 시 true를 반환한다', async () => {
    const result = await copyToClipboard('hello')
    expect(result).toBe(true)
  })

  it('올바른 텍스트로 writeText를 호출한다', async () => {
    await copyToClipboard('복사할 텍스트')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('복사할 텍스트')
  })

  it('writeText가 실패하면 false를 반환한다', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    const result = await copyToClipboard('hello')
    expect(result).toBe(false)
  })
})
