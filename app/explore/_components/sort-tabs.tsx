"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SortType = "popular" | "likes" | "latest"

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "popular", label: "🔥 인기순" },
  { value: "likes", label: "❤️ 좋아요순" },
  { value: "latest", label: "🆕 최신순" },
]

interface SortTabsProps {
  value: SortType
  onChange: (sort: SortType) => void
  className?: string
}

export function SortTabs({ value, onChange, className }: SortTabsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
