"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavSecondary({
  navSec,
  role,
}: {
  navSec: {
    name: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
  role?: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Options</SidebarGroupLabel>
      <SidebarMenu>
        {navSec
          .filter((item) =>
            // only show Form Builder if user role is FACULTY
            item.name === "Form Builder" ? role === "FACULTY" : true,
          )
          .map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
      </SidebarMenu>{" "}
    </SidebarGroup>
  );
}
