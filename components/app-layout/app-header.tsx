
"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { Spinner } from "../ui/spinner"

export function AppHeader({
  userId,
  timezone,
}: {
  userId: string
  timezone: string
}) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  const segments = pathname.split("/").filter(Boolean)

  const habitId =
    segments[0] === "habits" && segments.length > 1
      ? segments[1]
      : null

  const [habitTitle, setHabitTitle] = useState<{
    habitId: string
    title: string
  } | null>(null)

  useEffect(() => {
    if (!habitId) return

    const currentHabitId = habitId
    const controller = new AbortController()

    async function fetchHabitTitle() {
      try {
        const response = await fetch(
          `/api/${userId}/habit/${currentHabitId}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          setHabitTitle(null)
          return
        }

        const data = await response.json()

        setHabitTitle({
          habitId: currentHabitId,
          title: data.title,
        })
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch habit title:", error)
        }
      }
    }

    void fetchHabitTitle()

    return () => controller.abort()
  }, [habitId, userId])

  const routeNames: Record<string, string> = {
    dashboard: "Dashboard",
    habits: "Habits",
    "create-habit": "Create Habit",
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href =
      segment === "habits" && index === 0 && segments.length > 1
        ? "/habits?view=card"
        : "/" + segments.slice(0, index + 1).join("/")

    const isHabitId = segments[0] === "habits" && index === 1

    const label = isHabitId
      ? habitTitle?.habitId === segment
        ? habitTitle.title
        : "Habit Details"
      : routeNames[segment] ??
        segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())

    return { href, label }
  })

  const createSampleDataButtonClick = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/demo/seed", {
        method: "POST",
        body: JSON.stringify({ userId, timezone }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create sample data")
      }

      window.location.reload()
    } catch (error) {
      console.error("Failed to create sample data:", error)
      setLoading(false)
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-x-2">
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={createSampleDataButtonClick}
            disabled={loading}
          >
            {loading && <Spinner />}
            Seed Random Data
          </Button>

          <Button
            variant="outline"
            asChild
            size="sm"
            className="hidden sm:flex"
          >
            <a
              href="https://github.com/devfarhaannn/habitflow"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
