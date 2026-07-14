# AI Video Assistant

A full-stack application that provides intelligent video analysis, transcription, and chat capabilities using AI/ML technologies.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

- **Video Upload & Processing**: Upload videos and automatically extract audio
- **Transcription**: Convert audio to text using transcription services
- **Vector Database**: Store and retrieve video information using embeddings
- **RAG Engine**: Retrieve relevant content using Retrieval-Augmented Generation
- **Chat Interface**: Interactive chat with AI about video content
- **Authentication**: Secure user authentication and authorization
- **Conversation Management**: Maintain conversation history with multiple videos

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with Chroma for vector storage
- **Authentication**: JWT-based auth
- **API**: RESTful endpoints

### Frontend
- **Framework**: React with TypeScript
- **Router**: TanStack Router
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Shadcn/ui components

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Clone the Repository

```bash
git clone <repository-url>
cd "AI Video Assistance"
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the backend directory with required variables:

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=your-secret-key
UPLOAD_DIR=./uploads
VECTOR_DB_DIR=./vector_db
```

### 5. Run Backend

```bash
python -m uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
AI Video Assistance/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/             # Core business logic
│   │   │   ├── extractor.py
│   │   │   ├── rag_engine.py
│   │   │   ├── summarizer.py
│   │   │   ├── transcriber.py
│   │   │   └── vector_store.py
│   │   ├── routers/          # API endpoints
│   │   │   ├── chat.py
│   │   │   ├── conversations.py
│   │   │   ├── upload.py
│   │   │   └── LLM.py
│   │   ├── services/         # Business services
│   │   │   ├── audio.py
│   │   │   ├── chat_service.py
│   │   │   ├── transcription_service.py
│   │   │   └── upload_service.py
│   │   ├── auth.py           # Authentication logic
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── main.py           # FastAPI app entry
│   ├── tests/                # Unit tests
│   ├── uploads/              # Uploaded files
│   ├── vector_db/            # Vector database storage
│   └── requirements.txt
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── ui/          # UI components
│   │   ├── routes/          # Page components
│   │   ├── lib/             # Utilities and helpers
│   │   │   ├── api.ts       # API calls
│   │   │   ├── auth.ts      # Auth utilities
│   │   │   └── chat.ts      # Chat utilities
│   │   ├── hooks/           # Custom React hooks
│   │   └── styles/          # Global styles
│   ├── public/              # Static files
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Conversations
- `GET /conversations` - List all conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/{id}` - Get conversation details
- `DELETE /conversations/{id}` - Delete conversation

### Chat
- `POST /chat/send` - Send message to chat
- `GET /chat/history/{conversation_id}` - Get chat history

### Upload
- `POST /upload` - Upload video file
- `GET /uploads/{file_id}` - Get upload status

### Messages
- `GET /messages/{conversation_id}` - Get messages in conversation
- `DELETE /messages/{id}` - Delete message

## 📝 Configuration

### Backend Configuration
Edit `backend/app/main.py` to configure:
- CORS settings
- Upload limits
- Database connections
- Vector store settings

### Frontend Configuration
Edit `frontend/vite.config.ts` and `frontend/src/server.ts` to configure:
- API endpoints
- Development server settings
- Build optimization

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 📦 Building for Production

### Backend

```bash
cd backend
# Run with production settings
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm run build
# Output in dist/ directory
```

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify database permissions in `vector_db` directory

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check that backend is running on expected port

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Authors

AI Video Assistant Development Team

## 📧 Support

For issues and questions, please create an issue in the repository.
