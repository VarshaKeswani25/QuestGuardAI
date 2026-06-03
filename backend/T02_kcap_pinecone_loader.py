import os
import hashlib
import time
from pathlib import Path

from dotenv import load_dotenv
from tqdm import tqdm
import PyPDF2
from google import genai
from google.genai import types
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

PINECONE_API_KEY  = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")

INDEX_NAME        = "questguard-kcap"
EMBED_MODEL       = "gemini-embedding-001"
EMBED_DIMENSIONS  = 3072
CHUNK_SIZE        = 500
CHUNK_OVERLAP     = 50
BATCH_SIZE        = 50

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={"api_version": "v1"}
)

def extract_text_from_pdf(pdf_path):
    pages = []
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        print(f"📄 PDF mein {len(reader.pages)} pages hain")
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append({"page": i + 1, "text": text})
    return pages

def chunk_text(pages):
    chunks = []
    for page_data in pages:
        words     = page_data["text"].split()
        page_num  = page_data["page"]
        start     = 0
        chunk_idx = 0
        while start < len(words):
            end         = min(start + CHUNK_SIZE, len(words))
            chunk_words = words[start:end]
            text        = " ".join(chunk_words)
            raw_id      = f"kcap-p{page_num}-c{chunk_idx}"
            chunk_id    = hashlib.md5(raw_id.encode()).hexdigest()[:16]
            chunks.append({
                "chunk_id":    chunk_id,
                "text":        text,
                "page":        page_num,
                "chunk_index": chunk_idx,
                "word_count":  len(chunk_words),
            })
            start     += CHUNK_SIZE - CHUNK_OVERLAP
            chunk_idx += 1
    print(f"✂️  {len(chunks)} chunks bane ({len(pages)} pages se)")
    return chunks

def get_embeddings(texts, start_from=0):
    all_embeddings = []
    total = len(texts)

    for idx, text in enumerate(texts):

        if idx < start_from:
            all_embeddings.append(None)
            print(f"   ⏭️  Skipping {idx+1}/{total}", end="\r")
            continue

        while True:
            try:
                response = client.models.embed_content(
                    model    = EMBED_MODEL,
                    contents = text,
                    config   = types.EmbedContentConfig(
                        task_type = "RETRIEVAL_DOCUMENT"
                    )
                )
                all_embeddings.append(response.embeddings[0].values)
                break

            except Exception as e:
                if any(code in str(e) for code in ["429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE"]):
                    print(f"\n   ⏳ Server error! 60s wait... ({idx+1}/{total})")
                    time.sleep(60)
                else:
                    raise

        print(f"   ✅ {idx+1}/{total} done", end="\r")
        time.sleep(12)

    done = len([e for e in all_embeddings if e is not None])
    print(f"\n✅ {done} embeddings ready")
    return all_embeddings

def setup_pinecone_index():
    pc = Pinecone(api_key=PINECONE_API_KEY)
    existing = [idx.name for idx in pc.list_indexes()]
    if INDEX_NAME not in existing:
        print(f"🆕 Naya index bana raha hoon")
        pc.create_index(
            name      = INDEX_NAME,
            dimension = EMBED_DIMENSIONS,
            metric    = "cosine",
            spec      = ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print(f"✅ Index ready!")
    else:
        print(f"✅ Index pehle se exist karta hai")
    return pc.Index(INDEX_NAME)

def upsert_chunks(index, chunks, embeddings):
    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        if embedding is None:
            continue
        vectors.append({
            "id":     chunk["chunk_id"],
            "values": embedding,
            "metadata": {
                "text":        chunk["text"],
                "page":        chunk["page"],
                "chunk_index": chunk["chunk_index"],
                "word_count":  chunk["word_count"],
                "source":      "KCAP-2023",
            }
        })
    print(f"🚀 {len(vectors)} vectors upload ho rahe hain...")
    for i in tqdm(range(0, len(vectors), BATCH_SIZE), desc="Upserting"):
        index.upsert(vectors=vectors[i : i + BATCH_SIZE])
    print(f"✅ Done!")

def run_pipeline(pdf_path):
    print("=" * 50)
    print("🌊 QuestGuard AI — T02 (Gemini FREE)")
    print("=" * 50)

    print("\n[1/5] PDF padh raha hoon...")
    pages = extract_text_from_pdf(pdf_path)

    print("\n[2/5] Chunks bana raha hoon...")
    chunks = chunk_text(pages)

    print(f"\n[3/5] Embeddings bana raha hoon...")
    print(f"   ⏱️  ~41 minute lagenge — PC band mat karna!")

    # ✅ 0 se shuru — Pinecone bilkul khali hai
    embeddings = get_embeddings([c["text"] for c in chunks], start_from=0)

    print("\n[4/5] Pinecone setup...")
    index = setup_pinecone_index()

    print("\n[5/5] Pinecone mein upload...")
    upsert_chunks(index, chunks, embeddings)

    print("\n🎉 T02 Pipeline complete!")
    stats = index.describe_index_stats()
    print(f"   Total vectors: {stats['total_vector_count']}")

if __name__ == "__main__":
    KCAP_PDF_PATH = "data/KCAP_2023.pdf"
    if not Path(KCAP_PDF_PATH).exists():
        print(f"❌ PDF nahi mila: {KCAP_PDF_PATH}")
    else:
        run_pipeline(KCAP_PDF_PATH)