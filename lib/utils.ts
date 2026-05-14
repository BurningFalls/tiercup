import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TIER_ORDER } from '@/lib/constants'
import type { Item, Tier } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupItemsByTier(items: Item[], tierMap: Record<string, Tier>): Record<Tier, Item[]> {
  return TIER_ORDER.reduce<Record<Tier, Item[]>>(
    (acc, tier) => {
      acc[tier] = items.filter((item) => tierMap[item.id] === tier)
      return acc
    },
    {} as Record<Tier, Item[]>,
  )
}
