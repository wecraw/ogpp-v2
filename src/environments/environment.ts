export const environment = {
  nlrSolarResourceUrl: 'https://developer.nlr.gov/api/solar/solar_resource/v1.json',
  nlrApiKey: 'DEMO_KEY',
  zipLookupUrl: 'https://api.zippopotam.us/us',
  sunHoursRequestTimeoutMs: 10000,

  // Affiliate link decoration config (structure-only — no real codes yet).
  // `AffiliateLinkService.decorate` merges `defaultParams` (applied to every
  // outbound product link) with the matching `vendors` entry. Keys are the
  // product/offer `vendor` string. Replace the placeholder values once real
  // affiliate programs are signed up for.
  affiliate: {
    defaultParams: {
      utm_source: 'ogpp',
      utm_medium: 'affiliate'
    } as Record<string, string>,
    vendors: {
      EcoFlow: { ref: 'OGPP_PLACEHOLDER' },
      Jackery: { ref: 'OGPP_PLACEHOLDER' },
      Bluetti: { ref: 'OGPP_PLACEHOLDER' }
    } as Record<string, Record<string, string>>
  }
};
