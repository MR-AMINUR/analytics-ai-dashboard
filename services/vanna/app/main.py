from fastapi import FastAPI
from .vanna_server import router
import os

app = FastAPI(title="Vanna AI - Chat with Data")

app.include_router(router, prefix="")

@app.get("/")
def root():
    return {"message": "Vanna AI service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
