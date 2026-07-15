import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

with open('src/data/schemes.json', encoding='utf-8') as f:
    schemes = json.load(f)

vectorizer = TfidfVectorizer(stop_words='english')
documents = []
for s in schemes:
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
        ' '.join([faq.get('q', '') + ' ' + faq.get('a', '') for faq in s.get('faqs', [])])
    ]
    documents.append(' '.join(text_parts).lower())

tfidf_matrix = vectorizer.fit_transform(documents)

def test_query(query):
    query_norm = query.lower()
    query_norm = query_norm.replace("scholarships", "scholarship")
    query_norm = query_norm.replace("loans", "loan")
    query_norm = query_norm.replace("farmers", "farmer")
    query_norm = query_norm.replace("pensions", "pension")

    intents = {
        "scholarship": ["scholar", "student", "education", "school", "college", "matric"],
        "loan": ["loan", "credit", "finance", "borrow"],
        "pension": ["pension", "old age", "widow", "retirement", "maan-dhan", "maandhan"],
        "farmer": ["farm", "agri", "crop", "tractor", "kisan", "krishi"],
        "insurance": ["insur", "bima", "cover", "premium"],
        "health": ["health", "medic", "hospital", "disease", "treatment"]
    }

    active_intents = []
    for intent, kws in intents.items():
        if intent in query_norm:
            active_intents.append(kws)

    query_vector = vectorizer.transform([query_norm])
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    top_indices = np.argsort(similarities)[::-1]
    
    print(f"--- Query: {query} ---")
    results = []
    for idx in top_indices:
        score = similarities[idx]
        if score < 0.05:
            break
            
        scheme_text = ' '.join([
            schemes[idx].get('title', ''), 
            schemes[idx].get('description', ''),
            schemes[idx].get('category', '')
        ]).lower()
        
        valid = True
        for kws in active_intents:
            if not any(kw in scheme_text for kw in kws):
                valid = False
                break
                
        if valid:
            results.append((schemes[idx], float(score)))
            
        if len(results) >= 5:
            break
            
    for s, score in results:
        print(f"[{score:.3f}] {s['title']} ({s['state']})")

test_query("Help me with scholarships in telangana")
test_query("loans for women")
test_query("pension for old age")
test_query("farmer insurance in telangana")
