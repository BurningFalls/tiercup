"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, XIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [{ href: "/explore", label: "전체 탐색" }]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          TierCup
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button asChild size="sm">
            <Link href="/create">
              <PlusIcon />
              새 티어컵 만들기
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-1 w-full">
              <Link href="/create" onClick={() => setMobileOpen(false)}>
                <PlusIcon />
                새 티어컵 만들기
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
