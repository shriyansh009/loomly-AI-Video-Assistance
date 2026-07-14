from langchain_chroma import Chroma

db = Chroma(
    persist_directory="vector_db/conversation_15",
    embedding_function=get_embeddings(),
)

print(db._collection.count())