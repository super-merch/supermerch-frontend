/**
 * TDD Tests: categoryMeta helper module
 * Written BEFORE implementation per TDD methodology.
 *
 * User Journey:
 * As the frontend, I want a centralized helper that can tell me:
 * - whether a category is Clothing or Headwear
 * - what artwork source to use for a category
 * so that I don't need hardcoded checks scattered across components.
 */

import { describe, it, expect } from 'vitest';
import {
  getCategoryMeta,
  isClothingCategory,
  isHeadwearCategory,
  getArtworkSource,
} from '../utils/categoryMeta.js';

// Synthetic test fixture — mirrors shape of /api/v1-categories data array items
const MOCK_V1_CATEGORIES = [
  {
    id: 'promo-group-1',
    name: 'Clothing',
    navGroup: 'clothing',
    artworkSource: 'supermerch',
    showOnHeader: true,
    subTypes: [{ id: 'sub-1', name: 'T-Shirts' }],
  },
  {
    id: 'promo-group-2',
    name: 'Headwear',
    navGroup: 'headwear',
    artworkSource: 'supermerch',
    showOnHeader: true,
    subTypes: [],
  },
  {
    id: 'promo-group-3',
    name: 'Promotional',
    navGroup: 'promotional',
    artworkSource: 'promodata',
    showOnHeader: true,
    subTypes: [],
  },
  {
    id: 'promo-group-4',
    name: 'Gifts',
    navGroup: null,
    artworkSource: 'promodata',
    showOnHeader: false,
    subTypes: [],
  },
];

// ─── getCategoryMeta ──────────────────────────────────────────────────────────

describe('getCategoryMeta', () => {
  it('returns category metadata when found by promodata id', () => {
    const meta = getCategoryMeta('promo-group-1', MOCK_V1_CATEGORIES);
    expect(meta).not.toBeNull();
    expect(meta.name).toBe('Clothing');
  });

  it('returns null when category id is not found', () => {
    const meta = getCategoryMeta('unknown-id', MOCK_V1_CATEGORIES);
    expect(meta).toBeNull();
  });

  it('returns null when categories array is empty', () => {
    const meta = getCategoryMeta('promo-group-1', []);
    expect(meta).toBeNull();
  });

  it('returns null when categories array is null', () => {
    const meta = getCategoryMeta('promo-group-1', null);
    expect(meta).toBeNull();
  });
});

// ─── isClothingCategory ───────────────────────────────────────────────────────

describe('isClothingCategory', () => {
  it('returns true for a clothing navGroup category', () => {
    expect(isClothingCategory('promo-group-1', MOCK_V1_CATEGORIES)).toBe(true);
  });

  it('returns false for a headwear navGroup category', () => {
    expect(isClothingCategory('promo-group-2', MOCK_V1_CATEGORIES)).toBe(false);
  });

  it('returns false for a promotional navGroup category', () => {
    expect(isClothingCategory('promo-group-3', MOCK_V1_CATEGORIES)).toBe(false);
  });

  it('returns false for unknown category id', () => {
    expect(isClothingCategory('no-such-id', MOCK_V1_CATEGORIES)).toBe(false);
  });

  it('returns false when categories list is empty', () => {
    expect(isClothingCategory('promo-group-1', [])).toBe(false);
  });
});

// ─── isHeadwearCategory ───────────────────────────────────────────────────────

describe('isHeadwearCategory', () => {
  it('returns true for a headwear navGroup category', () => {
    expect(isHeadwearCategory('promo-group-2', MOCK_V1_CATEGORIES)).toBe(true);
  });

  it('returns false for a clothing navGroup category', () => {
    expect(isHeadwearCategory('promo-group-1', MOCK_V1_CATEGORIES)).toBe(false);
  });

  it('returns false for unknown category id', () => {
    expect(isHeadwearCategory('no-such-id', MOCK_V1_CATEGORIES)).toBe(false);
  });

  it('returns false when categories list is null', () => {
    expect(isHeadwearCategory('promo-group-2', null)).toBe(false);
  });
});

// ─── getArtworkSource ─────────────────────────────────────────────────────────

describe('getArtworkSource', () => {
  it('returns "supermerch" for a clothing category', () => {
    expect(getArtworkSource('promo-group-1', MOCK_V1_CATEGORIES)).toBe('supermerch');
  });

  it('returns "supermerch" for a headwear category', () => {
    expect(getArtworkSource('promo-group-2', MOCK_V1_CATEGORIES)).toBe('supermerch');
  });

  it('returns "promodata" for a promotional category', () => {
    expect(getArtworkSource('promo-group-3', MOCK_V1_CATEGORIES)).toBe('promodata');
  });

  it('returns "promodata" when category has null artworkSource (fallback)', () => {
    const catsWithNull = [
      { id: 'x', name: 'Mystery', navGroup: null, artworkSource: null },
    ];
    expect(getArtworkSource('x', catsWithNull)).toBe('promodata');
  });

  it('returns "promodata" for unknown category id (defensive fallback)', () => {
    expect(getArtworkSource('unknown', MOCK_V1_CATEGORIES)).toBe('promodata');
  });

  it('returns "promodata" when categories list is null (defensive fallback)', () => {
    expect(getArtworkSource('promo-group-1', null)).toBe('promodata');
  });
});
