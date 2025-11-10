from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .vanna_core import generate_sql
from .db import run_query

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/query")
def handle_query(req: QueryRequest):
    """
    Endpoint: /query
    Accepts JSON like: { "question": "List top 5 vendors by spend" }
    Returns: { "sql": "<generated SQL>", "data": [ ... ] }
    """
    try:
        sql = generate_sql(req.question)
        data = run_query(sql)
        return {"sql": sql, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
