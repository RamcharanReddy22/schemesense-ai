import os
import json
import re
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Delhi', 'Puducherry', 'Ladakh']

categories = [
  'Education & Learning',
  'Agriculture, Rural & Environment',
  'Business & Entrepreneurship',
  'Health & Wellness',
  'Women and Child',
  'Social Welfare & Security'
]

prompt = f"""
Translate the following arrays of English strings into Hindi and Telugu.
Return a valid JSON object with this exact structure:
{{
  "hi": {{
    "states": {{ "Andhra Pradesh": "...", ... }},
    "categories": {{ "Education & Learning": "...", ... }}
  }},
  "te": {{
    "states": {{ "Andhra Pradesh": "...", ... }},
    "categories": {{ "Education & Learning": "...", ... }}
  }}
}}

States to translate: {json.dumps(states)}
Categories to translate: {json.dumps(categories)}
"""

completion = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": "You are a JSON generator. Return ONLY raw valid JSON."},
        {"role": "user", "content": prompt}
    ]
)

content = completion.choices[0].message.content.strip()
if content.startswith('```json'): content = content[7:]
if content.startswith('```'): content = content[3:]
if content.endswith('```'): content = content[:-3]

data = json.loads(content)

# Now modify localization.js
loc_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'localization.js')
with open(loc_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# For Hindi
hi_states = json.dumps(data["hi"]["states"], ensure_ascii=False, indent=4)
hi_categories = json.dumps(data["hi"]["categories"], ensure_ascii=False, indent=4)
hi_inject = f",\n    states: {hi_states},\n    categories: {hi_categories}\n  }},\n  te:"
js_content = re.sub(r'  \},\n  te:', hi_inject, js_content, count=1)

# For Telugu
te_states = json.dumps(data["te"]["states"], ensure_ascii=False, indent=4)
te_categories = json.dumps(data["te"]["categories"], ensure_ascii=False, indent=4)
te_inject = f",\n    states: {te_states},\n    categories: {te_categories}\n  }}\n}};"
js_content = re.sub(r'  \}\n\};', te_inject, js_content, count=1)

with open(loc_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("localization.js updated!")
