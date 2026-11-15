# Learning Management System with AI Tutor (LMS-AI)
**Vertexon Learning Technologies Pvt. Ltd.**

An AI-augmented Learning Management System combining traditional LMS capabilities (courses, modules, video lectures, assignments, quizzes, certificates) with an embedded, context-aware AI Tutor grounded in lecture material via Retrieval-Augmented Generation (RAG).

---

## 📁 Project Structure

```
lms-ai-platform/
├── frontend/             # React 18 + TypeScript + Vite + Tailwind CSS
├── backend/              # Node.js + Express + TypeScript + BullMQ + PostgreSQL
├── ai-service/           # Python + FastAPI + RAG + pgvector + LLM Client
├── infra/                # Docker Compose, Nginx reverse proxy, K8s manifests
├── docs/                 # PRD, Architecture documentation & specs
├── .github/              # CI/CD Workflows
├── .env.example          # Environment variables template
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+
- **pnpm** or **npm**
- **Docker & Docker Compose**
- **Python 3.11+** (for local AI service development)

### 2. Configure Environment
Copy the `.env.example` file:
```bash
cp .env.example .env
```

### 3. Start Infrastructure via Docker Compose
To boot up PostgreSQL (with `pgvector`), Redis, MinIO, Backend, AI-Service, and Frontend:
```bash
cd infra
docker compose up -d
```

### 4. Running Locally in Development Mode

**Backend (Node.js/Express):**
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000/api/v1
```

**Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
# Web app running at http://localhost:3000
```

**AI Tutor Service (FastAPI):**
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# AI Tutor API docs at http://localhost:8000/docs
```

---

## 🛠 Features & Module Breakdown

1. **Student Module**:
   - Course catalog with category & difficulty filters.
   - Video lecture player with playback speed and progress tracking.
   - Note-taking, bookmarking, and assignment submissions.
   - Auto-graded objective quizzes and auto-generated PDF certificates.

2. **AI Tutor Module (RAG)**:
   - Course-scoped Q&A grounded in lecture transcripts with timestamp source citation.
   - Lecture summarization & flashcard generation.
   - Dynamic explanation depth adjustments (Beginner / Intermediate / Advanced).
   - Automated quiz generation from transcripts for instructor approval.

3. **Instructor & Admin Module**:
   - Course creation, module sequencing, and asset uploads.
   - Analytics dashboard (per-lecture drop-off, quiz performance).
   - Admin course approval queue and platform governance.
