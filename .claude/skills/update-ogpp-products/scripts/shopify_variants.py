#!/usr/bin/env python3
"""List a Shopify product's variants: id, SKU, price, compare-at price and stock.

Usage:
  shopify_variants.py <domain> <handle> [<handle> ...]
  shopify_variants.py us.ecoflow.com delta-pro-3-portable-power-station
  shopify_variants.py --json www.jackery.com jackery-homepower-3600-plus

Reads the public `/products/<handle>.js` endpoint. Prices are printed in dollars. Output is
data for filling `vendorRef` / refreshing prices — review it, don't paste it blindly.
"""
import json
import sys
import urllib.error
import urllib.request


def fetch(domain: str, handle: str) -> dict:
    url = f'https://{domain}/products/{handle}.js'
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)


def main(argv: list[str]) -> int:
    as_json = '--json' in argv
    args = [arg for arg in argv if arg != '--json']
    if len(args) < 2:
        print(__doc__)
        return 2
    domain, handles = args[0], args[1:]
    results = []
    for handle in handles:
        try:
            product = fetch(domain, handle)
        except urllib.error.HTTPError as error:
            results.append({'handle': handle, 'error': f'HTTP {error.code}'})
            continue
        results.append({
            'handle': product['handle'],
            'title': product['title'],
            'variants': [
                {
                    'variantId': str(variant['id']),
                    'sku': variant.get('sku') or None,
                    'variantTitle': variant['title'],
                    'price': variant['price'] / 100,
                    'compareAtPrice': (variant.get('compare_at_price') or 0) / 100,
                    'available': variant['available'],
                }
                for variant in product['variants']
            ],
        })

    if as_json:
        print(json.dumps(results, indent=1, ensure_ascii=False))
        return 0
    for result in results:
        if 'error' in result:
            print(f"{result['handle']}: {result['error']} (removed or renamed?)")
            continue
        print(f"{result['handle']} — {result['title']}")
        for v in result['variants']:
            stock = 'in-stock' if v['available'] else 'out-of-stock'
            compare = f" / {v['compareAtPrice']:g}" if v['compareAtPrice'] else ''
            print(f"  {v['variantId']}  {v['sku'] or '-':<32} ${v['price']:g}{compare}  {stock}  {v['variantTitle']}")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
