import os

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


EMBEDDING_MODEL = "all-MiniLM-L6-v2"

BASE_VECTOR_PATH = "vector_db"


# ----------------------------------------------------
# Embeddings
# ----------------------------------------------------
def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
    )


# ----------------------------------------------------
# Split transcript
# ----------------------------------------------------
def split_transcript(transcript: str):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )

    chunks = splitter.split_text(transcript)

    return [
        Document(
            page_content=chunk,
            metadata={
                "chunk": index,
            },
        )
        for index, chunk in enumerate(chunks)
    ]


# ----------------------------------------------------
# Build Vector Store
# ----------------------------------------------------
def build_vector_store(
    transcript: str,
    save_path: str,
) -> Chroma:

    print("Creating vector database...")

    documents = split_transcript(transcript)

    embeddings = get_embeddings()

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=save_path,
    )

    print("Vector database created.")

    return vector_store


# ----------------------------------------------------
# Load Existing Vector Store
# ----------------------------------------------------
def load_vector_store(
    save_path: str,
) -> Chroma:
    
    print("=" * 60)
    print("Loading vector store from:")
    print(repr(save_path))
    print("=" * 60)
    embeddings = get_embeddings()

    return Chroma(
        embedding_function=embeddings,
        persist_directory=save_path,
    )


# ----------------------------------------------------
# Retriever
# ----------------------------------------------------
def get_retriever(
    vector_store: Chroma,
    k: int = 4,
):

    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": k,
        },
    )


############## test ######################

# db = Chroma(
#     persist_directory="vector_db/conversation_15",
#     embedding_function=get_embeddings(),
# )

# print(db._collection.count())