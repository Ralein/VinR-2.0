import asyncio
import sys
import os

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.rag_service import retrieve_context

async def test():
    print("Testing RAG Semantic Search...")
    queries = [
        "I'm feeling really anxious and overwhelmed with work",
        "How do I practice better sleep hygiene?",
        "I feel lonely and isolated",
        "Suicidal thoughts are hitting me hard"
    ]

    for query in queries:
        print(f"\nQUERY: {query}")
        context = await retrieve_context(query, top_k=2)
        if context:
            print(f"RESULT:\n{context[:500]}...")
        else:
            print("RESULT: No relevant context found.")

if __name__ == "__main__":
    asyncio.run(test())
