"""RAG Service — Semantic mental health knowledge base.

Supports both PostgreSQL (pgvector) and local SQLite (in-memory vector distance)
without throwing SQL syntax errors.
"""

import json
from typing import List
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rag import KnowledgeChunk
from app.core.embeddings import embedding_service

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
        # Generate embedding for the query
        query_vector = embedding_service.embed_text(query)

        async with AsyncSessionLocal() as session:
            # Check if SQLite or PostgreSQL
            bind = session.get_bind()
            is_sqlite = bind.dialect.name == "sqlite"

            if is_sqlite:
                # SQLite vector search: retrieve all chunks & compute Euclidean distance in Python
                stmt = select(KnowledgeChunk)
                result = await session.execute(stmt)
                chunks = list(result.scalars().all())

                if not chunks:
                    return ""

                def calculate_dist(chunk: KnowledgeChunk) -> float:
                    if not chunk.embedding:
                        return 999.0
                    try:
                        emb = chunk.embedding
                        if isinstance(emb, str):
                            emb = json.loads(emb)
                        # Euclidean distance
                        sum_sq = sum((q - c) ** 2 for q, c in zip(query_vector, emb))
                        return sum_sq ** 0.5
                    except Exception:
                        return 999.0

                chunks.sort(key=calculate_dist)
                top_chunks = chunks[:top_k]
            else:
                # PostgreSQL pgvector similarity search using L2 distance (<->)
                stmt = (
                    select(KnowledgeChunk)
                    .order_by(KnowledgeChunk.embedding.l2_distance(query_vector))
                    .limit(top_k)
                )
                result = await session.execute(stmt)
                top_chunks = list(result.scalars().all())

            if not top_chunks:
                return ""

            # Format as context string
            context_parts = []
            for chunk in top_chunks:
                context_parts.append(f"[{chunk.source}]\n{chunk.content}")

            return "\n\n".join(context_parts)

    except Exception as e:
        print(f"⚠️ Error in RAG retrieval: {e}")
        return ""
