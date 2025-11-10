

'use client';


import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types based on your API responses
interface DashboardStats {
  totalSpendYtd: number;
  totalInvoices: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

interface VendorSpend {
  vendor_id: string;
  vendor_name: string;
  spend: number;
}

interface CategorySpend {
  category: string;
  spend: number;
}

interface Invoice {
  id: string;
  vendor_name: string;
  date: string;
  invoice_number: string;
  amount: number;
  status: string;
}

// Proper type for Pie chart data that matches Recharts expectations
interface PieData {
  name: string;
  value: number;
  [key: string]: any; // This fixes the index signature error
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Custom label component to handle the percent type safely
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name
}: any) => {
  if (typeof percent !== 'number') return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vendors, setVendors] = useState<VendorSpend[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform category data for Pie chart
  const pieData: PieData[] = categories.map(cat => ({
    name: `Category ${cat.category}`,
    value: cat.spend
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, vendorsRes, categoriesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/vendors/top10'),
          fetch('/api/category-spend')
        ]);

        const [statsData, vendorsData, categoriesData] = await Promise.all([
          statsRes.json(),
          vendorsRes.json(),
          categoriesRes.json()
        ]);

        setStats(statsData);
        setVendors(vendorsData);
        setCategories(categoriesData);
        
        // For now, create mock invoices data since your API returns stats
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            vendor_name: 'TechNova Solutions',
            date: '2025-11-09',
            invoice_number: 'INV-001',
            amount: 15000,
            status: 'paid'
          },
          {
            id: '2',
            vendor_name: 'NextGen Pvt Ltd',
            date: '2025-11-08',
            invoice_number: 'INV-002',
            amount: 5000,
            status: 'pending'
          },
          {
            id: '3',
            vendor_name: 'Pixel Works',
            date: '2025-11-07',
            invoice_number: 'INV-003',
            amount: 2400,
            status: 'paid'
          }
        ];
        setInvoices(mockInvoices);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats?.totalSpendYtd?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvoices || '0'}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.documentsUploaded || '0'}</div>
            <p className="text-xs text-muted-foreground">+8 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats?.averageInvoiceValue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Vendor - Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Vendor (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendors} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="vendor_name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toLocaleString()}`, 'Spend']} 
                />
                <Bar dataKey="spend" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `€${value.toLocaleString()}`,
                    name
                  ]} 
                />
                <legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices by Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.vendor_name}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>€{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}



