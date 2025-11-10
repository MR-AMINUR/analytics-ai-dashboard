"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Folder,
  Users,
  Settings,
  MessageSquare,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Invoice", href: "/invoices", icon: FileText },
  { name: "Other files", href: "/other-files", icon: Folder },
  { name: "Departments", href: "/departments", icon: Users },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Sticky Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
        <div>
          {/* ✅ Logo block with fallback */}
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-100 text-indigo-600 font-bold">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold">Flowbit AI</span>
              <span className="text-xs text-gray-500">Analytics</span>
            </div>
          </div>


          <nav className="p-4 space-y-2">
            <h3 className="text-xs text-gray-400 uppercase mb-2">General</h3>
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}

            <h3 className="text-xs text-gray-400 uppercase mt-4 mb-2">
              AI Features
            </h3>
            <Link
              href="/chat-with-data"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                pathname === "/chat-with-data"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat with Data
            </Link>
          </nav>
        </div>

        {/* ✅ Sidebar bottom summary */}
        <div className="p-4 space-y-2 text-sm">
          <div className="rounded-lg bg-indigo-50 p-3">
            <p className="text-xs text-gray-500">Total Spend</p>
            <p className="text-base font-semibold text-indigo-700">
              €12,679.25
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-gray-500">Invoices Processed</p>
            <p className="text-base font-semibold text-green-700">64</p>
          </div>
        </div>
      </aside>

      {/* ✅ Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-400">Buchhaltung • 12 members</p>
          </div>

          {/* Header user info (dynamic) */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{typeof window !== "undefined" && localStorage.getItem("userName") ? localStorage.getItem("userName") : "Guest"}</p>
              <p className="text-xs text-gray-500">
                {typeof window !== "undefined" && localStorage.getItem("userEmail")
                  ? localStorage.getItem("userEmail")
                  : "Not signed in"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 border text-indigo-600 font-semibold">
              A
            </div>
          </div>

        </header>

        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </section>
      </main>
    </div>
  );
}
