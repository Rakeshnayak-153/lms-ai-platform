# LMS-AI System Architecture

Vertexon Learning Technologies Pvt. Ltd.

## 1. High-Level Architecture Overview

```
                      +---------------------------+
                      |        Client Apps        |
                      |  React SPA (Student /     |
                      |  Instructor / Admin views)|
                      +-------------+-------------+
                                    | HTTPS (REST/JSON)
                                    v
                      +---------------------------+
                      |        API Gateway        |
                      |   (NGINX / Reverse Proxy) |
                      | SSL Termination, Rate Lim |
                      +-------------+-------------+
                                    |
          +-------------------------+-------------------------+
          v                         v                         v
+--------------------+   +---------------------+   +--------------------+
|  Core LMS Service  |   |  AI Tutor Service   |   | Notification Svc   |
| (Node.js/Express)  |   |  (Python / FastAPI) |   |  (Node.js Worker)  |
| Auth, Courses,     |   | RAG, Embeddings,    |   | Email, in-app push |
| Enrollment, Quizzes|   | Summaries, Quizzes  |   | Streaks, Reminders |
+---------+----------+   +----------+----------+   +---------+----------+
          |                         |                        |
          v                         v                        v
+--------------------+   +---------------------+   +--------------------+
| PostgreSQL (Master)|   | Vector Store        |   | Redis (Cache/Queue)|
| Relational Data    |   | (pgvector / Chunks) |   | BullMQ, Session    |
+--------------------+   +---------------------+   +--------------------+
```

## 2. RAG Pipeline Flow
1. **Material Ingestion**: Instructor uploads lecture transcripts / slides / PDFs.
2. **Chunking & Embedding**: Document chunking with semantic boundaries, vectorized with embedding model (1536 dims).
3. **Storage**: Vector stored in PostgreSQL using `pgvector` index (`document_chunks` table).
4. **Student Inquiry**: Student asks question in chat interface.
5. **Retrieval**: Top-k similarity cosine search constrained to `course_id`.
6. **Prompt Assembly & Generation**: Augmented context sent to LLM provider with role-specific tone and difficulty mode.
7. **Source Citation**: Returned answer highlights timestamps and lecture references.

## 3. Security & RBAC Matrix
- JWT tokens with short expiry (15 minutes) and refresh token rotation (7 days).
- Middleware authorization via `requireRole('student' | 'instructor' | 'admin')`.
- Course-level ownership checks preventing unauthorized content updates.
