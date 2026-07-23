"""RAG Service — Semantic mental health knowledge base.

Utilizes pgvector for high-fidelity semantic similarity search, 
providing evidence-based context to the LLM.
"""

from typing import List
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models.rag import KnowledgeChunk
from app.core.embeddings import embedding_service

async def retrieve_context(query: str, top_k: int = 3) -> str:
    """
    Retrieve relevant knowledge chunks using pgvector semantic search.
    
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
            # pgvector similarity search using L2 distance (<->)
            # We sort by distance and limit to top_k
            stmt = (
                select(KnowledgeChunk)
                .order_by(KnowledgeChunk.embedding.l2_distance(query_vector))
                .limit(top_k)
            )
            
            result = await session.execute(stmt)
            chunks = result.scalars().all()

            if not chunks:
                return ""

            # Format as context string
            context_parts = []
            for chunk in chunks:
                context_parts.append(f"[{chunk.source}]\n{chunk.content}")

            return "\n\n".join(context_parts)

    except Exception as e:
        print(f"Error in RAG retrieval: {e}")
        return ""
