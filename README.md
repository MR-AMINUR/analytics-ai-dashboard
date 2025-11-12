# 🌐 Flowbit AI Dashboard

A full-stack **analytics dashboard** powered by **AI-driven insights**.  
Built with **Next.js (frontend)**, **Node.js (backend)**, **PostgreSQL (NeonDB)**, and **Vanna AI** for natural language data querying.

---

## ⚙️ Setup & Configuration

### Prerequisites
- **Node.js ≥ 18**
- **NeonDB PostgreSQL** connection (live or local)
- Environment variables configured in `.env.local`

```bash
# .env.local
DATABASE_URL="npg_V8PGH3gLzhen@ep-blue-glitter-ad8u7od3-pooler.c-2.us-east-1.aws.neon.tech"
VANNA_API_BASE_URL="https://analytics-ai-dashboard.onrender.com"

🧩 Run Locally
# Start backend
cd apps/api
npm install
npm run dev

# Start frontend
cd ../web
npm install
npm run dev


Once running:
    Frontend: http://localhost:3000
    Backend API: http://localhost:4000

🧠 API Routes & Example Responses

All endpoints are RESTful and return JSON responses.
Base URL (Production):
https://flowbit-ai-jade.vercel.app

GET /api/stats

Returns overview metrics for the dashboard.

Example Response:
{
    "totalSpendYtd": 49938.42,
    "totalInvoices": 19,
    "documentsUploaded": 19,
    "averageInvoiceValue": 3226.37
}


GET /api/invoice-trends

Returns monthly invoice volume and spend.

Example Response:
{
    "total": 19,
    "page": 1,
    "pageSize": 25,
    "rows": [
        {
            "invoice_id": "12",
            "invoice_number": "-",
            "invoice_date": null,
            "amount": 0,
            "currency": "€",
            "vendor": {
                "vendor_id": "13",
                "vendor_name": "-"
            },
            "customer": {
                "customer_id": "13",
                "customer_name": "-"
            },
            "status": "pending"
        },
        {
            "invoice_id": "10",
            "invoice_number": "1234",
            "invoice_date": "2025-11-04T00:00:00.000Z",
            "amount": -358.79,
            "currency": "-",
            "vendor": {
                "vendor_id": "11",
                "vendor_name": "Musterfirma Müller"
            },
            "customer": {
                "customer_id": "11",
                "customer_name": "Max Mustermann"
            },
            "status": "pending"
        },
        {
            "invoice_id": "11",
            "invoice_number": "1234",
            "invoice_date": "2025-11-04T00:00:00.000Z",
            "amount": -358.79,
            "currency": "€",
            "vendor": {
                "vendor_id": "12",
                "vendor_name": "Musterfirma Müller"
            },
            "customer": {
                "customer_id": "12",
                "customer_name": "Max Mustermann"
            },
            "status": "pending"
        }
    ]
}


GET /api/vendors/top10

Returns top 10 vendors by total spend.

Example Response:

[
    {
        "vendor_id": "4",
        "vendor_name": "NextGen Pvt Ltd",
        "spend": 24780
    },
    {
        "vendor_id": "1",
        "vendor_name": "TechNova Solutions",
        "spend": 17700
    },
    {
        "vendor_id": "22",
        "vendor_name": "ABC Seller",
        "spend": 4645
    },
    {
        "vendor_id": "16",
        "vendor_name": "pixa",
        "spend": 3653.3
    },
    {
        "vendor_id": "5",
        "vendor_name": "Pixel Works",
        "spend": 2975
    } 
    
]



GET /api/category-spend

Returns spend grouped by category.

Example Response

[
    {
        "category": "4001",
        "spend": 140000
    },
    {
        "category": "7001",
        "spend": 20000
    },
    {
        "category": "4400",
        "spend": 6212.3
    },
    {
        "category": "4002",
        "spend": 2500
    },
    {
        "category": "8001",
        "spend": 2400
    }
    
]


GET /api/cash-outflow

Returns upcoming payment outflow forecast.

Example Response

{
    "start": "2025-11-11T00:00:00.000Z",
    "end": "2026-01-10T00:00:00.000Z",
    "rows": [
        {
            "range": "0 - 7 days",
            "value": 18000
        },
        {
            "range": "8 - 30 days",
            "value": 22000
        },
        {
            "range": "31 - 60 days",
            "value": 9000
        },
        {
            "range": "60+ days",
            "value": 48000
        }
    ]
}


GET /api/invoices

Returns searchable list of invoices with metadata.

Example Response

{
    "total": 19,
    "page": 1,
    "pageSize": 25,
    "rows": [
        {
            "invoice_id": "12",
            "invoice_number": "-",
            "invoice_date": null,
            "amount": 0,
            "currency": "€",
            "vendor": {
                "vendor_id": "13",
                "vendor_name": "-"
            },
            "customer": {
                "customer_id": "13",
                "customer_name": "-"
            },
            "status": "pending"
        },
        {
            "invoice_id": "10",
            "invoice_number": "1234",
            "invoice_date": "2025-11-04T00:00:00.000Z",
            "amount": -358.79,
            "currency": "-",
            "vendor": {
                "vendor_id": "11",
                "vendor_name": "Musterfirma Müller"
            },
            "customer": {
                "customer_id": "11",
                "customer_name": "Max Mustermann"
            },
            "status": "pending"
        },
        {
            "invoice_id": "11",
            "invoice_number": "1234",
            "invoice_date": "2025-11-04T00:00:00.000Z",
            "amount": -358.79,
            "currency": "€",
            "vendor": {
                "vendor_id": "12",
                "vendor_name": "Musterfirma Müller"
            },
            "customer": {
                "customer_id": "12",
                "customer_name": "Max Mustermann"
            },
            "status": "pending"
        }
    ]
}



POST /api/chat-with-data

Forwards natural language query to Vanna AI,
which generates SQL, executes it on PostgreSQL, and returns results.

Example Request

POST /api/chat-with-data
Content-Type: application/json

{
  "question": "List top 5 vendors by spend"
}

Example Successful Response

{
    "sql": "SELECT \n    v.vendor_name, \n    SUM(il.total_price) AS total_spend\nFROM \n    vendors v\nJOIN \n    invoices i ON v.vendor_id = i.vendor_id\nJOIN \n    invoice_line_items il ON i.invoice_id = il.invoice_id\nGROUP BY \n    v.vendor_name\nORDER BY \n    total_spend DESC\nLIMIT 5;",
    "data": [
        {
            "vendor_name": "TechNova Solutions",
            "total_spend": 142500
        },
        {
            "vendor_name": "NextGen Pvt Ltd",
            "total_spend": 20000
        },
        {
            "vendor_name": "ABC Seller",
            "total_spend": 4357.6
        },
        {
            "vendor_name": "EasyFirma GmbH & Co KG",
            "total_spend": 3159.25
        },
        {
            "vendor_name": "pixa",
            "total_spend": 3070
        }
    ]
}



💬 Chat-with-Data Workflow

Frontend (Next.js) — user types a natural-language question

API Route (/api/chat-with-data) — forwards query to Vanna AI service

Vanna AI — uses LLM to generate an SQL query

PostgreSQL (NeonDB) — executes SQL to fetch real data

Dashboard — displays:

Generated SQL

Result table

Auto-rendered chart if applicable

Example flow:

User → Frontend → /api/chat-with-data → Vanna AI → PostgreSQL → JSON → UI (SQL + Chart)

Q: List top 5 vendors by spend
Generated SQL
SELECT 
    v.vendor_name, 
    SUM(il.total_price) AS total_spend
FROM 
    vendors v
JOIN 
    invoices i ON v.vendor_id = i.vendor_id
JOIN 
    invoice_line_items il ON i.invoice_id = il.invoice_id
GROUP BY 
    v.vendor_name
ORDER BY 
    total_spend DESC
LIMIT 5;
vendor_name	        total_spend
TechNova Solutions	142500
NextGen Pvt Ltd	    20000
ABC Seller	        4357.6
EasyFirma GmbH & Co KG	3159.25
pixa	            3070
