import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImage } from '@/lib/utils/image'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 12)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playCode: string }> },
) {
  const { playCode } = await params
  if (!/^[a-zA-Z0-9]{6,}$/.test(playCode)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 티어컵 코드입니다.' } },
      { status: 400 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '요청 본문이 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const name = formData.get('name')
  const displayOrderRaw = formData.get('display_order')
  const imageFile = formData.get('image')
  const imageUrl = formData.get('image_url')

  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '아이템 이름을 입력하세요.' } },
      { status: 400 },
    )
  }
  if (name.length > 50) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '아이템 이름은 50자 이하여야 합니다.' } },
      { status: 400 },
    )
  }

  const displayOrder = Number(displayOrderRaw)
  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '표시 순서가 올바르지 않습니다.' } },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  // tier_cup 존재 여부 확인
  const { data: cupData, error: cupError } = await supabase
    .from('tier_cups')
    .select('id')
    .eq('play_code', playCode)
    .single()

  if (cupError) {
    const isNotFound = cupError.code === 'PGRST116'
    return NextResponse.json(
      {
        error: {
          code: isNotFound ? 'TIER_CUP_NOT_FOUND' : 'INTERNAL_ERROR',
          message: isNotFound ? '티어컵을 찾을 수 없습니다.' : '서버 오류가 발생했습니다.',
        },
      },
      { status: isNotFound ? 404 : 500 },
    )
  }

  const tierId = cupData.id

  let finalImageUrl: string | null = null

  const imageAsFile = imageFile as File | null
  if (imageAsFile != null && typeof imageAsFile.arrayBuffer === 'function' && imageAsFile.size > 0) {
    const validation = validateImage(imageAsFile)
    if (!validation.valid) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error } },
        { status: 400 },
      )
    }

    const ext = imageAsFile.name.split('.').pop() ?? 'jpg'
    const path = `${tierId}/${nanoid()}.${ext}`
    const arrayBuffer = await imageAsFile.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(path, arrayBuffer, { contentType: imageAsFile.type })

    if (uploadError) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: '이미지 업로드에 실패했습니다.' } },
        { status: 500 },
      )
    }

    const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
    finalImageUrl = urlData.publicUrl
  } else if (typeof imageUrl === 'string' && imageUrl.length > 0) {
    try {
      new URL(imageUrl)
      finalImageUrl = imageUrl
    } catch {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 이미지 URL입니다.' } },
        { status: 400 },
      )
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      tier_cup_id: tierId,
      name: name.trim(),
      image_url: finalImageUrl,
      display_order: displayOrder,
    })
    .select('id, name, image_url')
    .single()

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '아이템 생성에 실패했습니다.' } },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { id: String(data.id), name: data.name, image_url: data.image_url },
    { status: 201 },
  )
}
