import { NextResponse } from "next/server";

export async function GET() {
  const data = { totalSpendYtd: 47732, totalInvoices: 6, documentsUploaded: 6, averageInvoiceValue: 7955.33 };
  return NextResponse.json(data);
}
