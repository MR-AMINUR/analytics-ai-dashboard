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


