from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from sqlalchemy.orm import Session
from sqlalchemy import func
import pickle
import logging
from datetime import datetime, timedelta
from typing import Optional, List

import models
import auth
from database import engine, get_db

# =========================
# CREATE DB TABLES
# =========================
models.Base.metadata.create_all(bind=engine)

# =========================
# INIT APP
# =========================
app = FastAPI()

# =========================
# ENABLE CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOGGING
# =========================
logging.basicConfig(level=logging.INFO)

# =========================
# LOAD MODELS
# =========================
safety_classifier = pipeline(
    "text-classification",
    model="../safety_model",
    tokenizer="../safety_model"
)
emotion_classifier = pipeline(
    "text-classification",
    model="../emotion_model",
    tokenizer="../emotion_model"
)
with open("../label_encoder.pkl", "rb") as f:
    le = pickle.load(f)

# =========================
# SCHEMAS
# =========================
class UserInput(BaseModel):
    text: str
    conversation_id: Optional[int] = None

class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class MoodSchema(BaseModel):
    mood: str
    symbol: str
    value: int
    note: Optional[str] = ""

class JournalSchema(BaseModel):
    prompt: str
    entry: str

class ConversationTitleSchema(BaseModel):
    title: str

# =========================
# FUNCTIONS
# =========================
def detect_risk(text):
    result = safety_classifier(text)[0]
    label = int(result["label"].split("_")[-1])
    return label, result["score"]

def detect_emotion(text):
    result = emotion_classifier(text)[0]
    label_index = int(result["label"].split("_")[-1])
    decoded = le.inverse_transform([label_index])[0]
    emotion, stress = decoded.split("_")
    return emotion, result["score"]

responses = {
    "joy": "That's wonderful. What made today feel good?",
    "sadness": "I'm really sorry you're feeling low. Want to talk about it?",
    "anger": "That sounds frustrating. I'm here to listen.",
    "fear": "That sounds overwhelming. Take a deep breath with me.",
    "love": "That's really heartwarming.",
    "surprise": "That sounds unexpected. Tell me more.",
    "neutral": "I'm here with you. Tell me more about how you're feeling."
}

# =========================
# HOME ROUTE
# =========================
@app.get("/")
def home():
    return {"message": "SoulCircle API is running"}

# =========================
# AUTH ROUTES
# =========================
@app.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=auth.hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "name": user.name, "email": user.email}

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "name": user.name, "email": user.email}

@app.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}

# =========================
# CONVERSATION ROUTES
# =========================
@app.get("/conversations")
def get_conversations(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    convs = db.query(models.Conversation)\
        .filter(models.Conversation.user_id == current_user.id)\
        .order_by(models.Conversation.updated_at.desc())\
        .all()
    return [{"id": c.id, "title": c.title, "updated_at": c.updated_at} for c in convs]

@app.post("/conversations")
def create_conversation(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    conv = models.Conversation(user_id=current_user.id, title="New conversation")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {"id": conv.id, "title": conv.title}

@app.get("/conversations/{conv_id}/messages")
def get_messages(conv_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = db.query(models.Message).filter(models.Message.conversation_id == conv_id).order_by(models.Message.created_at).all()
    return [{"id": m.id, "sender": m.sender, "text": m.text, "emotion": m.emotion, "created_at": m.created_at} for m in msgs]

@app.patch("/conversations/{conv_id}")
def update_conversation_title(conv_id: int, data: ConversationTitleSchema, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Not found")
    conv.title = data.title
    db.commit()
    return {"ok": True}

@app.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(conv)
    db.commit()
    return {"ok": True}

# =========================
# ANALYZE ROUTE (updated)
# =========================
@app.post("/analyze")
def analyze(input: UserInput, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    logging.info(f"Input: {input.text}")

    # Get or create conversation
    if input.conversation_id:
        conv = db.query(models.Conversation).filter(
            models.Conversation.id == input.conversation_id,
            models.Conversation.user_id == current_user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = models.Conversation(user_id=current_user.id, title="New conversation")
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Safety check
    risk_label, risk_score = detect_risk(input.text)
    if risk_label == 0 and risk_score > 0.98:
        reply = "I'm really sorry you're feeling this way. You're not alone. Please consider reaching out to someone you trust or a helpline."
        _save_messages(db, conv.id, input.text, reply, "high_risk")
        _update_conv_title(db, conv)
        return {"status": "high_risk", "reply": reply, "conversation_id": conv.id, "helpline": "Local mental health support"}

    # Emotion detection
    emotion, confidence = detect_emotion(input.text)
    bot_reply = responses.get(emotion, "I'm here for you.")

    _save_messages(db, conv.id, input.text, bot_reply, emotion)
    _update_conv_title(db, conv)

    return {
        "status": "safe",
        "emotion": emotion,
        "reply": bot_reply,
        "confidence": round(confidence, 3),
        "conversation_id": conv.id
    }

def _save_messages(db, conv_id, user_text, bot_text, emotion):
    db.add(models.Message(conversation_id=conv_id, sender="user", text=user_text))
    db.add(models.Message(conversation_id=conv_id, sender="bot", text=bot_text, emotion=emotion))
    db.commit()

def _update_conv_title(db, conv):
    if conv.title == "New conversation":
        msgs = db.query(models.Message).filter(
            models.Message.conversation_id == conv.id,
            models.Message.sender == "user"
        ).first()
        if msgs:
            conv.title = msgs.text[:40] + ("..." if len(msgs.text) > 40 else "")
            db.commit()

# =========================
# MOOD ROUTES
# =========================
@app.post("/mood")
def save_mood(data: MoodSchema, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    entry = models.MoodEntry(
        user_id=current_user.id,
        mood=data.mood,
        symbol=data.symbol,
        value=data.value,
        note=data.note
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "ok": True}

@app.get("/mood")
def get_moods(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    entries = db.query(models.MoodEntry)\
        .filter(models.MoodEntry.user_id == current_user.id)\
        .order_by(models.MoodEntry.created_at.desc())\
        .limit(30).all()
    return [{"id": e.id, "mood": e.mood, "symbol": e.symbol, "value": e.value, "note": e.note, "created_at": e.created_at} for e in entries]

# =========================
# JOURNAL ROUTES
# =========================
@app.post("/journal")
def save_journal(data: JournalSchema, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    entry = models.JournalEntry(
        user_id=current_user.id,
        prompt=data.prompt,
        entry=data.entry
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "ok": True}

@app.get("/journal")
def get_journals(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    entries = db.query(models.JournalEntry)\
        .filter(models.JournalEntry.user_id == current_user.id)\
        .order_by(models.JournalEntry.created_at.desc())\
        .limit(20).all()
    return [{"id": e.id, "prompt": e.prompt, "entry": e.entry, "created_at": e.created_at} for e in entries]