import re, os
files = [f for f in os.listdir('dist/assets') if f.endswith('.js')]
print("JS files:", files)
for fn in files:
    with open(f'dist/assets/{fn}', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    count = content.count('"Rythu Bandhu"') + content.count('Rythu Bandhu')
    print(f'{fn}: Rythu Bandhu={count}, size={len(content)}')
    # count scheme-like objects by looking for title field next to id field
    ids_found = re.findall(r'"id":"([a-z_0-9]+)"', content)
    print(f'  IDs found: {len(ids_found)}')
    print(f'  First 5: {ids_found[:5]}')
    print(f'  Last 5: {ids_found[-5:]}')
