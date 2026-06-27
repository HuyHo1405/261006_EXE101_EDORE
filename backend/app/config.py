import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # OpenRouter API configurations
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
    OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'meta-llama/llama-3-8b-instruct:free')
    OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

    # Qdrant Vector DB
    QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
    QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
    QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION', 'history_textbook')

    # Sentence-Transformers Embedding Model (downloaded on first run, ~120MB)
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2')
