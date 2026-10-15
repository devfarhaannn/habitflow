"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "../ui/spinner"

export function AppHeader({ userId, timezone }: { userId: string, timezone: string }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false);
  const segments = pathname.split("/").filter(Boolean)

  const routeNames: Record<string, string> = {
    dashboard: "Dashboard",
    habits: "Habits",
    "create-habit": "Create Habit",
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    // const label = decodeURIComponent(segment)
    const label = routeNames[segment] ?? segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())

    return { href, label }
  })

  const createSampleDataButtonClick = async () => {
    setLoading(true);
    await fetch("/api/demo/seed", {
      method: "POST",
      body: JSON.stringify({ userId, timezone }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    setLoading(false);

    window.location.reload()
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
          <Button variant="outline" size="sm" className="hidden sm:flex"
            onClick={createSampleDataButtonClick}
          >
            {loading &&
              <Spinner />
            }
            Seed Random Data
          </Button>
          <Button variant="outline" asChild size="sm" className="hidden sm:flex">
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
