import {
  generateCustomApplianceId,
  isCustomApplianceId,
  slugify
} from './catalog-utils';

describe('catalog-utils', () => {
  describe('slugify', () => {
    it('lowercases, hyphenates and trims', () => {
      expect(slugify('  Well Pump 2 HP! ')).toBe('well-pump-2-hp');
    });
  });

  describe('isCustomApplianceId', () => {
    it('recognises the custom prefix', () => {
      expect(isCustomApplianceId('custom-well-pump')).toBeTrue();
    });

    it('rejects catalog slugs and undefined', () => {
      expect(isCustomApplianceId('kitchen-fridge')).toBeFalse();
      expect(isCustomApplianceId(undefined)).toBeFalse();
    });
  });

  describe('generateCustomApplianceId', () => {
    it('derives a custom-prefixed slug from the name', () => {
      expect(generateCustomApplianceId('Well Pump', [])).toBe('custom-well-pump');
    });

    it('never collides with catalog ids', () => {
      const id = generateCustomApplianceId('Fridge', ['kitchen-fridge', 'custom-fridge']);
      expect(id).not.toBe('kitchen-fridge');
      expect(id).not.toBe('custom-fridge');
      expect(isCustomApplianceId(id)).toBeTrue();
    });

    it('appends a numeric suffix for duplicate custom names', () => {
      const existing = ['custom-pump'];
      const second = generateCustomApplianceId('Pump', existing);
      expect(second).toBe('custom-pump-2');

      existing.push(second);
      expect(generateCustomApplianceId('Pump', existing)).toBe('custom-pump-3');
    });

    it('falls back to a stable base when the name has no slug characters', () => {
      expect(generateCustomApplianceId('!!!', [])).toBe('custom-appliance');
    });
  });
});
