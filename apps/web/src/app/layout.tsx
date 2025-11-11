import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DashboardLayout from "./layouts/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowbit AI Dashboard",
  description: "Analytics Dashboard powered by Flowbit AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}


// import "./globals.css";
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Flowbit AI Dashboard",
//   description: "Analytics Dashboard powered by Flowbit AI",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {children}
//       </body>
//     </html>
//   );
// }
