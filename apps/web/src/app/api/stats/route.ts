// import { NextResponse } from "next/server";

// // Example mock stats data (replace with real DB call later)
// export async function GET() {
//   const data = {
//     totalSpend: 97200,
//     totalInvoices: 48,
//     avgInvoice: 2025,
//   };

//   return NextResponse.json(data);
// }

import { NextResponse } from "next/server";

export async function GET() {
  const data = { totalSpendYtd: 47732, totalInvoices: 6, documentsUploaded: 6, averageInvoiceValue: 7955.33 };
  return NextResponse.json(data);
}
