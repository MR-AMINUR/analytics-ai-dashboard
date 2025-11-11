// src/services/cashflow.service.ts
export const fetchCashOutflowForecast = async () => {
  // 🧪 Mock data (until DB data available)
  const mockData = {
    start: "2025-11-11T00:00:00.000Z",
    end: "2026-01-10T00:00:00.000Z",
    rows: [
      { range: "0 - 7 days", value: 18000 },
      { range: "8 - 30 days", value: 22000 },
      { range: "31 - 60 days", value: 9000 },
      { range: "60+ days", value: 48000 },
    ],
  };

  // simulate small delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockData;
};
