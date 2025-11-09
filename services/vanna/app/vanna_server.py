from vanna.flask import VannaFlaskApp
from vanna.remote import VannaDefault
from sqlalchemy import create_engine
#from flask_cors import CORS

# Initialize your Vanna remote model
vn = VannaDefault(model="flowbit-ai", api_key="vn-6f2728e0548a4ab79ace4ac5994af9eb")

# ✅ Correct way to attach the database
engine = create_engine("postgresql://postgres:0000@localhost:5432/analytics_ai")
vn.db = engine

# Launch the Flask app
app = VannaFlaskApp(vn)
# CORS(app)  # ✅ add this

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


# from fastapi import FastAPI, Request
# from vanna.remote import VannaDefault
# import pandas as pd
# import uvicorn
# import sqlalchemy

# # 🔐 Replace with your credentials
# MODEL_NAME = "Analytics-AI"  # e.g., "yourusername/analytics-model"
# API_KEY ="vn-6f2728e0548a4ab79ace4ac5994af9eb"        # from https://vanna.ai
# #DB_URL = "postgresql://user:password@localhost:5432/analyticsdb"  # or sqlite:///analytics.db
# DB_URL = "sqlite:///analytics.db"
# # Connect to your Vanna model
# vn = VannaDefault(model=MODEL_NAME, api_key=API_KEY)

# # Connect to your database
# engine = sqlalchemy.create_engine(DB_URL)

# app = FastAPI(title="Vanna API Server")

# @app.post("/query")
# async def query(request: Request):
#     """Receive a question, generate SQL, execute, and return results."""
#     data = await request.json()
#     question = data.get("question")

#     if not question:
#         return {"error": "No question provided"}

#     try:
#         sql = vn.generate_sql(question)
#         df = pd.read_sql_query(sql, engine)
#         return {
#             "question": question,
#             "sql": sql,
#             "answer": df.to_dict(orient="records")
#         }
#     except Exception as e:
#         return {"error": str(e)}

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
