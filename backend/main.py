import os
from dotenv import load_dotenv

# 👇 Yeh line aapki .env file se GEMINI_API_KEY ko system mein load kar degi
load_dotenv()

# backend/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router  # 👈 Yahan se backend. hata diya

app = FastAPI(title="EcoGuardian AI Agentic Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)