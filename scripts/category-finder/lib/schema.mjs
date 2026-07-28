// Explicit schema validation for the catalogue snapshot. generate-manifest.mjs
// must never silently treat a missing/invalid field as zero or false -- a
// snapshot that's missing per-value counts, for example, should fail
// generation loudly, not quietly produce a manifest with every attribute
// question rejected (which looks like "working, just conservative" instead of
// "broken").
//
// Attribute stat shape (per leaf, per attribute name):
//   {
//     name, sampleSize, taggedProductCount, valueOccurrenceCount,
//     populatedPct, distinctValues, topValueProductCount, topShare,
//     values: [{ value, productCount }]
//   }
// `taggedProductCount` counts each SAMPLED PRODUCT at most once for this
// attribute, even if that product has several values for it -- this is
// deliberately distinct from `valueOccurrenceCount` (sum of per-value
// product counts, which CAN exceed taggedProductCount when products have
// multiple values). Usability is judged against `sampleSize` (how many
// products were actually inspected), never the leaf's full `productCount`
// -- dividing a sample-derived count by the whole category would wrongly
// reject almost every large category's attributes.

class SchemaError extends Error {
  constructor(message) {
    super(message);
    this.name = "SchemaError";
  }
}

const AUDIT_MODES = ["exact", "complete_paginated", "sampled_estimate"];
const ROUND_TOLERANCE = 0.15; // allows for +/-1 unit of rounding drift on percentages

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function roundedPct(numerator, denominator) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * @throws {SchemaError}
 */
export function validateAttributeStat(attr, context) {
  const prefix = `${context}: attribute stat`;
  if (!attr || typeof attr !== "object") throw new SchemaError(`${prefix} is not an object.`);
  if (typeof attr.name !== "string" || !attr.name) throw new SchemaError(`${prefix} missing "name".`);
  const p = `${prefix} "${attr.name}"`;

  if (!isFiniteNumber(attr.sampleSize) || attr.sampleSize <= 0) {
    throw new SchemaError(`${p}: "sampleSize" must be a positive finite number, got ${JSON.stringify(attr.sampleSize)}.`);
  }
  if (!isFiniteNumber(attr.taggedProductCount) || attr.taggedProductCount < 0) {
    throw new SchemaError(`${p}: "taggedProductCount" must be a non-negative finite number, got ${JSON.stringify(attr.taggedProductCount)}.`);
  }
  if (attr.taggedProductCount > attr.sampleSize) {
    throw new SchemaError(`${p}: "taggedProductCount" (${attr.taggedProductCount}) cannot exceed "sampleSize" (${attr.sampleSize}) -- a product can only be tagged once toward this count regardless of how many values it has.`);
  }
  if (!isFiniteNumber(attr.valueOccurrenceCount) || attr.valueOccurrenceCount < attr.taggedProductCount) {
    throw new SchemaError(`${p}: "valueOccurrenceCount" (${JSON.stringify(attr.valueOccurrenceCount)}) must be a finite number >= "taggedProductCount" (${attr.taggedProductCount}).`);
  }
  if (!isFiniteNumber(attr.distinctValues)) throw new SchemaError(`${p}: "distinctValues" must be a finite number, got ${JSON.stringify(attr.distinctValues)}.`);
  if (!isFiniteNumber(attr.populatedPct) || attr.populatedPct < 0 || attr.populatedPct > 100) {
    throw new SchemaError(`${p}: "populatedPct" must be a finite number in [0,100], got ${JSON.stringify(attr.populatedPct)}.`);
  }
  if (Math.abs(attr.populatedPct - roundedPct(attr.taggedProductCount, attr.sampleSize)) > ROUND_TOLERANCE) {
    throw new SchemaError(`${p}: "populatedPct" (${attr.populatedPct}) is inconsistent with taggedProductCount/sampleSize (${roundedPct(attr.taggedProductCount, attr.sampleSize)}).`);
  }
  if (!isFiniteNumber(attr.topShare) || attr.topShare < 0 || attr.topShare > 100) {
    throw new SchemaError(`${p}: "topShare" must be a finite number in [0,100], got ${JSON.stringify(attr.topShare)}.`);
  }
  if (!isFiniteNumber(attr.topValueProductCount) || attr.topValueProductCount < 0) {
    throw new SchemaError(`${p}: "topValueProductCount" must be a non-negative finite number, got ${JSON.stringify(attr.topValueProductCount)}.`);
  }
  if (!Array.isArray(attr.values) || attr.values.length === 0) {
    throw new SchemaError(`${p}: "values" must be a non-empty array of {value, productCount}.`);
  }

  let sumProductCounts = 0;
  let maxProductCount = 0;
  for (const v of attr.values) {
    if (!v || typeof v.value !== "string" || !v.value) {
      throw new SchemaError(`${p}: every entry in "values" needs a non-empty string "value" field.`);
    }
    if (!isFiniteNumber(v.productCount) || v.productCount < 0) {
      throw new SchemaError(`${p}: value "${v.value}" has an invalid "productCount" (${JSON.stringify(v.productCount)}).`);
    }
    if (v.productCount > attr.taggedProductCount) {
      throw new SchemaError(`${p}: value "${v.value}"'s productCount (${v.productCount}) cannot exceed the attribute's taggedProductCount (${attr.taggedProductCount}).`);
    }
    sumProductCounts += v.productCount;
    maxProductCount = Math.max(maxProductCount, v.productCount);
  }
  if (sumProductCounts !== attr.valueOccurrenceCount) {
    throw new SchemaError(`${p}: sum of per-value productCounts (${sumProductCounts}) does not match "valueOccurrenceCount" (${attr.valueOccurrenceCount}) -- inconsistent snapshot data.`);
  }
  if (attr.distinctValues !== attr.values.length) {
    throw new SchemaError(`${p}: "distinctValues" (${attr.distinctValues}) does not match values.length (${attr.values.length}).`);
  }
  if (maxProductCount !== attr.topValueProductCount) {
    throw new SchemaError(`${p}: "topValueProductCount" (${attr.topValueProductCount}) does not match the actual max per-value productCount (${maxProductCount}).`);
  }
  const expectedTopShare = roundedPct(attr.topValueProductCount, attr.taggedProductCount);
  if (Math.abs(attr.topShare - expectedTopShare) > ROUND_TOLERANCE) {
    throw new SchemaError(`${p}: "topShare" (${attr.topShare}) is inconsistent with topValueProductCount/taggedProductCount (${expectedTopShare}).`);
  }
}

/**
 * Validates one leaf's full snapshot record.
 * @throws {SchemaError}
 */
export function validateLeafSnapshot(leaf) {
  if (!leaf || typeof leaf !== "object") throw new SchemaError("Leaf snapshot is not an object.");
  const context = `leaf "${leaf.leafId ?? "?"}"`;
  if (typeof leaf.leafId !== "string" || !leaf.leafId) throw new SchemaError(`${context}: missing/invalid "leafId".`);
  if (typeof leaf.leafName !== "string" || !leaf.leafName) throw new SchemaError(`${context}: missing/invalid "leafName".`);
  if (!isFiniteNumber(leaf.productCount) || leaf.productCount < 0) {
    throw new SchemaError(`${context}: "productCount" must be a non-negative finite number, got ${JSON.stringify(leaf.productCount)}.`);
  }

  if (leaf.productCount === 0) {
    // Nothing else is required for a zero-product leaf -- it's excluded
    // outright and never reaches attribute/colour classification.
    return;
  }

  if (!AUDIT_MODES.includes(leaf.auditMode)) {
    throw new SchemaError(`${context}: "auditMode" must be one of ${JSON.stringify(AUDIT_MODES)}, got ${JSON.stringify(leaf.auditMode)}.`);
  }
  if (!isFiniteNumber(leaf.sampleSize) || leaf.sampleSize <= 0) {
    throw new SchemaError(`${context}: "sampleSize" must be a positive finite number, got ${JSON.stringify(leaf.sampleSize)}.`);
  }
  if (leaf.sampleSize > leaf.productCount) {
    throw new SchemaError(`${context}: "sampleSize" (${leaf.sampleSize}) cannot exceed "productCount" (${leaf.productCount}).`);
  }

  if (!Array.isArray(leaf.attributes)) {
    throw new SchemaError(`${context}: "attributes" must be an array (use [] if the category genuinely has none), got ${JSON.stringify(leaf.attributes)}.`);
  }
  leaf.attributes.forEach((attr) => {
    validateAttributeStat(attr, context);
    if (attr.sampleSize !== leaf.sampleSize) {
      throw new SchemaError(`${context}: attribute "${attr.name}"'s sampleSize (${attr.sampleSize}) does not match the leaf's own sampleSize (${leaf.sampleSize}).`);
    }
  });

  if (!isFiniteNumber(leaf.colourPopulatedPct) || leaf.colourPopulatedPct < 0 || leaf.colourPopulatedPct > 100) {
    throw new SchemaError(`${context}: "colourPopulatedPct" must be a finite number in [0,100], got ${JSON.stringify(leaf.colourPopulatedPct)}.`);
  }
  if (leaf.colourPopulatedPct > 0 && !Array.isArray(leaf.colourValues)) {
    throw new SchemaError(`${context}: "colourPopulatedPct" is > 0 but "colourValues" is missing/not an array -- cannot build real colour options without them.`);
  }
  (leaf.colourValues || []).forEach((cv) => {
    if (!cv || typeof cv.value !== "string" || !cv.value || !isFiniteNumber(cv.productCount) || cv.productCount < 0) {
      throw new SchemaError(`${context}: malformed colourValues entry ${JSON.stringify(cv)}.`);
    }
  });
}

/**
 * Validates an entire snapshot document: { fetchedAt, leaves: [...] }.
 * Checks for duplicate leaf IDs BEFORE any leaf-by-leaf validation or object
 * construction -- generate-manifest.mjs later keys entries by leafId, and an
 * object-keying step silently overwrites an earlier duplicate with a later
 * one, which a post-hoc Set-based check on the RESULTING object can never
 * detect (the duplicate is already gone by then). This must run first.
 * @throws {SchemaError}
 */
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") throw new SchemaError("Snapshot is not an object.");
  if (typeof snapshot.fetchedAt !== "string" || !snapshot.fetchedAt) throw new SchemaError('Snapshot missing "fetchedAt".');
  if (!Array.isArray(snapshot.leaves) || snapshot.leaves.length === 0) {
    throw new SchemaError('Snapshot "leaves" must be a non-empty array.');
  }

  const seenIds = new Map();
  snapshot.leaves.forEach((leaf, index) => {
    const id = leaf && leaf.leafId;
    if (id && seenIds.has(id)) {
      throw new SchemaError(
        `Duplicate leafId "${id}" found in snapshot at indices ${seenIds.get(id)} and ${index} -- object-keying by leafId would silently overwrite one with the other. Fix the snapshot before generating.`
      );
    }
    if (id) seenIds.set(id, index);
  });

  snapshot.leaves.forEach(validateLeafSnapshot);
}

export { SchemaError, AUDIT_MODES };
