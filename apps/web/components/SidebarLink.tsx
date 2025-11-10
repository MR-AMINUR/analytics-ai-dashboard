
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

/**
 * SidebarLink - A reusable link component that highlights the active page
 */
export function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();  // Get the current URL path
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md transition-all duration-200 ${
        isActive
          ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
      }`}
    >
      {label}
    </Link>
  );
}


// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React from "react";
// import { SidebarLink } from "@/components/SidebarLink";

// /**
//  * SidebarLink - A reusable link component that highlights the active page
//  */
// export function RootLayout({ href, label }: { href: string; label: string }) {
//   const pathname = usePathname();  // Get the current URL path
//   const isActive = pathname === href;

//   return (
//     <Link
//       href={href}
//       className={`block px-3 py-2 rounded-md transition-all duration-200 ${
//         isActive
//           ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
//           : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
//       }`}
//     >
//       {label}
//     </Link>
//   );
// }
