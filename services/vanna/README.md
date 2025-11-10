# 🧠 Vanna AI Service

A **FastAPI microservice** that connects to **PostgreSQL** and uses **Groq’s LLMs** to power natural-language analytics for your “Chat with Data” interface.

This service receives user questions (in plain English), converts them into SQL queries using Groq, executes them against your PostgreSQL database, and returns structured JSON results.

---

## 🚀 Features

- 🔍 Converts natural-language questions into SQL queries (via Groq LLM)
- 🗃️ Executes generated SQL directly on your PostgreSQL database
- ⚙️ REST API built with **FastAPI**
- 🔐 Environment-based configuration
- 🐳 Docker-ready for self-hosting
- ⚡ Compatible with your Node.js backend `/chat-with-data` route

---

## Run locally
```bash
cd services/vanna
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd services/vanna
pip install -r requirements.txt
python -m app.main



## Available models
openai/gpt-oss-safeguard-20b
whisper-large-v3-turbo
groq/compound-mini
qwen/qwen3-32b
meta-llama/llama-prompt-guard-2-86m
moonshotai/kimi-k2-instruct
meta-llama/llama-guard-4-12b
meta-llama/llama-4-maverick-17b-128e-instruct
openai/gpt-oss-120b
playai-tts
allam-2-7b
meta-llama/llama-prompt-guard-2-22m
whisper-large-v3
llama-3.1-8b-instant
openai/gpt-oss-20b
playai-tts-arabic
groq/compound
llama-3.3-70b-versatile
moonshotai/kimi-k2-instruct-0905
meta-llama/llama-4-scout-17b-16e-instruct
