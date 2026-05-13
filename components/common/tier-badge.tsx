import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Tier } from "@/lib/types"

const TIER_STYLES: Record<Tier, string> = {
  S: "bg-yellow-400 text-yellow-950 border-yellow-500",
  A: "bg-orange-400 text-orange-950 border-orange-500",
  B: "bg-green-500 text-green-950 border-green-600",
  C: "bg-blue-500 text-blue-950 border-blue-600",
  D: "bg-purple-500 text-purple-950 border-purple-600",
  F: "bg-red-500 text-red-950 border-red-600",
  "?": "bg-gray-400 text-gray-950 border-gray-500",
}

const tierBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-bold leading-none",
  {
    variants: {
      size: {
        sm: "size-6 text-xs",
        md: "size-8 text-sm",
        lg: "size-12 text-xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

interface TierBadgeProps extends VariantProps<typeof tierBadgeVariants> {
  tier: Tier
  className?: string
}

export function TierBadge({ tier, size, className }: TierBadgeProps) {
  return (
    <span
      className={cn(tierBadgeVariants({ size }), TIER_STYLES[tier], className)}
      aria-label={`${tier} 티어`}
    >
      {tier}
    </span>
  )
}
