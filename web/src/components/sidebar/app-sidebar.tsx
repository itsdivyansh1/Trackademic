"use client";

import { Command, FolderMinus } from "lucide-react";
import * as React from "react";

import { Award } from "@/assets/outline/Award";
import { BookOpen } from "@/assets/outline/BookeOpen";
import Cogwheel from "@/assets/outline/Cogwheel";
import { House2 } from "@/assets/outline/House2";
import { User } from "lucide-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-sec";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getProfile } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: House2,
    },
    {
      title: "Explore",
      url: "/app/explore",
      icon: BookOpen,
    },
    {
      title: "Publications",
      url: "/app/publications",
      icon: BookOpen,
    },
    {
      title: "Achievements",
      url: "/app/achievements",
      icon: Award,
    },
    {
      title: "Profile",
      url: "/app/profile",
      icon: User,
    },
  ],
  navSec: [
    {
      name: "Settings",
      url: "/app/settings",
      icon: Cogwheel,
    },
    {
      name: "Form Builder",
      url: "/app/form-builder",
      icon: FolderMinus,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // get current route

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes - profile doesn't change often
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });

  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }));

  const navSec = data.navSec
    .filter(
      (item) =>
        item.name !== "Form Builder" || userData?.user?.role === "FACULTY",
    )
    .map((item) => ({
      ...item,
      isActive: pathname.startsWith(item.url),
    }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Trackademic</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary navSec={navSec} role={userData?.user?.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
