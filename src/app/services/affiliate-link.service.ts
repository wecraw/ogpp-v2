import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Decorates outbound product/vendor links with affiliate + UTM query params.
 *
 * Structure-only for now: the actual `ref`/UTM values are placeholders in
 * `environment.affiliate`. Merge order (later wins) is:
 *   1. `defaultParams` — applied to every link
 *   2. the matching `vendors[vendor]` entry
 *   3. the optional `context` passed by the caller (e.g. per-placement UTM)
 *
 * Existing query params on the URL are preserved; a param of the same key is
 * overridden. Unknown vendors simply contribute no vendor params.
 */
@Injectable({
  providedIn: 'root'
})
export class AffiliateLinkService {
  decorate(url: string, vendor?: string, context?: Record<string, string>): string {
    if (!url) return url;

    const additions = Object.entries({
      ...environment.affiliate.defaultParams,
      ...this.vendorParams(vendor),
      ...(context ?? {})
    }).filter(([, value]) => value !== undefined && value !== null && value !== '');

    if (additions.length === 0) return url;

    const hashIndex = url.indexOf('#');
    const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : undefined;
    const withoutFragment = hashIndex >= 0 ? url.slice(0, hashIndex) : url;

    const queryIndex = withoutFragment.indexOf('?');
    const path = queryIndex >= 0 ? withoutFragment.slice(0, queryIndex) : withoutFragment;
    const existingQuery = queryIndex >= 0 ? withoutFragment.slice(queryIndex + 1) : '';

    const params = new Map<string, string>();
    for (const pair of existingQuery.split('&')) {
      if (!pair) continue;
      const separator = pair.indexOf('=');
      const key = separator >= 0 ? pair.slice(0, separator) : pair;
      const value = separator >= 0 ? pair.slice(separator + 1) : '';
      params.set(this.safeDecode(key), this.safeDecode(value));
    }
    for (const [key, value] of additions) {
      params.set(key, value);
    }

    const query = [...params]
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const decorated = query ? `${path}?${query}` : path;
    return fragment !== undefined ? `${decorated}#${fragment}` : decorated;
  }

  private vendorParams(vendor?: string): Record<string, string> {
    if (!vendor) return {};
    return environment.affiliate.vendors[vendor] ?? {};
  }

  private safeDecode(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
}
