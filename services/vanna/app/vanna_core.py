import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_sql(question: str) -> str:
    """
    Generate a valid SQL query from a natural language question using Groq's model.
    """
    schema_hint = """
    Tables:
    - vendors(vendor_id, vendor_name, vendor_address, vendor_tax_id)
    - invoices(invoice_id, invoice_number, invoice_date, vendor_id, customer_id, invoice_total)
    - invoice_line_items(line_item_id, invoice_id, description, quantity, unit_price, total_price)
    - customers(customer_id, customer_name, customer_address)
    - payments(payment_id, invoice_id, due_date, discounted_total)

    Use these table and column names exactly as shown.
    """

    prompt = f"""
    You are an expert PostgreSQL SQL generator.
    {schema_hint}

    Generate a valid SQL query to answer this question:
    "{question}"

    Only output the SQL, no explanations.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # ✅ recommended model
            messages=[
                {"role": "system", "content": "You are an expert SQL assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
        )

        sql_text = response.choices[0].message.content.strip()
        sql_text = sql_text.replace("```sql", "").replace("```", "").strip()
        return sql_text
    except Exception as e:
        raise RuntimeError(f"Groq API error: {e}")
