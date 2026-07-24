"""RAG Service — Semantic mental health knowledge base.

Supports both PostgreSQL (pgvector) and local SQLite (in-memory vector distance)
without throwing SQL syntax errors.
"""

import json
from typing import List, Sequence
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rag import KnowledgeChunk
from app.core.embeddings import embedding_service


def _calculate_distance(chunk: KnowledgeChunk, query_vector: List[float]) -> float:
    """Calculate Euclidean distance between query vector and chunk embedding."""
    if not chunk.embedding:
        return 999.0
    try:
        emb = chunk.embedding
        if isinstance(emb, str):
            emb = json.loads(emb)
        sum_sq = sum((q - c) ** 2 for q, c in zip(query_vector, emb))
        return sum_sq ** 0.5
    except Exception:
        return 999.0


async def _search_sqlite_chunks(session, query_vector: List[float], top_k: int) -> List[KnowledgeChunk]:
    """In-memory vector search for SQLite."""
    stmt = select(KnowledgeChunk)
    result = await session.execute(stmt)
    chunks = list(result.scalars().all())
    if not chunks:
        return []
    chunks.sort(key=lambda c: _calculate_distance(c, query_vector))
    return chunks[:top_k]


async def retrieve_context(query: str, top_k: int = 3) -> str:
    """
    Retrieve relevant knowledge chunks using vector similarity search.
    
    Args:
        query: User's emotional text input
        top_k: Number of chunks to retrieve
        
    Returns:
        Concatenated relevant context string with source attribution
    """
    if not query or not query.strip():
        return ""

    try:
        query_vector = embedding_service.embed_text(query)

        async with AsyncSessionLocal() as session:
            bind = session.get_bind()
            if bind.dialect.name == "sqlite":
                top_chunks = await _search_sqlite_chunks(session, query_vector, top_k)
            else:
                stmt = (
                    select(KnowledgeChunk)
                    .order_by(KnowledgeChunk.embedding.l2_distance(query_vector))
                    .limit(top_k)
                )
                result = await session.execute(stmt)
                top_chunks = list(result.scalars().all())

            if not top_chunks:
                return ""

            return "\n\n".join(f"[{chunk.source}]\n{chunk.content}" for chunk in top_chunks)

    except Exception as e:
        print(f"⚠️ Error in RAG retrieval: {e}")
        return ""
