"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        📊 Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$9,700</p>
            <p className="text-xs text-green-500">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$2,425</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
