# SoulCircle Advanced — AI Mental Wellness Copilot

> An empathetic, context-aware conversational platform equipped with sentiment intelligence and multi-tiered safety guardrails, engineered for low-bandwidth cellular environments.

[![Live Deployment](https://img.shields.io/badge/Live%20Deployment-AIM%20Foundation-blue)](https://aimindia.org.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Backend-Python%20%7C%20FastAPI-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%20%7C%20TypeScript-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E)](https://supabase.com)

---

## 📌 Overview

**SoulCircle** is an AI-powered conversational mental wellness platform developed to bridge the psychological support gap for individuals without reliable access to professional counseling. Deployed live on the [Associated Initiative for Mankind (AIM) Foundation](https://aimindia.org.in) central infrastructure, the platform has actively served **1,000+ user sessions**.

The platform is explicitly designed for resource-constrained environments: it combines lightweight client-side state caching with a robust backend inference layer that pairs Large Language Models with **deterministic safety classifiers** and **emotion tracking heuristics**.

---

## 🌟 Key Features

### 1. Context-Aware Empathetic Dialogue
- Maintains multi-turn conversation memory with dynamic context compression to prevent token overflow.
- Delivers validating, compassionate, and non-judgmental guidance grounded in supportive cognitive behavioral techniques.

### 2. Emotion & Sentiment Analysis (`emotion_dataset.csv`)
- Integrates a lightweight emotion classification layer that monitors emotional valence (e.g., anxiety, sadness, loneliness, calm) across the conversation timeline.
- Adapts tone and pacing dynamically according to the user's emotional state.

### 3. Crisis Intervention & Safety Guardrails (`safety_dataset.csv`)
- **Zero-Tolerance Safety Triggers:** A deterministic safety pipeline evaluates user inputs before LLM inference.
- Flags self-harm, severe distress, or emergency signals using verified safety datasets.
- Immediately halts generative synthesis and presents verified regional emergency helplines and counselor escalation pathways.

### 4. Optimized for Low-Bandwidth Networks
- Engineered with minimal payload sizes, offline message queuing, and responsive UI caching for seamless mobile operation over 2G/3G connections.

---

## 🏗 System Architecture
