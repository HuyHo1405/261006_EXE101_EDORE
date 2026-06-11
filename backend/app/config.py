import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # OpenRouter API configurations
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
    OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'meta-llama/llama-3-8b-instruct:free')
    OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
