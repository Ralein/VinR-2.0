import uuid
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class KnowledgeChunk(Base):
    """Semantic knowledge base chunks for RAG."""
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic = Column(String(100), nullable=False, index=True)
    content = Column(Text, nullable=False)
    source = Column(String(200), nullable=True)
    
    # Vector column (384 dimensions for all-MiniLM-L6-v2)
    embedding = Column(Vector(384), nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
