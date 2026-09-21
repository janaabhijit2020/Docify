# DOCIFY

### AI-Powered Document Assistant

DOCIFY is a full-stack AI-powered document assistant that allows users to upload documents, ask questions about their content, generate AI-powered insights, and maintain persistent conversations.

It uses **Retrieval-Augmented Generation (RAG)** with **Google Gemini, Spring AI, PostgreSQL, and PGVector** to retrieve relevant information from uploaded documents before generating answers.

---

## 🌐 Live Application

**Frontend:** https://docify-taupe.vercel.app

**Backend:** https://docify-29w0.onrender.com

---

## ✨ Features

### 📄 Document Management

- Upload PDF, DOCX, and TXT documents
- File type and content validation
- File size restrictions
- Secure document ownership
- Document listing
- Document deletion
- Persistent cloud document storage

### 🤖 AI-Powered Document Assistant

- Ask questions about uploaded documents
- Retrieval-Augmented Generation (RAG)
- Semantic vector search
- Context-aware AI responses
- Google Gemini integration
- Configurable document chunking
- Configurable retrieval parameters

### 🧠 AI Document Actions

- Document summarization
- Key information extraction
- AI-powered document analysis
- Document-focused AI operations

### 💬 Persistent Conversations

- Create conversations for documents
- Continue previous conversations
- Persistent chat history
- Conversation-specific messages
- Conversation timestamps
- Restore conversations after refreshing the browser

### 🔐 Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- BCrypt password hashing
- Protected REST APIs
- User-specific document access
- User-specific conversation access

### ☁️ Cloud Deployment

- React frontend deployed on Vercel
- Spring Boot backend deployed on Render
- PostgreSQL + PGVector hosted on Supabase
- Supabase Storage for persistent document storage

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │     Web Browser     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    React + Vite     │
                         │       Vercel        │
                         └──────────┬──────────┘
                                    │
                                 REST API
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │       Spring Boot API        │
                    │           Render             │
                    │                              │
                    │  Authentication / JWT       │
                    │  Document Management         │
                    │  Conversation Management     │
                    │  RAG Pipeline                │
                    │  AI Services                 │
                    └───────┬──────────────┬───────┘
                            │              │
                            │              │
                            ▼              ▼
                 ┌─────────────────┐  ┌─────────────────┐
                 │   PostgreSQL    │  │  Google Gemini  │
                 │    + PGVector   │  │                 │
                 │    Supabase     │  │ Chat + Embedding│
                 └─────────────────┘  └─────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Supabase Storage  │
                 │                     │
                 │ PDF / DOCX / TXT    │
                 └─────────────────────┘

Backend

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| Java 26         | Backend development                |
| Spring Boot     | REST API and application framework |
| Spring Security | Authentication and authorization   |
| JWT             | Stateless authentication           |
| Spring Data JPA | Database persistence               |
| Spring AI       | AI and RAG integration             |
| Google Gemini   | LLM and embeddings                 |
| PostgreSQL      | Relational database                |
| PGVector        | Vector similarity search           |
| Apache Tika     | Document content extraction        |
| Maven           | Dependency management              |

Frontend

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| React          | User interface          |
| Vite           | Frontend build tool     |
| JavaScript     | Application development |
| React Router   | Client-side routing     |
| Axios          | REST API communication  |
| Material UI    | UI components           |
| React Markdown | AI response rendering   |
| Lucide React   | Icons                   |

Infrastructure
| Technology | Purpose                          |
| ---------- | -------------------------------- |
| Vercel     | Frontend deployment              |
| Render     | Backend deployment               |
| Supabase   | PostgreSQL, PGVector and Storage |
| Docker     | Local PostgreSQL + PGVector      |
| Git        | Version control                  |
| GitHub     | Source code hosting              |

📂 Project Structure
Docify/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/docify/backend/
│   │   │   │       ├── ai/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── document/
│   │   │   │       ├── dto/
│   │   │   │       ├── entity/
│   │   │   │       ├── exception/
│   │   │   │       ├── rag/
│   │   │   │       ├── repository/
│   │   │   │       ├── security/
│   │   │   │       └── service/
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-prod.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── docker/
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
└── README.md

🗄️ Database
User
 │
 ├── Documents
 │
 └── Conversations
          │
          └── Messages

Document
 │
 └── Vector Embeddings
          │
          └── PGVector
🔐 Environment Variables
DB_URL=jdbc:postgresql://localhost:5432/docify
DB_USERNAME=docify
DB_PASSWORD=your_database_password

JWT_SECRET=your_long_random_secret
JWT_EXPIRATION_MS=86400000

GEMINI_API_KEY=your_gemini_api_key

☁️ Deployment Architecture
Frontend
React + Vite
      │
      ▼
   Vercel
Backend
Spring Boot
      │
      ▼
   Render
Database & Storage
             Supabase
          ┌─────┴─────┐
          │           │
     PostgreSQL    Storage
          │
       PGVector

This architecture keeps application data and uploaded documents persistent independently of frontend and backend deployments.


🎯 Project Highlights

DOCIFY demonstrates practical implementation of:

Full-stack application development
REST API architecture
JWT authentication
Authorization and resource ownership
Document processing
Vector databases
Retrieval-Augmented Generation
Generative AI integration
Semantic search
Persistent conversation systems
Cloud storage
Containerized development
Cloud deployment

🔮 Future Improvements

Potential future enhancements include:

Streaming AI responses
Multi-document conversations
Advanced document comparison
Improved retrieval and reranking
Document preview
Usage analytics
Additional AI models
Expanded automated test coverage

👨‍💻 Author
Abhijit Jana

DOCIFY
AI-Powered Document Assistant
Built with Java Spring Boot, React, PostgreSQL, PGVector, Google Gemini and modern cloud infrastructure.