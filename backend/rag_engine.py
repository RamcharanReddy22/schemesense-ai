import json
import os
import re
import io
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ─── Document Store for uploaded files ────────────────────────────────────────
# Each entry: { "filename": str, "chunks": [str], "source": "upload" }
uploaded_docs = []
doc_vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
doc_tfidf_matrix = None
doc_chunk_map = []  # flat list of (filename, chunk_text) for retrieval


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    words = text.split()
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def parse_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        return f"[PDF parse error: {e}]"


def parse_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        return f"[DOCX parse error: {e}]"


def parse_txt(file_bytes: bytes) -> str:
    for enc in ["utf-8", "latin-1", "cp1252"]:
        try:
            return file_bytes.decode(enc)
        except Exception:
            continue
    return "[Could not decode text file]"


def ingest_file(filename: str, file_bytes: bytes) -> dict:
    """Parse a file and add its chunks to the document store."""
    global doc_tfidf_matrix, doc_chunk_map

    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        text = parse_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        text = parse_docx(file_bytes)
    else:
        text = parse_txt(file_bytes)

    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    if not text or len(text) < 30:
        return {"ok": False, "error": "Could not extract meaningful text from file."}

    chunks = chunk_text(text)
    uploaded_docs.append({"filename": filename, "chunks": chunks, "full_text": text})

    # Rebuild flat chunk map and re-vectorize
    doc_chunk_map.clear()
    all_chunks = []
    for doc in uploaded_docs:
        for c in doc["chunks"]:
            doc_chunk_map.append((doc["filename"], c))
            all_chunks.append(c)

    if all_chunks:
        doc_tfidf_matrix = doc_vectorizer.fit_transform(all_chunks)

    return {"ok": True, "chunks": len(chunks), "chars": len(text)}


def retrieve_from_docs(query: str, top_k: int = 4) -> list[tuple[str, str, float]]:
    """Return top_k (filename, chunk, score) from uploaded documents."""
    global doc_tfidf_matrix
    if doc_tfidf_matrix is None or not doc_chunk_map:
        return []
    try:
        q_vec = doc_vectorizer.transform([query.lower()])
        sims = cosine_similarity(q_vec, doc_tfidf_matrix).flatten()
        top_idx = np.argsort(sims)[::-1]
        results = []
        for idx in top_idx:
            if sims[idx] > 0.05:
                fname, chunk = doc_chunk_map[idx]
                results.append((fname, chunk, float(sims[idx])))
            if len(results) >= top_k:
                break
        return results
    except Exception:
        return []


# ─── Groq LLM Integration ─────────────────────────────────────────────────────

def call_groq(prompt: str, api_key: str) -> str:
    """Call Groq's free LLaMA 3.1 API to generate an answer."""
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Seva Mitra, a helpful Indian government scheme assistant. "
                        "Answer clearly and concisely in the same language as the user's question. "
                        "Use bullet points for lists. Always cite the scheme name when answering."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            max_tokens=600,
            temperature=0.4,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"[Groq ERROR] {e}")
        return f"GROQ_ERROR: {str(e)}"


# ─── Main RAG Engine ──────────────────────────────────────────────────────────

class RAGEngine:
    def __init__(self):
        self.schemes = []
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = None
        self.groq_api_key = os.environ.get("GROQ_API_KEY", "")
        self.load_schemes()
        self.index_schemes()

    def load_schemes(self):
        # First try: schemes.json bundled alongside this script (for Render deploy)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(base_dir, 'schemes.json')
        # Second try: monorepo layout src/data/schemes.json (for local dev)
        if not os.path.exists(json_path):
            json_path = os.path.join(base_dir, '..', 'src', 'data', 'schemes.json')
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                self.schemes = json.load(f)
            print(f"RAG Engine successfully loaded {len(self.schemes)} schemes.")
        except Exception as e:
            print(f"Error loading schemes.json: {e}")
            self.schemes = []

    def index_schemes(self):
        if not self.schemes:
            return
        documents = []
        for s in self.schemes:
            text_parts = [
                s.get('title', ''),
                s.get('description', ''),
                s.get('category', ''),
                s.get('ministry', ''),
                s.get('state', ''),
                s.get('eligibilityText', ''),
                s.get('exclusionText', ''),
                ' '.join(s.get('benefits', [])),
                ' '.join(s.get('documents', [])),
                ' '.join([faq.get('q', '') + ' ' + faq.get('a', '')
                           for faq in s.get('faqs', [])])
            ]
            documents.append(' '.join(text_parts).lower())
        self.tfidf_matrix = self.vectorizer.fit_transform(documents)

    def retrieve_top_matches(self, query, top_k=5):
        if not self.schemes or self.tfidf_matrix is None:
            return []

        # Normalize common plural queries to match database singulars
        query_norm = query.lower()
        query_norm = query_norm.replace("scholarships", "scholarship")
        query_norm = query_norm.replace("loans", "loan")
        query_norm = query_norm.replace("farmers", "farmer")
        query_norm = query_norm.replace("pensions", "pension")

        # Define critical topic keywords to filter out completely irrelevant matches
        intents = {
            "scholarship": ["scholar", "student", "education", "school", "college", "matric", "vidya"],
            "loan": ["loan", "credit", "finance", "borrow", "subsidy"],
            "pension": ["pension", "old age", "widow", "retirement", "maan-dhan", "maandhan"],
            "farmer": ["farm", "agri", "crop", "tractor", "kisan", "krishi", "rythu"],
            "insurance": ["insur", "bima", "cover", "premium"],
            "health": ["health", "medic", "hospital", "disease", "treatment", "arogyasri", "ayushman"]
        }

        # Find which intents the user is querying
        active_intents = []
        for intent, kws in intents.items():
            if intent in query_norm:
                active_intents.append(kws)

        query_vector = self.vectorizer.transform([query_norm])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        top_indices = np.argsort(similarities)[::-1]

        results = []
        for idx in top_indices:
            score = similarities[idx]
            if score < 0.05:
                break
                
            scheme_text = ' '.join([
                self.schemes[idx].get('title', ''), 
                self.schemes[idx].get('description', ''),
                self.schemes[idx].get('category', '')
            ]).lower()
            
            # If the user asked for a specific intent, enforce that the scheme text matches it
            valid = True
            for kws in active_intents:
                if not any(kw in scheme_text for kw in kws):
                    valid = False
                    break
                    
            if valid:
                results.append((self.schemes[idx], float(score)))
                
            if len(results) >= top_k:
                break

        return results

    def generate_response(self, query: str, lang: str = 'en', use_uploaded_docs: bool = False):
        """
        Main entry point.
        - If uploaded docs exist and use_uploaded_docs=True → RAG over uploaded docs + optional Groq
        - Otherwise → search built-in schemes database, always use Groq if key available
        """
        # ── Branch 1: Query uploaded documents ──────────────────────────────
        if use_uploaded_docs and doc_chunk_map:
            doc_hits = retrieve_from_docs(query)

            if doc_hits:
                context_parts = []
                for fname, chunk, score in doc_hits:
                    context_parts.append(f"[From: {fname}]\n{chunk}")
                context = "\n\n---\n\n".join(context_parts)

                if self.groq_api_key:
                    prompt = (
                        f"Based on the following document excerpts, answer the user's question.\n\n"
                        f"CONTEXT:\n{context}\n\n"
                        f"QUESTION: {query}\n\nAnswer:"
                    )
                    groq_answer = call_groq(prompt, self.groq_api_key)
                    if groq_answer:
                        return {
                            "response": groq_answer,
                            "matches": [],
                            "source": "groq+uploaded_docs"
                        }

                # Fallback: return raw chunks
                files_used = list(dict.fromkeys(h[0] for h in doc_hits))
                response_text = f"📄 Found relevant content in: **{', '.join(files_used)}**\n\n"
                for fname, chunk, score in doc_hits:
                    response_text += f"**Excerpt** *(relevance: {score:.0%})*:\n> {chunk[:350]}...\n\n"
                return {"response": response_text, "matches": [], "source": "uploaded_docs"}

            prefix = "⚠️ No match found in your uploaded files. Searching the schemes database instead...\n\n"
        else:
            prefix = ""

        # ── Branch 2: Search built-in schemes database ───────────────────────
        matches = self.retrieve_top_matches(query)

        # If Groq key exists, ALWAYS use it — with or without scheme matches
        if self.groq_api_key:
            if matches:
                context = "\n\n".join(
                    f"Scheme Name: {s['title']}\n"
                    f"Category: {s['category']}\n"
                    f"State: {s.get('state','All India')}\n"
                    f"Description: {s['description']}\n"
                    f"Eligibility: {s.get('eligibilityText','')}\n"
                    f"Benefits: {', '.join(s.get('benefits',[]))}"
                    for s, _ in matches
                )
                prompt = (
                    f"You are Seva Mitra, an Indian government scheme assistant.\n"
                    f"STRICT RULES:\n"
                    f"1. ONLY use the scheme information provided below. NEVER invent or guess details.\n"
                    f"2. Cite actual scheme names from the list below.\n"
                    f"3. If none of the listed schemes match the question, say so honestly.\n"
                    f"4. Be concise, friendly, and use bullet points.\n\n"
                    f"SCHEMES FROM DATABASE:\n{context}\n\n"
                    f"USER QUESTION: {query}\n\nAnswer:"
                )
            else:
                # No scheme match — answer as a general government scheme advisor
                prompt = (
                    f"You are Seva Mitra, a helpful Indian government scheme assistant. "
                    f"If the user sends a greeting, respond warmly and list what you can help with. "
                    f"If they ask about a specific scheme or topic, tell them you couldn't find an exact match "
                    f"and suggest they try keywords like 'scholarship', 'farmer', 'pension', 'loan'. "
                    f"NEVER make up or hallucinate scheme names or details. "
                    f"Respond in the same language as the question.\n\n"
                    f"USER: {query}\n\nAnswer:"
                )

            groq_answer = call_groq(prompt, self.groq_api_key)
            if groq_answer:
                return {
                    "response": prefix + groq_answer,
                    "matches": [s['id'] for s, _ in matches],
                    "source": "groq+schemes_db"
                }

        # Final fallback (no Groq key): template-based response
        return self._template_response(query, matches, lang, prefix)


    def _template_response(self, query, matches, lang, prefix=""):
        intro_dict = {
            'en': "Here are the top matching government schemes:\n\n",
            'hi': "शीर्ष सरकारी योजनाएं:\n\n",
            'te': "అగ్ర ప్రభుత్వ పథకాలు:\n\n"
        }
        no_match_dict = {
            'en': "I couldn't find any direct matches. Try: 'Rythu Bandhu', 'scholarship', 'Mudra loan', 'pension'.",
            'hi': "कोई सीधा मिलान नहीं मिला। 'रायथू बीमा', 'छात्रवृत्ति', 'मुद्रा ऋण', 'पेंशन' खोजें।",
            'te': "ప్రత్యక్ష సరిపోలికలు కనుగొనబడలేదు. 'రైతు బీమా', 'స్కాలర్‌షిప్', 'ముద్రా రుణాలు' శోధించండి."
        }

        if not matches:
            return {"response": prefix + no_match_dict.get(lang, no_match_dict['en']), "matches": [], "source": "schemes_db"}

        query_lower = query.lower()
        is_benefit = any(w in query_lower for w in ['benefit', 'fayda', 'labh', 'సహాయం', 'లాభం'])
        is_doc = any(w in query_lower for w in ['document', 'kagaz', 'certificate', 'పత్రాలు'])
        is_step = any(w in query_lower for w in ['apply', 'how to', 'process', 'విధానం', 'ఎలా'])

        response_text = prefix + intro_dict.get(lang, intro_dict['en'])
        matched_ids = []

        for idx, (scheme, score) in enumerate(matches):
            matched_ids.append(scheme['id'])
            response_text += f"{idx+1}. **{scheme['title']}** ({scheme['type']} — {scheme['state']})\n"
            response_text += f"   *{scheme['category']}* | {scheme['ministry']}\n"
            if is_doc:
                response_text += f"   📋 Documents: {', '.join(scheme.get('documents', []))}\n"
            elif is_benefit:
                response_text += f"   ✅ Benefits: {'; '.join(scheme.get('benefits', []))}\n"
            elif is_step:
                steps = " → ".join(scheme.get('steps', [])[:3])
                response_text += f"   📝 Steps: {steps}...\n"
            else:
                response_text += f"   {scheme.get('eligibilityText', '')}\n"
            domain = scheme['officialUrl'].replace('https://','').replace('http://','').split('/')[0]
            response_text += f"   🔗 [{domain}]({scheme['officialUrl']})\n\n"

        guidance = {
            'en': "\nClick the links above to visit official websites, or use the Eligibility Wizard.",
            'hi': "\nआधिकारिक वेबसाइट पर जाने के लिए ऊपर दिए गए लिंक पर क्लिक करें।",
            'te': "\nఅధికారిక వెబ్‌సైట్‌లను సందర్శించడానికి పైన ఉన్న లింక్‌లను క్లిక్ చేయండి."
        }
        response_text += guidance.get(lang, guidance['en'])

        return {"response": response_text, "matches": matched_ids, "source": "schemes_db"}
