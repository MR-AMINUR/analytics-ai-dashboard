from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.vanna_core import generate_sql_and_execute

app = FastAPI(title="Vanna AI Service")

# Allow requests from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Vanna AI Service running!"}

@app.post("/query")
def query_vanna(request: dict):
    """
    Request body:
    { "question": "List top 5 vendors by spend" }
    """
    question = request.get("question")
    result = generate_sql_and_execute(question)
    return result
