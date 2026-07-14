backend/
│
├── main.py
├── database.py
├── auth.py
│
├── models.py
├── schemas.py
├── crud.py
│
├── routes/
│   ├── auth.py
│   ├── conversation.py
│   └── message.py
│
└── services/
    └── ai_service.py


backend/
│
├── app/
│   │
│   ├── main.py
│   ├── database.py
│   ├── auth.py
│   │
│   ├── models.py
│   ├── schemas.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── conversations.py
│   │   ├── messages.py
│   │   ├── upload.py
│   │   └── ai.py
│   │
│   ├── services/
│   │   ├── llm.py
│   │   ├── whisper.py
│   │   └── video.py
│   │
│   ├── crud/
│   │   ├── conversation.py
│   │   └── message.py
│   │
│   └── utils/
│       └── helpers.py
│
└── requirements.txt