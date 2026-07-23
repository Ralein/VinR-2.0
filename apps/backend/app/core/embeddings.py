import torch
from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            # Using all-MiniLM-L6-v2 which is fast, lightweight (80MB), and good for RAG (384 dims)
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = SentenceTransformer("all-MiniLM-L6-v2", device=device)

    def embed_text(self, text: str) -> List[float]:
        """Generate an embedding for a single text string."""
        embedding = self._model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of text strings."""
        embeddings = self._model.encode(texts, convert_to_batch=True, convert_to_tensor=False)
        return embeddings.tolist()

# Singleton instance
embedding_service = EmbeddingService()
