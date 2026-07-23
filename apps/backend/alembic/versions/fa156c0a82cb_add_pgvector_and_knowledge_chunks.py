"""add_pgvector_and_knowledge_chunks

Revision ID: fa156c0a82cb
Revises: 5702165724de
Create Date: 2026-03-30 00:17:21.857657
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


from pgvector.sqlalchemy import Vector

# revision identifiers
revision: str = 'fa156c0a82cb'
down_revision: Union[str, None] = '5702165724de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute(sa.text("CREATE EXTENSION IF NOT EXISTS vector"))
    
    # Create knowledge_chunks table
    op.create_table(
        'knowledge_chunks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('topic', sa.String(length=100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=200), nullable=True),
        sa.Column('embedding', Vector(384), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledge_chunks_topic'), 'knowledge_chunks', ['topic'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_knowledge_chunks_topic'), table_name='knowledge_chunks')
    op.drop_table('knowledge_chunks')
    # op.execute(sa.text("DROP EXTENSION IF EXISTS vector")) # Usually safer not to drop extension automatically
