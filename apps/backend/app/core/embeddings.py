from typing import List

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    @property
    def model(self):
        """Lazy load SentenceTransformer model on first usage."""
        if self._model is None:
            import torch
            from sentence_transformers import SentenceTransformer
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self._model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
        return self._model

    def embed_text(self, text: str) -> List[float]:
        """Generate an embedding for a single text string."""
        embedding = self.model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of text strings."""
        embeddings = self.model.encode(texts, convert_to_batch=True, convert_to_tensor=False)
        return embeddings.tolist()

# Singleton instance
embedding_service = EmbeddingService()
