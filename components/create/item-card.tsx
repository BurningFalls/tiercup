"use client"

import { useRef } from "react"
import Image from "next/image"
import { XIcon, ImageIcon } from "lucide-react"
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TierCupFormValues } from "@/lib/schemas"
import { validateImage } from "@/lib/utils/image"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  index: number
  onRemove: (index: number) => void
  register: UseFormRegister<TierCupFormValues>
  setValue: UseFormSetValue<TierCupFormValues>
  watch: UseFormWatch<TierCupFormValues>
  errors: FieldErrors<TierCupFormValues>
}

export function ItemCard({
  index,
  onRemove,
  register,
  setValue,
  watch,
  errors,
}: ItemCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageFile = watch(`items.${index}.image`)
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null
  const nameError = errors.items?.[index]?.name?.message

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { valid, error } = validateImage(file)
    if (!valid) {
      toast.error(error)
      e.target.value = ""
      return
    }
    setValue(`items.${index}.image`, file, { shouldDirty: true })
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-80"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`아이템 ${index + 1} 이미지`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="size-8" />
              <span className="text-xs">이미지 추가</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          onClick={() => onRemove(index)}
          className="absolute right-1 top-1"
          aria-label="아이템 삭제"
        >
          <XIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          {...register(`items.${index}.name`)}
          placeholder="아이템 이름"
          maxLength={50}
          className={cn(
            nameError && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {nameError && (
          <p className="text-xs text-destructive">{nameError}</p>
        )}
      </div>
    </div>
  )
}
