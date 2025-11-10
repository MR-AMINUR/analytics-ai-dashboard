'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

const SidebarLink = ({ href, children }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {children}
    </Link>
  );
};

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      {/* Logo/Brand */}
      <div className="mb-8 px-3">
        <h2 className="text-lg font-semibold">Analytics AI</h2>
      </div>

      {/* Team Section */}
      <div className="mb-6 px-3">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Buchhaltung</h3>
        <p className="text-xs text-gray-600">12 members</p>
      </div>

      <hr className="my-4 border-gray-200" />

      {/* General Navigation */}
      <div className="space-y-1 mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
          GENERAL
        </h4>
        <SidebarLink href="/dashboard">Dashboard</SidebarLink>
        <SidebarLink href="/invoices">Invoice</SidebarLink>
        <SidebarLink href="/other-files">Other files</SidebarLink>
        <SidebarLink href="/departments">Departments</SidebarLink>
        <SidebarLink href="/users">Users</SidebarLink>
        <SidebarLink href="/settings">Settings</SidebarLink>
      </div>

      <hr className="my-4 border-gray-200" />

      {/* Chat with Data Section */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
          AI Features
        </h4>
        <SidebarLink href="/chat-with-data">Chat with Data</SidebarLink>
      </div>

      {/* Stats Section */}
      <div className="mt-8 space-y-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Text Spend</p>
          <p className="text-lg font-bold">€ 12.679,25</p>
          <p className="text-xs text-green-600">+8.2% from last month</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Total Invoices Processed</p>
          <p className="text-lg font-bold">64</p>
          <p className="text-xs text-green-600">+8.2% from last month</p>
        </div>
      </div>
    </div>
  );
}