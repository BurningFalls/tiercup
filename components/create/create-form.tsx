"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LeaveWarningDialog } from "@/components/common/leave-warning-dialog"
import { ItemFailedDialog } from "@/components/create/item-failed-dialog"
import { ItemCard } from "@/components/create/item-card"
import { tierCupSchema, TierCupFormValues } from "@/lib/schemas"
import { cn } from "@/lib/utils"

export default function CreateForm() {
  const router = useRouter()
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [failedManageCode, setFailedManageCode] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TierCupFormValues>({
    resolver: zodResolver(tierCupSchema),
    defaultValues: {
      title: "",
      items: [{ name: "" }, { name: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const title = watch("title")
  const itemCount = fields.length

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  function handleNavigate(href: string) {
    if (isDirty) {
      setPendingNavigation(href)
      setLeaveDialogOpen(true)
    } else {
      router.push(href)
    }
  }

  function handleLeaveConfirm() {
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
      setLeaveDialogOpen(false)
    }
  }

  async function onSubmit(data: TierCupFormValues) {
    const cupRes = await fetch('/api/tier-cups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: data.title }),
    })

    if (!cupRes.ok) {
      const { error } = await cupRes.json()
      alert(error?.message ?? '티어컵 생성에 실패했습니다.')
      return
    }

    const { play_code, manage_code } = await cupRes.json()

    const results = await Promise.allSettled(
      data.items.map((item, index) => {
        const formData = new FormData()
        formData.append('name', item.name)
        formData.append('display_order', String(index))
        if (item.image) formData.append('image', item.image)
        else if (item.image_url) formData.append('image_url', item.image_url)
        return fetch(`/api/tier-cups/${play_code}/items`, { method: 'POST', body: formData })
      }),
    )

    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok),
    )
    if (failed.length > 0) {
      setFailedManageCode(manage_code)
      return
    }

    router.push(`/create/complete?play_code=${play_code}&manage_code=${manage_code}&title=${encodeURIComponent(data.title)}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">새 티어컵 만들기</h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleNavigate("/")}
          >
            취소
          </Button>
        </div>

        {/* 제목 섹션 */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">티어컵 제목</Label>
            <span className="text-sm text-muted-foreground">
              {title.length}/30
            </span>
          </div>
          <Input
            id="title"
            {...register("title")}
            placeholder="티어컵 제목을 입력하세요"
            maxLength={30}
            className={cn(
              errors.title && "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* 아이템 섹션 */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label>아이템 목록</Label>
            <span className="text-sm text-muted-foreground">
              {itemCount}/64
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {fields.map((field, index) => (
              <ItemCard
                key={field.id}
                index={index}
                onRemove={remove}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: "" })}
            disabled={itemCount >= 64}
            className="w-full"
          >
            <PlusIcon />
            아이템 추가
          </Button>
        </div>

        {/* 아이템 배열 레벨 에러 */}
        {typeof errors.items?.message === "string" && (
          <p className="mb-4 text-sm text-destructive">{errors.items.message}</p>
        )}

        <div className="flex flex-col gap-2">
          {itemCount < 4 && (
            <p className="text-sm text-muted-foreground">
              최소 4개 이상의 아이템이 필요해요. (현재 {itemCount}개)
            </p>
          )}
          <Button
            type="submit"
            disabled={itemCount < 4 || isSubmitting}
            className="w-full"
          >
            티어컵 만들기
          </Button>
        </div>
      </form>

      <ItemFailedDialog
        open={failedManageCode !== null}
        manageCode={failedManageCode ?? ""}
        onClose={() => setFailedManageCode(null)}
      />

      <LeaveWarningDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        onConfirm={handleLeaveConfirm}
        title="페이지를 떠나시겠습니까?"
        description="작성 중인 내용이 있어요. 나가면 변경사항을 잃게 됩니다."
      />
    </>
  )
}
