// Explicit schema validation for the catalogue snapshot. generate-manifest.mjs
// must never silently treat a missing/invalid field as zero or false -- a
// snapshot that's missing per-value counts, for example, should fail
// generation loudly, not quietly produce a manifest with every attribute
// question rejected (which looks like "working, just conservative" instead of
// "broken").

class SchemaError extends Error {
  constructor(message) {
    super(message);
    this.name = "SchemaError";
  }
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validates one attribute entry: { name, distinctValues, totalTagged, topShare, values: [{value, count}] }.
 * @throws {SchemaError}
 */
export function validateAttributeStat(attr, context) {
  const prefix = `${context}: attribute stat`;
  if (!attr || typeof attr !== "object") throw new SchemaError(`${prefix} is not an object.`);
  if (typeof attr.name !== "string" || !attr.name) throw new SchemaError(`${prefix} missing "name".`);
  if (!isFiniteNumber(attr.distinctValues)) throw new SchemaError(`${prefix} "${attr.name}": "distinctValues" must be a finite number, got ${JSON.stringify(attr.distinctValues)}.`);
  if (!isFiniteNumber(attr.totalTagged)) throw new SchemaError(`${prefix} "${attr.name}": "totalTagged" must be a finite number, got ${JSON.stringify(attr.totalTagged)}.`);
  if (!isFiniteNumber(attr.topShare) || attr.topShare < 0 || attr.topShare > 100) {
    throw new SchemaError(`${prefix} "${attr.name}": "topShare" must be a finite number in [0,100], got ${JSON.stringify(attr.topShare)}.`);
  }
  if (!Array.isArray(attr.values) || attr.values.length === 0) {
    throw new SchemaError(`${prefix} "${attr.name}": "values" must be a non-empty array of {value, count}.`);
  }
  let sumCounts = 0;
  for (const v of attr.values) {
    if (!v || typeof v.value !== "string" || !v.value) {
      throw new SchemaError(`${prefix} "${attr.name}": every entry in "values" needs a non-empty string "value" field.`);
    }
    if (!isFiniteNumber(v.count) || v.count < 0) {
      throw new SchemaError(`${prefix} "${attr.name}": value "${v.value}" has an invalid "count" (${JSON.stringify(v.count)}).`);
    }
    sumCounts += v.count;
  }
  if (sumCounts !== attr.totalTagged) {
    throw new SchemaError(
      `${prefix} "${attr.name}": sum of per-value counts (${sumCounts}) does not match "totalTagged" (${attr.totalTagged}) -- inconsistent snapshot data.`
    );
  }
  if (attr.distinctValues !== attr.values.length) {
    throw new SchemaError(
      `${prefix} "${attr.name}": "distinctValues" (${attr.distinctValues}) does not match values.length (${attr.values.length}).`
    );
  }
}

/**
 * Validates one leaf's full snapshot record: { leafId, leafName, parentId,
 * parentName, productCount, attributes: [...], colourPopulatedPct,
 * colourPopulatedCount, colourValues?: [{value, count}] }.
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

  if (!Array.isArray(leaf.attributes)) {
    throw new SchemaError(`${context}: "attributes" must be an array (use [] if the category genuinely has none), got ${JSON.stringify(leaf.attributes)}.`);
  }
  leaf.attributes.forEach((attr) => validateAttributeStat(attr, context));

  if (!isFiniteNumber(leaf.colourPopulatedPct) || leaf.colourPopulatedPct < 0 || leaf.colourPopulatedPct > 100) {
    throw new SchemaError(`${context}: "colourPopulatedPct" must be a finite number in [0,100], got ${JSON.stringify(leaf.colourPopulatedPct)}.`);
  }
  if (leaf.colourPopulatedPct > 0 && !Array.isArray(leaf.colourValues)) {
    throw new SchemaError(`${context}: "colourPopulatedPct" is > 0 but "colourValues" is missing/not an array -- cannot build real colour options without them.`);
  }
  (leaf.colourValues || []).forEach((cv) => {
    if (!cv || typeof cv.value !== "string" || !cv.value || !isFiniteNumber(cv.count) || cv.count < 0) {
      throw new SchemaError(`${context}: malformed colourValues entry ${JSON.stringify(cv)}.`);
    }
  });
}

/**
 * Validates an entire snapshot document: { fetchedAt, leaves: [...] }.
 * Fails on the first invalid leaf with a specific, actionable message.
 * @throws {SchemaError}
 */
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") throw new SchemaError("Snapshot is not an object.");
  if (typeof snapshot.fetchedAt !== "string" || !snapshot.fetchedAt) throw new SchemaError('Snapshot missing "fetchedAt".');
  if (!Array.isArray(snapshot.leaves) || snapshot.leaves.length === 0) {
    throw new SchemaError('Snapshot "leaves" must be a non-empty array.');
  }
  snapshot.leaves.forEach(validateLeafSnapshot);
}

export { SchemaError };
