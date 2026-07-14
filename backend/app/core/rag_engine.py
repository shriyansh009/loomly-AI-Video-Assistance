import os

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_mistralai import ChatMistralAI

from .vector_store import (
    build_vector_store,
    get_retriever,
    load_vector_store,
)

_llm = None


# -------------------------------------------------
# LLM
# -------------------------------------------------
def get_llm():
    global _llm

    if _llm is None:
        _llm = ChatMistralAI(
            model="mistral-small-latest",
            mistral_api_key=os.getenv("MISTRAL_API_KEY"),
            temperature=0.3,
        )

    return _llm


# -------------------------------------------------
# Prompt
# -------------------------------------------------
PROMPT = ChatPromptTemplate.from_messages(
[
(
"system",
"""
You are Loomly AI.

You answer ONLY from the transcript.

Use the retrieved context below.

If the answer exists, answer it.

If the answer is only partially present,
answer using the available information.

Only say

'I could not find this information in the meeting transcript.'

when absolutely nothing relevant is found.

Context:

{context}
"""
),
("human","{question}")
]
)


# -------------------------------------------------
# Helpers
# -------------------------------------------------
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


# -------------------------------------------------
# Build vector store (Upload only)
# -------------------------------------------------
def create_vector_store(
    transcript: str,
    save_path: str,
):
    """
    Called ONLY during upload.
    """

    vector_store = build_vector_store(
        transcript,
        save_path,
    )

    return vector_store


# -------------------------------------------------
# Load existing vector store
# -------------------------------------------------
def load_retriever(
    save_path: str,
    k: int = 8,
):
    vector_store = load_vector_store(
        save_path,
    )

    return get_retriever(
        vector_store,
        k=k,
    )


# -------------------------------------------------
# Build RAG Chain
# -------------------------------------------------
def get_rag_chain(
    save_path: str,
):
    retriever = load_retriever(
        save_path,
    )

    rag_chain = (
        {
            "context": retriever
            | RunnableLambda(format_docs),
            "question": RunnablePassthrough(),
        }
        | PROMPT
        | get_llm()
        | StrOutputParser()
    )

    return rag_chain


# -------------------------------------------------
# Ask Question
# -------------------------------------------------
def ask_question(
    rag_chain,
    question: str,
):
    print("=" * 80)
    print("QUESTION:")
    print(question)
    print("=" * 80)

    answer = rag_chain.invoke(question)

    print("=" * 80)
    print("ANSWER:")
    print(answer)
    print("=" * 80)

    return answer