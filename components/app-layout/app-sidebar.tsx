
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar1,
  ChartBarBig,
  Check,
  CircleGauge,
  CircleQuestionMark,
  Database,
  FileSpreadsheet,
  FileText,
  GalleryVerticalEnd,
  LayoutList,
  Search,
  Settings,
  UsersRound,
} from "lucide-react"

import { NavDocuments } from "@/components/app-layout/sidebar/nav-documents"
import { NavMain } from "@/components/app-layout/sidebar/nav-main"
import { NavSecondary } from "@/components/app-layout/sidebar/nav-secondary"
import { NavUser } from "@/components/app-layout/sidebar/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: CircleGauge,
    },
    {
      title: "Habits",
      url: "/habits",
      icon: LayoutList,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartBarBig,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar1,
    },
    {
      title: "Reminders",
      url: "/reminder",
      icon: Check,
    },
    {
      title: "Community",
      url: "/community",
      icon: UsersRound,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "/documents",
      icon: CircleQuestionMark,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],

  documents: [
    {
      name: "Export / Import Data",
      url: "/data",
      icon: Database,
    },
    {
      name: "Download Report",
      url: "/report",
      icon: FileSpreadsheet,
    },
    {
      name: "Documentation",
      url: "/documents",
      icon: FileText,
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <GalleryVerticalEnd className="size-5" />
                <span className="text-base font-semibold">
                  HabitFlow Inc.
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
