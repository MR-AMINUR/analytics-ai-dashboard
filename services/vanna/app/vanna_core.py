import os
import psycopg2

def generate_sql_and_execute(question: str):
    """
    Placeholder logic for now — later this will connect to Groq
    to generate a SQL query from the natural language question.
    """
    sql = "SELECT * FROM invoices LIMIT 5;"  # Mock SQL
    data = execute_sql(sql)
    return {"sql": sql, "data": data}

def execute_sql(sql: str):
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    cur.execute(sql)
    columns = [desc[0] for desc in cur.description]
    rows = cur.fetchall()
    conn.close()
    return [dict(zip(columns, row)) for row in rows]
