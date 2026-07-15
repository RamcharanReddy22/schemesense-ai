"""
Fixed translation script - handles malformed Unicode escapes from LLM output.
"""
import os, json, sys, time, re
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
sys.stdout.reconfigure(encoding='utf-8')

from groq import Groq

client = Groq(api_key="gsk_wxG1ac31ZqzqxWpsOrTWWWGdyb3FYipGQ0CzO9mzk3AZsXHo5o0FY")
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'schemes.json')
BATCH_SIZE = 3  # Smaller batches = cleaner LLM output

def fix_unicode_escapes(text):
    """Fix malformed \\uXXXX sequences in LLM JSON output."""
    def replace_bad_escape(m):
        seq = m.group(1)
        if len(seq) == 4 and all(c in '0123456789abcdefABCDEF' for c in seq):
            return m.group(0)  # valid, keep it
        return ' '  # invalid, replace with space
    text = re.sub(r'\\u([0-9a-fA-F]{0,4})', replace_bad_escape, text)
    return text

def clean_json_response(content):
    """Extract and clean JSON array from LLM response."""
    content = content.strip()
    for marker in ('```json', '```'):
        if content.startswith(marker):
            content = content[len(marker):]
    if content.endswith('```'):
        content = content[:-3]
    content = content.strip()
    start = content.find('[')
    end = content.rfind(']')
    if start != -1 and end != -1:
        content = content[start:end+1]
    content = fix_unicode_escapes(content)
    content = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', content)
    return content

def translate_batch(batch, lang_code, lang_name):
    payload = [
        {
            'id': s['id'],
            'title': s['title'],
            'description': s['description'][:300],
            'ministry': s['ministry'],
            'benefits': s.get('benefits', [])[:3],
            'documents': s.get('documents', [])[:3]
        }
        for s in batch
    ]
    prompt = (
        f"Translate this JSON array into {lang_name}. "
        f"Return ONLY a valid JSON array with the same structure. "
        f"Keep 'id' unchanged. "
        f"Translate: title, description, ministry, benefits array items, documents array items. "
        f"Use actual {lang_name} Unicode characters in strings (NOT \\u escapes). "
        f"No markdown, no explanation, just raw JSON.\n\n"
        f"{json.dumps(payload, ensure_ascii=False)}"
    )
    try:
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a JSON translation API. Output ONLY raw valid JSON. "
                        f"Write {lang_name} text using actual Unicode characters, never \\u escapes. "
                        f"Do not include any markdown or explanation."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=2500
        )
        content = resp.choices[0].message.content
        cleaned = clean_json_response(content)
        try:
            translated = json.loads(cleaned)
            if isinstance(translated, list) and len(translated) == len(batch):
                return translated
            print(f"    Length mismatch: got {len(translated) if isinstance(translated, list) else 'non-list'}")
            return None
        except json.JSONDecodeError as e:
            print(f"    JSON parse error: {e}")
            return None
    except Exception as e:
        print(f"    API error: {e}")
        return None

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    schemes = json.load(f)

print(f"Total schemes: {len(schemes)}")

for lang_code, lang_name in [('hi', 'Hindi'), ('te', 'Telugu')]:
    to_translate = [s for s in schemes if f'title_{lang_code}' not in s]
    print(f"\nNeed {lang_name}: {len(to_translate)}")

    success_count = 0
    for i in range(0, len(to_translate), BATCH_SIZE):
        batch = to_translate[i:i + BATCH_SIZE]
        print(f"  [{i+1}-{i+len(batch)}] -> {lang_name}...")

        translated = translate_batch(batch, lang_code, lang_name)

        if translated:
            for tr in translated:
                orig = next((s for s in schemes if s['id'] == tr.get('id')), None)
                if orig and tr.get('title'):
                    orig[f'title_{lang_code}'] = tr.get('title', orig['title'])
                    orig[f'description_{lang_code}'] = tr.get('description', orig['description'])
                    orig[f'ministry_{lang_code}'] = tr.get('ministry', orig['ministry'])
                    orig[f'benefits_{lang_code}'] = tr.get('benefits', orig.get('benefits', []))
                    orig[f'documents_{lang_code}'] = tr.get('documents', orig.get('documents', []))
                    print(f"    OK: {tr.get('id', '?')}")
                    success_count += 1
        else:
            print(f"    Batch failed, trying one-by-one...")
            for scheme in batch:
                single = translate_batch([scheme], lang_code, lang_name)
                if single and len(single) == 1:
                    tr = single[0]
                    if tr.get('title'):
                        scheme[f'title_{lang_code}'] = tr.get('title', scheme['title'])
                        scheme[f'description_{lang_code}'] = tr.get('description', scheme['description'])
                        scheme[f'ministry_{lang_code}'] = tr.get('ministry', scheme['ministry'])
                        scheme[f'benefits_{lang_code}'] = tr.get('benefits', scheme.get('benefits', []))
                        scheme[f'documents_{lang_code}'] = tr.get('documents', scheme.get('documents', []))
                        print(f"      OK: {scheme['id']}")
                        success_count += 1
                time.sleep(0.5)

        with open(DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(schemes, f, indent=2, ensure_ascii=False)
        time.sleep(0.8)

    print(f"  {lang_name}: {success_count}/{len(to_translate)} translated")

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    final = json.load(f)

print(f"\n=== FINAL STATUS ===")
print(f"Hindi:  {sum(1 for s in final if 'title_hi' in s)}/{len(final)}")
print(f"Telugu: {sum(1 for s in final if 'title_te' in s)}/{len(final)}")
print("DONE!")
