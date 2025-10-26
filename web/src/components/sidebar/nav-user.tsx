"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logoutUser } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useS3Url } from "@/hooks/use-s3-url";
import { toast } from "sonner";
import Link from "next/link";

export function NavUser({
  user,
}: {
  user?: {
    name?: string;
    email?: string;
    profileImage?: string | null;
    role?: string;
    isApproved?: boolean;
  } | null;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const profileImageUrl = useS3Url(user?.profileImage);
  
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success("Logged out succesfully");
      router.push("/login");
    },
  });

  const initials = (user?.name || "").split(" ").map((n) => n[0]).slice(0,2).join("") || "U";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profileImageUrl} alt={user?.name ?? "User"} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? "User"}</span>
                <span className="truncate text-xs opacity-80">{user?.email ?? ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profileImageUrl} alt={user?.name ?? "User"} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name ?? "User"}</span>
                  <span className="truncate text-xs opacity-80">{user?.email ?? ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/app/profile">
                  <BadgeCheck />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/settings">
                  <Bell />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
