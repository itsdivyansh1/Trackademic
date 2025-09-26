"use client";

import { Command, FolderMinus } from "lucide-react";
import * as React from "react";

import { Award } from "@/assets/outline/Award";
import { BookOpen } from "@/assets/outline/BookeOpen";
import Cogwheel from "@/assets/outline/Cogwheel";
import { House2 } from "@/assets/outline/House2";
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
      title: "Home",
      url: "/app/home",
      icon: House2,
    },
    {
      title: "Achievements",
      url: "/app/achievements",
      icon: Award,
    },
    {
      title: "Publications",
      url: "/app/publications",
      icon: BookOpen,
    },
  ],
  navSec: [
    {
      name: "Settings",
      url: "#",
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
