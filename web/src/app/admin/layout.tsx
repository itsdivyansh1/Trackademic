import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
