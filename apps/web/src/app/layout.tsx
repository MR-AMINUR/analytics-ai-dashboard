import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { SidebarLink } from "@/components/SidebarLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Analytics AI Dashboard",
  description: "Interactive analytics dashboard with Chat with Data",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm px-6 py-3 flex gap-6 font-medium sticky top-0 z-10">
          <SidebarLink href="/dashboard" label="Dashboard" />
          <SidebarLink href="/invoices" label="Invoices" />
          <SidebarLink href="/vendors" label="Vendors" />
          <SidebarLink href="/trends" label="Trends" />
          <SidebarLink href="/chat-with-data" label="Chat" />
        </nav>

        {/* Main content area */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
