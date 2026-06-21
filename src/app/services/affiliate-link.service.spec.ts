import { TestBed } from '@angular/core/testing';

import { AffiliateLinkService } from './affiliate-link.service';
import { environment } from '../../environments/environment';

describe('AffiliateLinkService', () => {
  let service: AffiliateLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffiliateLinkService);
  });

  it('merges default and per-vendor params onto a clean URL', () => {
    const result = service.decorate('https://us.ecoflow.com/products/delta-pro', 'EcoFlow');

    expect(result.startsWith('https://us.ecoflow.com/products/delta-pro?')).toBeTrue();
    expect(result).toContain('utm_source=ogpp');
    expect(result).toContain('utm_medium=affiliate');
    expect(result).toContain(`ref=${environment.affiliate.vendors['EcoFlow']['ref']}`);
  });

  it('preserves an existing query string', () => {
    const result = service.decorate('https://example.com/p?foo=bar', 'EcoFlow');

    expect(result).toContain('foo=bar');
    expect(result).toContain('utm_source=ogpp');
    // Only one `?` — added params join with `&`.
    expect(result.indexOf('?')).toBe(result.lastIndexOf('?'));
  });

  it('lets caller context override merged params', () => {
    const result = service.decorate('https://us.ecoflow.com/p', 'EcoFlow', {
      utm_medium: 'results',
      utm_content: 'anchor-card'
    });

    expect(result).toContain('utm_medium=results');
    expect(result).not.toContain('utm_medium=affiliate');
    expect(result).toContain('utm_content=anchor-card');
  });

  it('still applies default params for an unknown vendor without throwing', () => {
    const result = service.decorate('https://acme.test/p', 'NotARealVendor');

    expect(result).toContain('utm_source=ogpp');
    expect(result).not.toContain('ref=');
  });

  it('returns an empty URL untouched', () => {
    expect(service.decorate('')).toBe('');
  });
});
