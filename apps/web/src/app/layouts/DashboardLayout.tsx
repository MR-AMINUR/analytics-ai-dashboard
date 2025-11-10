'use client';
import { ReactNode } from 'react';
import { Home, FileText, Folder, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 p-4 border-b">
            <Image src="/logo.png" alt="Flowbit AI" width={28} height={28} />
            <span className="font-semibold text-lg">Flowbit AI</span>
          </div>
          <nav className="flex flex-col mt-4">
            <SidebarLink href="/" icon={<Home size={16} />} label="Dashboard" active />
            <SidebarLink href="/invoices" icon={<FileText size={16} />} label="Invoice" />
            <SidebarLink href="/other-files" icon={<Folder size={16} />} label="Other files" />
            <SidebarLink href="/departments" icon={<Users size={16} />} label="Departments" />
            <SidebarLink href="/users" icon={<Users size={16} />} label="Users" />
            <SidebarLink href="/settings" icon={<Settings size={16} />} label="Settings" />
          </nav>
        </div>
        <div className="p-4 text-sm text-muted-foreground">© Flowbit AI</div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <div className="text-lg font-semibold">Dashboard</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Amit Jadhav</span>
            <Image src="/avatar.png" alt="User" width={32} height={32} className="rounded-full" />
          </div>
        </header>

        <main className="p-6 overflow-auto bg-[#F9FAFB]">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md mx-2 mb-1 ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
