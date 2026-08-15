# AI Video Assistance - Complete Project Documentation

## 📌 Project Overview

**AI Video Assistance** is a full-stack web application that enables users to upload videos (or YouTube URLs) and have intelligent conversations about their content. The system automatically transcribes videos, creates vector embeddings for semantic search, and provides AI-powered responses using Retrieval-Augmented Generation (RAG).

### Use Cases
- 📹 **Educational Content Analysis**: Analyze lecture videos and ask questions about specific topics
- 🎬 **Video Summarization**: Get summaries and key points from videos
- 💬 **Interactive Learning**: Have a chat interface to clarify concepts from video content
- 📊 **Content Intelligence**: Retrieve specific information from long videos without watching them entirely
- 🎥 **Multi-Modal Support**: Process videos from files or YouTube URLs

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  - User Authentication (Login/Signup)                       │
│  - Chat Interface                                           │
│  - Video Upload                                             │
│  - Conversation Management                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routers                                         │   │
│  │ - Auth (Login/Signup)                               │   │
│  │ - Conversations (CRUD)                              │   │
│  │ - Messages (Chat History)                           │   │
│  │ - Upload (Video/YouTube)                            │   │
│  │ - Chat (Q&A with RAG)                               │   │
│  │ - LLM (Direct AI queries)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Core Services                                        │  │
│  │ - Transcriber: Audio to text (Whisper/Sarvam)       │  │
│  │ - RAG Engine: Retrieval-Augmented Generation         │  │
│  │ - Vector Store: Semantic search & embeddings        │  │
│  │ - Audio Extractor: Video → Audio                    │  │
│  │ - Chat Service: Message processing                  │  │
│  │ - YouTube Service: Download & process URLs          │  │
│  │ - Summarizer: Generate video summaries              │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data Layer                                           │  │
│  │ - SQLite Database (Users, Conversations, Messages)   │  │
│  │ - Chroma Vector DB (Embeddings & Semantic Index)    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### 1. **Authentication & Authorization**
- User signup with email and password
- JWT-based authentication
- Secure password hashing
- Protected endpoints with role-based access

### 2. **Video Processing Pipeline**
- **Video Upload**: Accept video files (MP4, AVI, etc.)
- **YouTube Support**: Download and process YouTube videos via URLs
- **Audio Extraction**: Extract audio from video files
- **Transcription**: Convert audio to text using Whisper or Sarvam AI
- **Chunking**: Split long transcripts into manageable pieces
- **Vector Embeddings**: Create semantic embeddings for retrieval

### 3. **Conversation Management**
- Create and maintain multiple conversations per user
- Track conversation history with timestamps
- Store transcripts and vector database paths
- Update conversation titles
- Delete conversations with cascade delete

### 4. **Chat Interface with RAG**
- Ask questions about video content
- Retrieval-Augmented Generation (RAG) for accurate answers
- System uses video transcript as context
- Powered by Mistral AI LLM
- Maintains message history with roles (user/assistant)

### 5. **Semantic Search**
- Vector database stores all transcript embeddings
- Fast semantic search for relevant content
- Retrieve context matching user questions
- Improves answer accuracy and relevance

---

## 📊 Data Models

### **User Model**
```
- id: Integer (Primary Key)
- email: String (Unique)
- full_name: String
- hashed_password: String
- role: Enum (USER, ADMIN)
- is_active: Boolean
- created_at: DateTime
- relationships: conversations[]
```

### **Conversation Model**
```
- id: Integer (Primary Key)
- title: String (Default: "New Chat")
- transcript: Text (Video transcription)
- vector_path: String (Path to Chroma vector DB)
- user_id: Integer (Foreign Key)
- created_at: DateTime
- updated_at: DateTime
- last_message_at: DateTime
- relationships: user, messages[]
```

### **Message Model**
```
- id: Integer (Primary Key)
- role: Enum (USER, ASSISTANT)
- content: Text
- conversation_id: Integer (Foreign Key)
- created_at: DateTime
- relationships: conversation
```

---

## 🔌 API Endpoints

### **Authentication Endpoints**

#### POST `/signup`
- **Purpose**: Register new user
- **Request Body**: 
  ```json
  {
    "email": "user@example.com",
    "full_name": "John Doe",
    "password": "securepass123"
  }
  ```
- **Response**: JWT token + user info
- **Status**: 201 Created

#### POST `/login`
- **Purpose**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```
- **Response**: JWT token + user info
- **Status**: 200 OK

#### GET `/me`
- **Purpose**: Get current user profile
- **Auth**: Required (Bearer token)
- **Response**: User details
- **Status**: 200 OK

#### GET `/dashboard`
- **Purpose**: Get dashboard info
- **Auth**: Required (Bearer token)
- **Response**: Welcome message + user info
- **Status**: 200 OK

### **Conversation Endpoints**

#### POST `/conversations`
- **Purpose**: Create new conversation
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "title": "My Chat"
  }
  ```
- **Response**: Conversation details with ID
- **Status**: 201 Created

#### GET `/conversations`
- **Purpose**: List all user conversations
- **Auth**: Required
- **Response**: Array of conversations
- **Status**: 200 OK

#### GET `/conversations/{conversation_id}`
- **Purpose**: Get specific conversation details
- **Auth**: Required
- **Response**: Conversation with messages
- **Status**: 200 OK

#### PATCH `/conversations/{conversation_id}`
- **Purpose**: Update conversation title
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "title": "New Title"
  }
  ```
- **Response**: Updated conversation
- **Status**: 200 OK

#### DELETE `/conversations/{conversation_id}`
- **Purpose**: Delete conversation
- **Auth**: Required
- **Response**: Success message
- **Status**: 200 OK

### **Message Endpoints**

#### GET `/conversations/{conversation_id}/messages`
- **Purpose**: Get all messages in conversation
- **Auth**: Required
- **Query Params**: skip, limit
- **Response**: Array of messages
- **Status**: 200 OK

#### POST `/conversations/{conversation_id}/messages`
- **Purpose**: Create new message
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "content": "What is this video about?"
  }
  ```
- **Response**: Message details with AI response
- **Status**: 201 Created

### **Upload Endpoints**

#### POST `/upload/{conversation_id}`
- **Purpose**: Upload video file or YouTube URL
- **Auth**: Required
- **Request Type**: Multipart form-data (file upload) or JSON (URL)
- **Response**: 
  ```json
  {
    "conversation_id": 1,
    "title": "Extracted title",
    "summary": "Generated summary",
    "transcript": "Full transcript text"
  }
  ```
- **Status**: 200 OK
- **Process**:
  1. Accept video file or YouTube URL
  2. Extract audio from video
  3. Transcribe audio to text
  4. Generate summary
  5. Create vector embeddings
  6. Store in Chroma database

### **Chat/LLM Endpoints**

#### POST `/chat`
- **Purpose**: Ask questions about video
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "conversation_id": 1,
    "query": "What are the main points?"
  }
  ```
- **Response**: AI-generated answer based on transcript
- **Status**: 200 OK
- **Process**: Uses RAG to retrieve relevant context

#### POST `/ask`
- **Purpose**: Direct LLM query (bypasses RAG)
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "query": "What is AI?"
  }
  ```
- **Response**: Direct LLM response
- **Status**: 200 OK

---

## 🔄 Data Flow & Processing Pipeline

### **Video Upload & Processing Flow**

```
User Upload Video/URL
        │
        ▼
┌──────────────────────────────────────┐
│ 1. Validate & Store                  │
│    - Accept MP4, AVI, MOV, etc.     │
│    - Create conversation record      │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 2. Extract Audio                     │
│    - Use ffmpeg to extract WAV       │
│    - Handle YouTube downloads        │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 3. Transcribe                        │
│    - Use Whisper (local) or          │
│    - Sarvam API (multi-language)     │
│    - Handle long audio chunks        │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 4. Process Transcript                │
│    - Clean and format text           │
│    - Split into chunks               │
│    - Generate summary                │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 5. Create Vector Embeddings          │
│    - Generate embeddings for chunks  │
│    - Store in Chroma DB              │
│    - Index for fast retrieval        │
└──────────────────────────────────────┘
        │
        ▼
Conversation Ready for Q&A
```

### **Chat Query Flow (RAG)**

```
User Query: "What is the main topic?"
        │
        ▼
┌──────────────────────────────────────┐
│ 1. Retrieve Context                  │
│    - Create embedding for query      │
│    - Search Chroma DB                │
│    - Get top-k relevant chunks       │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 2. Construct Prompt                  │
│    - System: Instructions for AI     │
│    - Context: Retrieved chunks       │
│    - Query: User's question          │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 3. Generate Response                 │
│    - Call Mistral AI LLM             │
│    - Generate answer from context    │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ 4. Store & Return                    │
│    - Save message to DB              │
│    - Return response to user         │
└──────────────────────────────────────┘
        │
        ▼
User Sees Answer
```

---

## 🛠️ Core Services

### **1. Transcriber Service** (`core/transcriber.py`)
- **Functions**:
  - `load_model()`: Load Whisper model (lazy loading)
  - `transcribe_chunk_whisper()`: Transcribe audio chunk using Whisper
  - `transcribe_chunk_sarvam()`: Use Sarvam API for transcription
  - Handles long audio by chunking (25-second pieces)
- **Models Supported**:
  - Whisper: tiny, base, small, medium, large
  - Sarvam: Multi-language STT with translation

### **2. Vector Store Service** (`core/vector_store.py`)
- **Functions**:
  - `build_vector_store()`: Create new Chroma database
  - `load_vector_store()`: Load existing vector store
  - `get_retriever()`: Get retriever for semantic search
  - `add_documents()`: Add transcript chunks to index
- **Storage**: Chroma (persistent SQLite-based)
- **Embeddings**: Langchain-compatible embeddings

### **3. RAG Engine** (`core/rag_engine.py`)
- **Components**:
  - LLM: Mistral Small (via API)
  - Prompt Template: System instructions + context + query
  - Retriever: Chroma-based semantic search
  - Parser: Extract text responses
- **Process**:
  1. Retrieve relevant context from vector store
  2. Build prompt with context
  3. Query LLM
  4. Return generated response
- **Configuration**: Temperature 0.3 (consistent, factual)

### **4. Chat Service** (`services/chat_service.py`)
- Manages message creation and retrieval
- Interfaces between API and database
- Handles conversation context

### **5. Upload Service** (`services/upload_service.py`)
- Orchestrates entire video processing pipeline
- Coordinates transcription, chunking, embedding
- Handles file validation and cleanup

### **6. YouTube Service** (`services/youtube_service.py`)
- Downloads YouTube videos
- Extracts audio to WAV format
- Uses `yt_dlp` for reliable downloads
- Supports various video formats

### **7. Audio Service** (`services/audio.py`)
- Extracts audio from video files
- Uses FFmpeg for processing
- Converts to standardized format (WAV)
- Handles various codecs and containers

### **8. Summarizer Service** (`core/summarizer.py`)
- Generates concise video summaries
- Uses LLM to condense transcript
- Creates initial overview of content

---

## 💾 Database Architecture

### **SQLite Database** (Relational)
- **Location**: `backend/app.db`
- **Purpose**: User data, conversation history, message logs
- **Tables**:
  - `users`: User accounts and credentials
  - `conversations`: Chat sessions tied to videos
  - `messages`: Individual chat messages
  - SQLAlchemy ORM for query management

### **Chroma Vector Database** (Vector Store)
- **Location**: `backend/vector_db/`
- **Purpose**: Store and retrieve semantic embeddings
- **Structure**:
  - One collection per conversation
  - Document chunks from transcripts
  - Embedding vectors for semantic search
  - Metadata (timestamps, chunk ID, etc.)
- **Benefits**:
  - Fast similarity search (O(log n))
  - Semantic understanding beyond keyword search
  - Persistent storage

---

## 🔐 Security Features

### **Authentication**
- JWT (JSON Web Tokens) for stateless authentication
- Bearer token in Authorization header
- Token expiration and refresh mechanisms

### **Password Security**
- Bcrypt hashing for password storage
- Password verification without storing plaintext
- Minimum length requirements (6+ characters)

### **Authorization**
- User role-based access control (USER, ADMIN)
- Conversation ownership verification
- Message access restricted to conversation owner

### **Data Protection**
- Cascade delete for related records
- Input validation via Pydantic schemas
- CORS middleware for cross-origin requests

---

## 📦 Tech Stack Details

### **Backend**
```
Framework:        FastAPI (modern, fast, async support)
Language:         Python 3.8+
Web Server:       Uvicorn (ASGI server)
ORM:              SQLAlchemy (database abstraction)
Database:         SQLite (lightweight, file-based)
Vector DB:        Chroma (semantic search)
LLM:              Mistral AI (API-based)
Transcription:    OpenAI Whisper + Sarvam AI
Authentication:   JWT + Bcrypt
API Documentation: Swagger UI (auto-generated)
```

### **Frontend**
```
Framework:        React 18+ (UI library)
Language:         TypeScript (type safety)
Router:           TanStack Router (client-side routing)
Build Tool:       Vite (fast development & build)
Styling:          Tailwind CSS (utility-first)
UI Library:       Shadcn/ui + Custom components
HTTP Client:      Fetch API / Axios
State Management: React Hooks
```

### **Infrastructure**
```
Package Manager:  npm/yarn
Version Control:  Git
Containerization: Optional (Docker-ready with Python)
Deployment:       Development mode or production server
```

---

## 🚀 How Everything Works Together

### **Scenario: User uploads a video and asks questions**

1. **Authentication**
   - User logs in via frontend
   - Backend validates credentials
   - JWT token returned and stored in browser

2. **Conversation Setup**
   - User creates new conversation
   - Frontend sends POST to `/conversations`
   - Backend creates conversation record in SQLite

3. **Video Upload**
   - User selects video file or pastes YouTube URL
   - Frontend sends to `/upload/{conversation_id}`
   - Backend:
     - Receives video/URL
     - Extracts audio (ffmpeg or yt-dlp)
     - Transcribes audio (Whisper/Sarvam)
     - Chunks transcript (smart splitting)
     - Creates embeddings (Langchain)
     - Stores in Chroma DB
     - Updates conversation with transcript & vector_path
     - Returns summary to user

4. **Chat Query**
   - User types question in chat interface
   - Frontend sends message to `/conversations/{id}/messages`
   - Backend:
     - Creates user message record
     - Extracts conversation's vector store path
     - Loads Chroma vector database
     - Creates embedding of user query
     - Retrieves top-k relevant chunks (similarity search)
     - Builds RAG prompt: [System] + [Context chunks] + [Query]
     - Calls Mistral AI LLM
     - Saves assistant response to database
     - Returns response to frontend

5. **Chat Display**
   - Frontend displays question and answer
   - User can ask follow-up questions
   - Conversation history maintained

---

## 📋 Installation & Setup

### **Backend Setup**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env)
# DATABASE_URL=sqlite:///./app.db
# JWT_SECRET_KEY=your-secret-key
# MISTRAL_API_KEY=your-mistral-api-key
# WHISPER_MODEL=small
# SARVAM_API_KEY=your-sarvam-key (optional)

# Run migrations (if using Alembic)
# alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Setup**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# or
yarn install

# Environment variables (create .env or .env.local)
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build
```

### **System Requirements**
- Python 3.8+
- Node.js 16+
- FFmpeg (for audio extraction)
- 2GB+ RAM (for Whisper model)
- Internet connection (for API calls)

---

## 🔍 File Structure Explained

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization & main routes
│   ├── database.py          # SQLAlchemy setup & session management
│   ├── auth.py              # JWT & password utilities
│   ├── models.py            # SQLAlchemy ORM models (User, Conversation, Message)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── enums.py             # Enum types (UserRole, MessageRole)
│   │
│   ├── core/                # Core AI/ML services
│   │   ├── transcriber.py   # Audio to text conversion
│   │   ├── vector_store.py  # Chroma vector database interface
│   │   ├── rag_engine.py    # Retrieval-Augmented Generation
│   │   ├── summarizer.py    # Text summarization
│   │   └── extractor.py     # Data extraction utilities
│   │
│   ├── routers/             # API endpoint handlers
│   │   ├── conversations.py # Conversation CRUD endpoints
│   │   ├── messages.py      # Message endpoints
│   │   ├── upload.py        # Video upload & processing
│   │   ├── chat.py          # Chat query endpoint
│   │   └── LLM.py           # Direct LLM query endpoint
│   │
│   ├── services/            # Business logic & external integrations
│   │   ├── audio.py         # Audio extraction from video
│   │   ├── youtube_service.py   # YouTube download
│   │   ├── transcription_service.py # Transcription orchestration
│   │   ├── chat_service.py   # Chat message handling
│   │   ├── upload_service.py # Upload pipeline orchestration
│   │   └── chunking.py      # Text chunking for embeddings
│   │
│   ├── crud/                # Database CRUD operations
│   └── __init__.py
│
├── tests/                   # Test files
├── uploads/                 # Uploaded video storage
├── vector_db/               # Chroma vector database
├── requirements.txt         # Python dependencies
└── README.md

frontend/
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components (buttons, cards, etc.)
│   │   └── [page-specific components]
│   │
│   ├── routes/             # Page components (login, dashboard, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API calls
│   │   ├── api.ts          # API client functions
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── chat.ts         # Chat-related functions
│   │   └── utils.ts        # General utilities
│   │
│   ├── router.tsx          # TanStack Router config
│   ├── server.ts           # Server configuration
│   └── styles.css          # Global styles
│
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies & scripts
└── eslint.config.js        # Linting rules
```

---

## 🔑 Key Workflows

### **Workflow 1: New User Registration**
```
1. User clicks "Sign Up"
2. Enters: email, full name, password
3. Frontend validates input
4. POST /signup with credentials
5. Backend:
   - Checks if email exists
   - Hashes password
   - Creates User record
   - Generates JWT token
6. Frontend stores token in localStorage
7. Redirects to dashboard
8. Dashboard now calls GET /me (authenticated)
```

### **Workflow 2: Upload & Process Video**
```
1. User in conversation clicks "Upload Video"
2. Selects video file OR enters YouTube URL
3. Frontend sends file/URL to POST /upload/{conversation_id}
4. Backend:
   a. Validates file/URL
   b. Downloads if YouTube
   c. Extracts audio (ffmpeg)
   d. Transcribes (Whisper/Sarvam)
   e. Chunks transcript
   f. Creates embeddings
   g. Stores in Chroma
   h. Saves metadata to SQLite
5. Returns summary and transcript to frontend
6. User can now ask questions
```

### **Workflow 3: Ask Question (RAG)**
```
1. User types question in chat input
2. Frontend: POST /conversations/{id}/messages
   {
     "content": "What is the main topic?"
   }
3. Backend:
   a. Creates Message record (role=user)
   b. Loads conversation's vector store
   c. Creates embedding of question
   d. Searches Chroma: get top-5 similar chunks
   e. Builds prompt with context
   f. Calls Mistral AI
   g. Creates Message record (role=assistant, content=response)
   h. Returns response
4. Frontend displays both messages in chat
5. User sees historical conversation
```

---

## 🎯 Key Technologies & Why

| Component | Technology | Why? |
|-----------|-----------|------|
| **Backend Framework** | FastAPI | Fast, async, auto-docs, type hints |
| **Frontend Framework** | React + TypeScript | Component-based, type-safe, large ecosystem |
| **Database** | SQLite | Lightweight, file-based, no server needed |
| **Vector DB** | Chroma | Easy to use, local storage, semantic search |
| **LLM** | Mistral AI | Fast, affordable, good quality |
| **Transcription** | Whisper | Open source, offline capable, multi-language |
| **Styling** | Tailwind CSS | Utility-first, rapid development |
| **Build Tool** | Vite | Fast hot reload, optimized builds |
| **Router** | TanStack Router | Type-safe, flexible routing |

---

## 💡 How RAG Improves Answers

**Without RAG (Direct LLM)**:
- Query: "What did John say about climate?"
- LLM: "I don't have that information" (no context)

**With RAG**:
- Query: "What did John say about climate?"
- System retrieves: "John mentioned that climate change is accelerating..."
- LLM receives context and answers accurately based on video

---

## 🔄 Message Flow Diagram

```
Frontend (React)                Backend (FastAPI)              Databases
     │                               │                              │
     │─── Login ─────────────────────>                              │
     │                               │─── Check User ─────────────> │
     │                               │<────── Return User ─────────│
     │<─── JWT Token ────────────────│                              │
     │                               │                              │
     │─── Create Conversation ───────>                              │
     │                               │─── Create Record ──────────> │
     │                               │<──── Conversation ID ───────│
     │<──── ID ──────────────────────│                              │
     │                               │                              │
     │─── Upload Video (with ID) ───>                              │
     │                               │─── Process Pipeline ───────> │
     │                               │ (Extract, Transcribe,       │
     │                               │  Chunk, Embed)              │
     │                               │<──── Vector Store ──────────│
     │                               │<──── Save Metadata ────────│
     │<──── Summary & Transcript ────│                              │
     │                               │                              │
     │─── Ask Question ──────────────>                              │
     │                               │─── Load Vector Store ──────> │
     │                               │<──── Top-k Chunks ─────────│
     │                               │─── RAG + LLM Query ──┐      │
     │                               │                      (Mistral AI)
     │                               │<──── Response ───────┘      │
     │                               │─── Save Message ───────────> │
     │<──── Answer + History ────────│                              │
```

---

## 🚀 Deployment Considerations

### **For Production**
- Use PostgreSQL instead of SQLite (multi-user)
- Deploy backend on AWS, Google Cloud, or Azure
- Use managed LLM APIs (Mistral, OpenAI, etc.)
- Store files in S3/Cloud Storage
- Use Chroma Cloud for vector DB
- Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- Enable HTTPS and proper CORS
- Implement rate limiting
- Add monitoring and logging

### **Environment Variables Needed**
```
DATABASE_URL=
JWT_SECRET_KEY=
MISTRAL_API_KEY=
WHISPER_MODEL=
SARVAM_API_KEY=
UPLOAD_DIR=
VECTOR_DB_DIR=
```

---

## 📈 Scalability Notes

1. **Database**: Migrate to PostgreSQL for multi-user production
2. **Vector Store**: Use Chroma Cloud or Pinecone for distributed storage
3. **File Storage**: Use S3 or Cloud Storage instead of local filesystem
4. **Transcription**: Queue jobs with Celery for long-running tasks
5. **Caching**: Add Redis for frequently accessed conversations
6. **Load Balancing**: Use load balancers for multiple backend instances

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Vector store not found | Check `vector_db/` directory and conversation ID |
| Transcription timeout | Use smaller WHISPER_MODEL (tiny/base) |
| CORS errors | Verify frontend URL in `origins` list in main.py |
| JWT expired | Implement refresh token logic |
| Out of memory | Chunk transcripts earlier, use GPU for Whisper |
| API rate limits | Implement request queuing and retry logic |

---

## 📚 Related Documentation

- **FastAPI Docs**: Generated at `http://localhost:8000/docs`
- **Chroma Docs**: https://docs.trychroma.com/
- **Mistral AI**: https://docs.mistral.ai/
- **TanStack Router**: https://tanstack.com/router/
- **Tailwind CSS**: https://tailwindcss.com/

---

## ✅ Summary

**AI Video Assistance** is a complete RAG-powered application that:
1. ✅ Accepts video uploads and YouTube URLs
2. ✅ Automatically transcribes audio to text
3. ✅ Creates semantic embeddings for intelligent search
4. ✅ Provides real-time AI chat about video content
5. ✅ Maintains conversation history and user accounts
6. ✅ Uses modern tech stack (React, FastAPI, Chroma, Mistral)
7. ✅ Implements secure authentication and authorization
8. ✅ Scales from local development to production

All components work together seamlessly to deliver an intelligent video analysis platform.

---

**Last Updated**: 2024
**Version**: 1.0.0
