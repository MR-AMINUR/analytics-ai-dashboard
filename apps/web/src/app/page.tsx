"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { month: 'Jan', value: 35, spend: 25000 },
  { month: 'Feb', value: 45, spend: 32000 },
  { month: 'Mar', value: 40, spend: 28000 },
  { month: 'Apr', value: 50, spend: 35000 },
  { month: 'May', value: 55, spend: 38000 },
  { month: 'Jun', value: 48, spend: 33000 },
  { month: 'Jul', value: 42, spend: 30000 },
  { month: 'Aug', value: 52, spend: 36000 },
  { month: 'Sep', value: 58, spend: 40000 },
  { month: 'Oct', value: 47, spend: 8679.25 },
  { month: 'Nov', value: 38, spend: 27000 },
  { month: 'Dec', value: 32, spend: 23000 },
];

const vendorData = [
  { name: 'AcmeCorp', value: 45000 },
  { name: 'Test Solutions', value: 40000 },
  { name: 'PrimeVendors', value: 32000 },
  { name: 'DeltaServices', value: 18000 },
  { name: 'OmegaLtd', value: 16000 },
  { name: 'Global Supply', value: 8679.25 },
  { name: 'TechPro', value: 15000 },
  { name: 'AlphaGroup', value: 12000 },
  { name: 'BetaCorp', value: 9000 },
];

const categoryData = [
  { name: 'Operations', value: 55000, color: '#2B4DED' },
  { name: 'Marketing', value: 7250, color: '#F79661' },
  { name: 'Facilities', value: 1000, color: '#FFD1A7' },
];

const cashflowData = [
  { range: '0 - 7 days', value: 15000 },
  { range: '8-30 days', value: 24000 },
  { range: '31-60 days', value: 7000 },
  { range: '60+ days', value: 38000 },
];

const invoiceData = Array(9).fill(null).map(() => ({
  vendor: 'Phunix GmbH',
  date: '19.08.2025',
  value: '€ 736.78.44,00'
}));

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-7 py-3 h-16 bg-white border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 2.5V17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z" stroke="#D2D2D2" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium text-[#1C1C1C]">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-[#1C1C1C] leading-5">Aminur Mallick</span>
              <span className="text-xs text-[#64748B] leading-4">Admin</span>
            </div>
            <svg className="w-4 h-4 ml-1" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="0.667" fill="#1C1C1C"/>
              <circle cx="8" cy="3.333" r="0.667" fill="#1C1C1C"/>
              <circle cx="8" cy="12.667" r="0.667" fill="#1C1C1C"/>
            </svg>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex flex-col gap-4 p-7 bg-white">
          {/* Stats Cards */}
          <div className="flex items-center gap-4">
            <StatCard 
              title="Total Spend" 
              subtitle="(YTD)"
              value="€ 12.679,25" 
              change="+8.2%" 
              changeLabel="from last month"
              positive 
            />
            <StatCard 
              title="Total Invoices Processed" 
              value="64" 
              change="+8.2%" 
              changeLabel="from last month"
              positive 
            />
            <StatCard 
              title="Documents Uploaded" 
              subtitle="This Month"
              value="17" 
              change="-8" 
              changeLabel="less from last month"
              positive={false} 
            />
            <StatCard 
              title="Average Invoice Value" 
              value="€ 2.455,00" 
              change="+8.2%" 
              changeLabel="from last month"
              positive 
            />
          </div>

          {/* Charts Row 1 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-[#1C1C1C]">Invoice Volume + Value Trend</div>
                <div className="text-xs font-medium text-[#64748B]">Invoice count and total spend over 12 months.</div>
              </div>
              <div className="h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFF', 
                        border: '1px solid #E4E4E9', 
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 12px 34px -10px rgba(58, 77, 233, 0.15)'
                      }}
                      labelStyle={{ color: '#1C1C1C', fontSize: '14px', fontWeight: 600, opacity: 0.7 }}
                      itemStyle={{ color: '#314CFF', fontSize: '12px', fontWeight: 600 }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#1B1464" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="spend" stroke="rgba(27, 20, 100, 0.26)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-[#1C1C1C]">Spend by Vendor (Top 10)</div>
                <div className="text-xs font-medium text-[#64748B] w-[315px]">Vendor spend with cumulative percentage distribution.</div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorData} layout="horizontal" margin={{ left: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#666' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFF', 
                        border: '1px solid #E4E4E9', 
                        borderRadius: '12px',
                        padding: '12px 16px'
                      }}
                    />
                    <Bar dataKey="value" fill="#BDBCD6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="flex items-start gap-4">
            <div className="w-[335px] border border-[#E4E4E7] rounded-lg p-4 pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-[#1C1C1C]">Spend by Category</div>
                <div className="text-xs font-medium text-[#64748B] w-[315px]">Distribution of spending across different categories.</div>
              </div>
              <div className="h-[315px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2B4DED]" />
                    <span className="text-sm font-medium text-black opacity-50">Operations</span>
                  </div>
                  <span className="text-sm font-medium text-black opacity-90">$1,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F79661]" />
                    <span className="text-sm font-medium text-black opacity-50">Marketing</span>
                  </div>
                  <span className="text-sm font-medium text-black opacity-90">$7,250</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFD1A7]" />
                    <span className="text-sm font-medium text-black opacity-50">Facilities</span>
                  </div>
                  <span className="text-sm font-medium text-black opacity-90">$1,000</span>
                </div>
              </div>
            </div>

            <div className="w-[335px] border border-[#E4E4E7] rounded-lg p-4 pb-6 flex flex-col gap-7">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-[#1C1C1C]">Cash Outflow Forecast</div>
                <div className="text-xs font-medium text-[#64748B] w-[315px]">Expected payment obligations grouped by due date ranges.</div>
              </div>
              <div className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1B1464" radius={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 border border-[#E4E4E7] rounded-lg flex flex-col">
              <div className="p-4 pb-6">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-semibold text-[#1C1C1C]">Invoices by Vendor</div>
                  <div className="text-xs font-medium text-[#64748B] w-[315px]">Top vendors by invoice count and net value.</div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center h-8 bg-[#F6F6F7] border-b border-[#E4E4E7]">
                  <div className="flex items-center px-3 w-[155px]">
                    <span className="text-xs font-medium text-[#1C1C1C]">Vendor</span>
                  </div>
                  <div className="flex items-center px-3 flex-1">
                    <span className="text-xs font-medium text-[#1C1C1C]"># Invoices</span>
                  </div>
                  <div className="flex items-center justify-end px-3 w-[127px]">
                    <span className="text-xs font-medium text-[#1C1C1C]">Net Value</span>
                  </div>
                </div>
                {invoiceData.map((row, i) => (
                  <div key={i} className="flex items-center h-11 bg-white border-b border-[#E4E4E7]">
                    <div className="flex items-center px-3 w-[125px]">
                      <span className="text-xs text-[#1C1C1C]">{row.vendor}</span>
                    </div>
                    <div className="flex items-center px-3 flex-1">
                      <span className="text-sm text-[#1C1C1C]">{row.date}</span>
                    </div>
                    <div className="flex items-center justify-end px-3 w-[148px]">
                      <div className="px-2 py-1 rounded-lg border border-[#E4E4E7]">
                        <span className="text-sm text-[#1C1C1C]">{row.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  subtitle, 
  value, 
  change, 
  changeLabel, 
  positive 
}: { 
  title: string; 
  subtitle?: string;
  value: string; 
  change: string; 
  changeLabel: string;
  positive: boolean; 
}) {
  return (
    <div className="w-[279px] border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex flex-col gap-7">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-black">{title}</span>
          {subtitle && <span className="text-xs font-medium text-[#64748B]">{subtitle}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold text-black leading-6">{value}</span>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-semibold ${positive ? 'text-[#2F9F02]' : 'text-[#ED1C24]'}`}>
                {change}
              </span>
              <span className="text-xs font-medium text-[#8598B3]">{changeLabel}</span>
            </div>
          </div>
          {/* Mini chart placeholder */}
          <svg width="46" height="26" viewBox="0 0 46 26" fill="none" className="flex-shrink-0">
            <path d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979" 
              stroke={positive ? "#3AB37E" : "#ED1C24"} 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
            {positive && <circle cx="42.25" cy="2.75" r="2" fill="white" stroke="#43B077" strokeWidth="1.5"/>}
            {!positive && <circle cx="38.88" cy="17.19" r="2" fill="white" stroke="#ED1C24" strokeWidth="1.5"/>}
          </svg>
        </div>
      </div>
    </div>
  );
}
