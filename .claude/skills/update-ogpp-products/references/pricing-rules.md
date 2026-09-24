# Pricing Rules

The judgment calls behind the catalog's numbers. Apply them consistently so two refreshes of the
same data produce the same catalog.

## Which price counts

- **`price`** is the regular public price of the exact variant a record represents, rounded down
  to whole dollars (`$2,199.99` → `2199`).
- **Ignore** variants titled "(Members-only)", "(EcoCredits …)", or requiring a coupon/login.
  **Flash-sale** variants count only when they are the sole way to buy that configuration; say so
  in a comment.
- **Ignore "+ Free …" variants** (free bag, cart, charger) unless they're the only listing — the
  gift doesn't change the gear.
- **Implied prices** (e.g. a battery sold only inside a bundle) may be derived from the difference
  between two official listings. Leave a comment with the arithmetic and don't set `listPrice`.
- **Add-on prices** shown on another product's page (e.g. Anker's $500 panel add-on) are not the
  standalone `price`; mention them in a comment.

## List / compare price

- **`listPrice`** = the vendor's compare-at price for that variant, only when it is **greater**
  than `price`. Equal or missing → omit it. Never invent one from an older sale.
- **Offer `compareAtPrice`** = the vendor's compare-at price for the preset bundle when it is
  greater than `packagePrice`; otherwise the sum of the parts' `listPrice ?? price`. Never present
  list-price savings as savings from choosing the bundle.

## Bundles

- Author **`packagePrice`** exactly as listed. `resolveBundleOffers` quotes the cheaper of the
  package and the parts bought separately, **but the parts only count when every one is
  purchasable** (not `out-of-stock` / `discontinued`). It writes `presetPrice` and the note — don't.
- **Ambiguous contents** ("400W Solar Panel" with no model): map to the currently sold model of
  that rating and say so in a comment near the offer IDs.
- A bundle whose package can't be bought → `availability: 'out-of-stock'` (it's then hidden).

## Availability

| Evidence | Value |
| --- | --- |
| Variant `available: true` / feed `InStock` | `in-stock` |
| Variant `available: false` / feed `OutOfStock` / "Sold out" | `out-of-stock` |
| "Pre-order", "Ships in <month>" / feed `PreOrder` | `preorder` |
| Page 404s, redirects to a successor, or only refurbished units remain | `discontinued` |
| Not checked | leave unset |

Keep the last verified `price` and `dealVerifiedOn` on out-of-stock and discontinued records; drop
`productUrl` when it now points somewhere else.
