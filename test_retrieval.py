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
    query_vector = vectorizer.transform([query_norm])
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    top_indices = np.argsort(similarities)[::-1]
    
    print(f"--- Query: {query} ---")
    for i in range(5):
        idx = top_indices[i]
        score = similarities[idx]
        print(f"[{score:.3f}] {schemes[idx]['title']} ({schemes[idx]['state']})")

test_query("Help me with scholarships in telangana")
test_query("loans for women")
test_query("pension for old age")
