from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.routes import users, discovery, matches, chat, settings, auth
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ConnectHub Backend API",
    description="Backend API for ConnectHub dating app",
    version="1.0.0"
)

allowed_origins_list = ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000", "http://localhost:5174"]

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(discovery.router, prefix="/api/discover", tags=["discovery"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "ConnectHub Backend API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
