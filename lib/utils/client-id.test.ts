import { describe, it, expect, afterEach, vi } from 'vitest'
import { getClientId } from '@/lib/utils/client-id'

describe('getClientId', () => {
  it('SSR 환경(window undefined)에서는 빈 문자열을 반환한다', () => {
    vi.stubGlobal('window', undefined)
    expect(getClientId()).toBe('')
    vi.unstubAllGlobals()
  })

  it('localStorage에 ID가 없으면 새 ID를 생성하고 저장한다', () => {
    const id = getClientId()
    expect(id).toBeTruthy()
    expect(localStorage.getItem('tiercup_client_id')).toBe(id)
  })

  it('이미 저장된 ID가 있으면 동일한 ID를 반환한다', () => {
    const first = getClientId()
    const second = getClientId()
    expect(second).toBe(first)
  })

  it('세션마다 고유한 ID를 생성한다', () => {
    const id1 = getClientId()
    localStorage.clear()
    const id2 = getClientId()
    expect(id1).not.toBe(id2)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })
})
