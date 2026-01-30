import sys
import json
from collections import Counter


def analyze(path):
    with open(path, 'r', encoding='utf-8') as f:
        j = json.load(f)

    items = j.get('line_items', [])
    total = len(items)
    ids = [it.get('line_item_id') for it in items]
    id_counts = Counter(ids)
    unique_ids = len([i for i in id_counts if i is not None])
    max_id = max((i for i in ids if isinstance(i, int)), default=None)

    inn_names = [str(it.get('inn_name','')).strip() for it in items]
    nonempty_inns = [n for n in inn_names if n]
    short_inns = [n for n in nonempty_inns if len(n) < 3]

    # suspicious if contains month names or words from header/footer
    suspicious = []
    for it in items:
        name = str(it.get('inn_name',''))
        low = name.lower()
        if any(x in low for x in ['may', 'june', 'responses', 'policies', 'expiry', 'year)']) or low.strip() in ['', 'n/a']:
            suspicious.append({'line_item_id': it.get('line_item_id'), 'inn_name': name})

    print(f'File: {path}')
    print(f'Total line_items array length: {total}')
    print(f'Unique non-null line_item_id values: {unique_ids}')
    print(f'Max line_item_id (numeric): {max_id}')
    dup_ids = [k for k,v in id_counts.items() if v>1]
    print(f'Duplicate line_item_id values (count): {len(dup_ids)} -> {dup_ids[:10]}')
    print(f'Non-empty inn_name count: {len(nonempty_inns)}')
    print(f'Short inn_name entries (<3 chars): {short_inns[:10]}')
    print(f'Suspicious entries found: {len(suspicious)} (sample up to 10)')
    for s in suspicious[:10]:
        print('  ', s)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python analyze_extracted.py <path_to_extracted_json>')
        sys.exit(2)
    analyze(sys.argv[1])
