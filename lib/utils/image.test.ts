import { describe, it, expect } from 'vitest'
import { validateImage } from '@/lib/utils/image'

const makeFile = (size: number, type = 'image/jpeg') =>
  new File([new Uint8Array(size)], 'test.jpg', { type })

describe('validateImage', () => {
  it('유효한 JPEG(1MB)는 통과한다', () => {
    const result = validateImage(makeFile(1 * 1024 * 1024))
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('유효한 PNG를 통과한다', () => {
    expect(validateImage(makeFile(1024, 'image/png')).valid).toBe(true)
  })

  it('유효한 GIF를 통과한다', () => {
    expect(validateImage(makeFile(1024, 'image/gif')).valid).toBe(true)
  })

  it('정확히 5MB는 통과한다', () => {
    expect(validateImage(makeFile(5 * 1024 * 1024)).valid).toBe(true)
  })

  it('5MB 초과 파일은 실패하고 에러 메시지를 반환한다', () => {
    const result = validateImage(makeFile(5 * 1024 * 1024 + 1))
    expect(result.valid).toBe(false)
    expect(result.error).toBe('이미지는 5MB 이하여야 합니다')
  })

  it('허용되지 않는 MIME 타입(webp)은 실패한다', () => {
    const result = validateImage(makeFile(1024, 'image/webp'))
    expect(result.valid).toBe(false)
    expect(result.error).toBe('JPG, PNG, GIF 형식만 허용됩니다')
  })

  it('허용되지 않는 MIME 타입(svg)은 실패한다', () => {
    const result = validateImage(makeFile(1024, 'image/svg+xml'))
    expect(result.valid).toBe(false)
  })
})
