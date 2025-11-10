import os
import json
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from db import engine  # uses your existing db.py

# ----------------------------
# CONFIG
# ----------------------------
FOLDER_PATH = "../../../data"  # change if needed


# ----------------------------
# HELPER FUNCTIONS
# ----------------------------
def parse_date(value):
    """Safely parse date from various string formats."""
    if not value or not isinstance(value, str):
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%Y-%m"):
        try:
            return datetime.strptime(value, fmt).date()
        except Exception:
            continue
    return None


def to_text(val, default='-'):
    """Ensure text is never None or empty."""
    if val is None:
        return default
    s = str(val).strip()
    return s if s else default


def to_numeric(val, default=0.0):
    """Convert anything to float; empty or invalid becomes default."""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    try:
        s = str(val).strip()
        if not s:
            return default
        s = s.replace(",", ".") if "," in s and "." not in s else s
        return float(s)
    except Exception:
        return default


def get_val(obj, key, default=None):
    """Safely extract nested 'value' fields."""
    if not obj:
        return default
    val = obj.get(key, {})
    if isinstance(val, dict):
        return val.get("value", default)
    return val or default


# ----------------------------
# GLOBAL COUNTERS
# ----------------------------
stats = {
    "vendors": 0,
    "customers": 0,
    "invoices": 0,
    "payments": 0,
    "line_items": 0,
    "records_failed": 0,
}


# ----------------------------
# MAIN INGEST FUNCTION
# ----------------------------
def insert_data_from_json(record, conn):
    """Insert one record’s data into normalized tables."""
    llm = record.get("extractedData", {}).get("llmData", {})

    vendor = llm.get("vendor", {}).get("value", {})
    customer = llm.get("customer", {}).get("value", {})
    summary_node = llm.get("summary", {})
    summary = summary_node.get("value", {}) if isinstance(summary_node, dict) else {}
    invoice_node = llm.get("invoice", {})
    invoice = invoice_node.get("value", {}) if isinstance(invoice_node, dict) else {}
    payment_node = llm.get("payment", {})
    payment = payment_node.get("value", {}) if isinstance(payment_node, dict) else {}
    line_items = llm.get("lineItems", {})

    try:
        with conn.begin_nested():  # rollback only this record on failure
            # ----------------------------
            # VENDOR
            # ----------------------------
            vendor_name = to_text(get_val(vendor, "vendorName"))
            vendor_address = to_text(get_val(vendor, "vendorAddress"))
            vendor_tax_id = to_text(get_val(vendor, "vendorTaxId"))

            vendor_sql = text("""
                INSERT INTO vendors (vendor_name, vendor_address, vendor_tax_id)
                VALUES (:vendor_name, :vendor_address, :vendor_tax_id)
                ON CONFLICT (vendor_name, vendor_tax_id)
                DO UPDATE SET vendor_address = EXCLUDED.vendor_address
                RETURNING vendor_id;
            """)
            vendor_id = conn.execute(vendor_sql, {
                "vendor_name": vendor_name,
                "vendor_address": vendor_address,
                "vendor_tax_id": vendor_tax_id
            }).scalar()

            if vendor_id:
                stats["vendors"] += 1

            # ----------------------------
            # CUSTOMER
            # ----------------------------
            customer_name = to_text(get_val(customer, "customerName"))
            customer_address = to_text(get_val(customer, "customerAddress"))
            customer_id = None
            if customer_name:
                customer_sql = text("""
                    INSERT INTO customers (customer_name, customer_address)
                    VALUES (:customer_name, :customer_address)
                    ON CONFLICT (customer_name, customer_address)
                    DO NOTHING
                    RETURNING customer_id;
                """)
                customer_id = conn.execute(customer_sql, {
                    "customer_name": customer_name,
                    "customer_address": customer_address
                }).scalar()
                if customer_id:
                    stats["customers"] += 1

            # ----------------------------
            # INVOICE
            # ----------------------------
            invoice_number = to_text(get_val(invoice, "invoiceId"))
            invoice_date = parse_date(get_val(invoice, "invoiceDate"))
            delivery_date = parse_date(get_val(invoice, "deliveryDate"))
            document_type = get_val(summary, "documentType", "invoice") or "invoice"
            if document_type not in ("invoice", "creditNote"):
                document_type = "invoice"
            currency_symbol = to_text(get_val(summary, "currencySymbol", "€"))
            subtotal = to_numeric(get_val(summary, "subTotal"))
            total_tax = to_numeric(get_val(summary, "totalTax"))
            invoice_total = to_numeric(get_val(summary, "invoiceTotal"))

            invoice_sql = text("""
                INSERT INTO invoices (
                    invoice_number, invoice_date, delivery_date, document_type,
                    currency_symbol, subtotal, total_tax, invoice_total,
                    vendor_id, customer_id
                )
                VALUES (
                    :invoice_number, :invoice_date, :delivery_date, :document_type,
                    :currency_symbol, :subtotal, :total_tax, :invoice_total,
                    :vendor_id, :customer_id
                )
                ON CONFLICT (invoice_number, vendor_id)
                DO NOTHING
                RETURNING invoice_id;
            """)
            invoice_id = conn.execute(invoice_sql, {
                "invoice_number": invoice_number,
                "invoice_date": invoice_date,
                "delivery_date": delivery_date,
                "document_type": document_type,
                "currency_symbol": currency_symbol,
                "subtotal": subtotal,
                "total_tax": total_tax,
                "invoice_total": invoice_total,
                "vendor_id": vendor_id,
                "customer_id": customer_id
            }).scalar()

            if not invoice_id:
                print(f"⚠️ Skipping duplicate or invalid invoice: {invoice_number}")
                return

            stats["invoices"] += 1

            # ----------------------------
            # PAYMENTS
            # ----------------------------
            if isinstance(payment, dict) and payment:
                payment_sql = text("""
                    INSERT INTO payments (
                        invoice_id, due_date, payment_terms, bank_account_number,
                        bic, account_name, net_days, discount_percentage,
                        discount_days, discount_due_date, discounted_total
                    )
                    VALUES (
                        :invoice_id, :due_date, :payment_terms, :bank_account_number,
                        :bic, :account_name, :net_days, :discount_percentage,
                        :discount_days, :discount_due_date, :discounted_total
                    );
                """)
                conn.execute(payment_sql, {
                    "invoice_id": invoice_id,
                    "due_date": parse_date(get_val(payment, "dueDate")),
                    "payment_terms": to_text(get_val(payment, "paymentTerms")),
                    "bank_account_number": to_text(get_val(payment, "bankAccountNumber")),
                    "bic": to_text(get_val(payment, "BIC")),
                    "account_name": to_text(get_val(payment, "accountName")),
                    "net_days": to_numeric(get_val(payment, "netDays")),
                    "discount_percentage": to_numeric(get_val(payment, "discountPercentage")),
                    "discount_days": to_numeric(get_val(payment, "discountDays")),
                    "discount_due_date": parse_date(get_val(payment, "discountDueDate")),
                    "discounted_total": to_numeric(get_val(payment, "discountedTotal")),
                })
                stats["payments"] += 1

            # ----------------------------
            # LINE ITEMS
            # ----------------------------
            items = line_items.get("value", {}).get("items", {}).get("value", [])
            if items:
                line_sql = text("""
                    INSERT INTO invoice_line_items (
                        invoice_id, line_no, description, quantity,
                        unit_price, total_price, sachkonto, bu_schluessel,
                        vat_rate, vat_amount
                    ) VALUES (
                        :invoice_id, :line_no, :description, :quantity,
                        :unit_price, :total_price, :sachkonto, :bu_schluessel,
                        :vat_rate, :vat_amount
                    );
                """)
                for item in items:
                    conn.execute(line_sql, {
                        "invoice_id": invoice_id,
                        "line_no": to_numeric(get_val(item, "srNo")),
                        "description": to_text(get_val(item, "description")),
                        "quantity": to_numeric(get_val(item, "quantity")),
                        "unit_price": to_numeric(get_val(item, "unitPrice")),
                        "total_price": to_numeric(get_val(item, "totalPrice")),
                        "sachkonto": to_text(get_val(item, "Sachkonto")),
                        "bu_schluessel": to_text(get_val(item, "BUSchluessel")),
                        "vat_rate": to_numeric(get_val(item, "vatRate")),
                        "vat_amount": to_numeric(get_val(item, "vatAmount")),
                    })
                    stats["line_items"] += 1

    except Exception as e:
        stats["records_failed"] += 1
        print(f"❌ Record-level error (rolled back safely): {e}")


# ----------------------------
# FOLDER PROCESSOR
# ----------------------------
def load_folder(folder_path=FOLDER_PATH):
    print(f"📁 Scanning folder: {folder_path}")
    files = [f for f in os.listdir(folder_path) if f.endswith(".json")]
    if not files:
        print("⚠️ No JSON files found.")
        return

    with engine.begin() as conn:
        for file in files:
            file_path = os.path.join(folder_path, file)
            print(f"📄 Loading: {file}")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception as e:
                print(f"❌ Error reading {file}: {e}")
                continue

            records = data if isinstance(data, list) else [data]
            for record in records:
                insert_data_from_json(record, conn)

    # ----------------------------
    # FINAL SUMMARY
    # ----------------------------
    print("\n📊 ETL Summary:")
    print(f"   🧾 Vendors inserted:       {stats['vendors']}")
    print(f"   👥 Customers inserted:     {stats['customers']}")
    print(f"   📑 Invoices inserted:      {stats['invoices']}")
    print(f"   💰 Payments inserted:      {stats['payments']}")
    print(f"   🧮 Line items inserted:    {stats['line_items']}")
    print(f"   ⚠️ Records failed:         {stats['records_failed']}")
    print("\n✅ All JSON files ingested successfully!")


# ----------------------------
# MAIN
# ----------------------------
if __name__ == "__main__":
    load_folder()
