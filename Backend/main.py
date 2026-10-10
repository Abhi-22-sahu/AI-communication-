from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.models.session import CommunicationSession
from Backend.models.message import PracticeMessage
from Backend.routes.message import router as message_router
from Backend.routes.auth import router as auth_router
from Backend.routes.session import router as session_router
from Backend.database.connection import Base,engine
from Backend.models.user import User
from Backend.models.analysis import CommunicationAnalysis
from Backend.routes.analysis import router as analysis_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Communication Coach",
    description="AI-powered professional communication improvement platform",
    version="1.0.0",
    swagger_ui_parameters={
        "presistAuthorization": True
    }
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(session_router)
app.include_router(message_router)
app.include_router(analysis_router)


@app.get("/")
def home():
    return{
        "message":"AI Communication Coach API is running",
        "status": "success"
    }

@app.get("/api/health")
def health_check():
    return{
        "status": "healthy"
    }