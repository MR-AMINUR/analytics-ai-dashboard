

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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 p-4 border-b">
            <Image src="/logo.svg" alt="Flowbit AI" width={28} height={28} />
            <h1 className="text-lg font-bold">Flowbit AI</h1>
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

        {/* Sidebar bottom summary (optional metrics) */}
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

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-400">Buchhaltung • 12 members</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">Amit Jadhav</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <Image
              src="/avatar.svg"
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full border"
            />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </section>
      </main>
    </div>
  );
}










// 'use client';
// import { ReactNode } from 'react';
// import { Home, FileText, Folder, Users, Settings } from 'lucide-react';
// import Link from 'next/link';
// import Image from 'next/image';

// export default function DashboardLayout({ children }: { children: ReactNode }) {
//   return (
//     <div className="flex h-screen bg-background">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white border-r border-border flex flex-col justify-between">
//         <div>
//           <div className="flex items-center gap-2 p-4 border-b">
//             <Image src="/logo.png" alt="Flowbit AI" width={28} height={28} />
//             <span className="font-semibold text-lg">Flowbit AI</span>
//           </div>
//           <nav className="flex flex-col mt-4">
//             <SidebarLink href="/" icon={<Home size={16} />} label="Dashboard" active />
//             <SidebarLink href="/invoices" icon={<FileText size={16} />} label="Invoice" />
//             <SidebarLink href="/other-files" icon={<Folder size={16} />} label="Other files" />
//             <SidebarLink href="/departments" icon={<Users size={16} />} label="Departments" />
//             <SidebarLink href="/users" icon={<Users size={16} />} label="Users" />
//             <SidebarLink href="/settings" icon={<Settings size={16} />} label="Settings" />
//           </nav>
//         </div>
//         <div className="p-4 text-sm text-muted-foreground">© Flowbit AI</div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <header className="flex justify-between items-center p-4 border-b bg-white">
//           <div className="text-lg font-semibold">Dashboard</div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-muted-foreground">Amit Jadhav</span>
//             <Image src="/avatar.png" alt="User" width={32} height={32} className="rounded-full" />
//           </div>
//         </header>

//         <main className="p-6 overflow-auto bg-[#F9FAFB]">{children}</main>
//       </div>
//     </div>
//   );
// }

// function SidebarLink({
//   href,
//   icon,
//   label,
//   active,
// }: {
//   href: string;
//   icon: ReactNode;
//   label: string;
//   active?: boolean;
// }) {
//   return (
//     <Link
//       href={href}
//       className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md mx-2 mb-1 ${
//         active
//           ? 'bg-indigo-100 text-indigo-700'
//           : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//       }`}
//     >
//       {icon}
//       {label}
//     </Link>
//   );
// }
