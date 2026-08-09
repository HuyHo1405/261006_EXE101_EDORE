import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Gemini API configurations (Beeknoee Platform Provider)
    GEMINI_API_KEY = os.getenv('BEEKNOEE_API_KEY', '')
    GEMINI_MODEL   = os.getenv('BEEKNOEE_MODEL', 'gemini-3.5-flash')

    # Qdrant Vector DB
    QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
    QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
    QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION', 'history_textbook')

    # Sentence-Transformers Embedding Model (downloaded on first run, ~120MB)
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2')
