import { z } from 'zod'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const itemSchema = z.object({
  name: z.string().min(1, '아이템 이름을 입력하세요').max(50, '50자 이하로 입력하세요'),
  image: z
    .custom<File>((val) => typeof File !== 'undefined' && val instanceof File)
    .refine((f) => f.size <= MAX_IMAGE_SIZE, '이미지는 5MB 이하여야 합니다')
    .refine(
      (f) => ALLOWED_IMAGE_TYPES.includes(f.type),
      'JPG, PNG, GIF 형식만 허용됩니다',
    )
    .optional(),
  image_url: z.string().url().optional(),
})

export const tierCupSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력하세요')
    .max(30, '제목은 30자 이하로 입력하세요'),
  items: z
    .array(itemSchema)
    .min(4, '아이템을 최소 4개 입력하세요')
    .max(64, '아이템은 최대 64개까지 가능합니다'),
})

export const comparisonSchema = z.object({
  winner_item_id: z.string().min(1),
  loser_item_id: z.string().min(1),
})

export const updateResultSchema = z.object({
  results: z.array(
    z.object({
      item_id: z.string(),
      tier: z.enum(['S', 'A', 'B', 'C', 'D', 'F', '?']),
      tier_order: z.number().int().nonnegative(),
    }),
  ),
})

export type TierCupFormValues = z.infer<typeof tierCupSchema>
export type ItemFormValues = z.infer<typeof itemSchema>
export type ComparisonValues = z.infer<typeof comparisonSchema>
export type UpdateResultValues = z.infer<typeof updateResultSchema>
