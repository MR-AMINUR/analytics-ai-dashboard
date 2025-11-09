# Vanna AI Service

A FastAPI service that connects to PostgreSQL and uses Groq for natural-language analytics.

## Run locally
```bash
cd services/vanna
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
