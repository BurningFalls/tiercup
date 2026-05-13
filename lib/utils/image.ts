import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/schemas'

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_IMAGE_SIZE) return { valid: false, error: '이미지는 5MB 이하여야 합니다' }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { valid: false, error: 'JPG, PNG, GIF 형식만 허용됩니다' }
  return { valid: true }
}
