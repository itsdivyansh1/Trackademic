"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-4 text-white">
        <h1 className="mb-6 text-xl font-bold">Admin Dashboard</h1>
        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block rounded p-2 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="block rounded p-2 hover:bg-gray-700"
          >
            Users
          </Link>
          <Link
            href="/admin/achievements"
            className="block rounded p-2 hover:bg-gray-700"
          >
            Achievements
          </Link>
          <Link
            href="/admin/publications"
            className="block rounded p-2 hover:bg-gray-700"
          >
            Publications
          </Link>
        </nav>
        
        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-gray-700"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 size-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
