"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
    isActive?: boolean;
  }[];
}) {
  const { t } = useLanguage();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive}>
              <Link href={item.url}>
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{t(`nav.${item.title.toLowerCase()}`) || item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
