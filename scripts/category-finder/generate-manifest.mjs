// Run manually (not part of `npm run build`, not run in CI):
//
//   node scripts/category-finder/generate-manifest.mjs
//
// Pure transform, no network calls -- reads the committed snapshot
// (.snapshot/catalogue-snapshot.json, produced by fetch-catalogue-snapshot.mjs)
// and families.js, classifies every leaf, and writes:
//   - src/config/generated/categoryFinderManifest.js
//   - src/config/generated/reconciliation.js
//
// Aborts WITHOUT writing anything if curated + inherited + generic + excluded
// doesn't exactly equal the snapshot's leaf count -- this is the reconciliation
// protection: a bug in classify() or a partially-read snapshot can never
// silently produce an incomplete manifest.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FAMILIES, LEAF_FAMILY_MAP, LEAF_OVERRIDES, sharedQuantityQuestion, sharedBudgetQuestion, sharedColourQuestion } from "./families.js";
import { isAttributeUsable, isColourUsable, hasNoProducts } from "./lib/exclusionRules.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, ".snapshot", "catalogue-snapshot.json");
const OUT_MANIFEST = path.join(__dirname, "../../src/config/generated/categoryFinderManifest.js");
const OUT_RECONCILIATION = path.join(__dirname, "../../src/config/generated/reconciliation.js");

function findAttr(attributes, name) {
  return (attributes || []).find((a) => a.name === name);
}

function questionIdFor(attributeName) {
  return attributeName.toLowerCase().replace(/\s+/g, "_");
}

function classifyLeaf(leaf) {
  if (LEAF_OVERRIDES[leaf.leafId]) {
    return { finderMode: "curated", proposedFamily: null, questions: LEAF_OVERRIDES[leaf.leafId].questions, notes: ["Hand-authored override."] };
  }
  if (hasNoProducts(leaf.productCount)) {
    return { finderMode: "excluded", proposedFamily: null, questions: [], notes: [leaf.exclusionReason || "Zero products match this category."] };
  }

  const notes = [];
  const chosenAttrNames = [];
  let proposedFamily = null;
  let finderMode = "generic";

  const familyKey = LEAF_FAMILY_MAP[leaf.leafId];
  if (familyKey && FAMILIES[familyKey]) {
    const family = FAMILIES[familyKey];
    const required = findAttr(leaf.attributes, family.requiredAttribute);
    if (isAttributeUsable(required, leaf.productCount)) {
      proposedFamily = familyKey;
      finderMode = "inherited";
      chosenAttrNames.push(family.requiredAttribute);
      const optional = findAttr(leaf.attributes, family.optionalAttribute);
      if (chosenAttrNames.length < 2 && isAttributeUsable(optional, leaf.productCount)) {
        chosenAttrNames.push(family.optionalAttribute);
      }
      notes.push(`Inherited ${familyKey}: ${family.requiredAttribute} passed usability check.`);
    } else {
      notes.push(`${familyKey} family considered but ${family.requiredAttribute} failed usability for this leaf -- fell back to generic.`);
    }
  }

  if (chosenAttrNames.length < 2) {
    const candidates = (leaf.attributes || [])
      .filter((a) => isAttributeUsable(a, leaf.productCount) && !chosenAttrNames.includes(a.name))
      .sort((a, b) => b.totalTagged - a.totalTagged);
    for (const c of candidates) {
      if (chosenAttrNames.length >= 2) break;
      chosenAttrNames.push(c.name);
    }
  }

  const colourUsable = leaf.colourPopulatedPct != null && isColourUsable(leaf.colourPopulatedPct);

  const questions = [sharedQuantityQuestion(), sharedBudgetQuestion()];
  // NOTE: option *values* for attribute questions must be validated against
  // real, currently-existing raw values from the snapshot before this script
  // is trusted for a real rollout -- PR2's job, not assumed here. This PR1
  // scaffolding only proves the classify()/question-shape/reconciliation
  // machinery works; it does not ship any generated attribute question yet
  // (the only entry in the committed manifest is the hand-authored PE-02
  // override, which bypasses this path entirely).
  chosenAttrNames.forEach((name) => {
    questions.push({ id: questionIdFor(name), label: name, placeholder: "Any", type: "attribute", attributeName: name, options: [] });
  });
  if (colourUsable) questions.push(sharedColourQuestion([]));

  return { finderMode, proposedFamily, questions, notes };
}

function main() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`No snapshot found at ${SNAPSHOT_PATH}. Run fetch-catalogue-snapshot.mjs first.`);
    process.exit(1);
  }
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  const leaves = snapshot.leaves || [];

  const manifest = {};
  const counts = { curated: 0, inherited: 0, generic: 0, excluded: 0 };

  for (const leaf of leaves) {
    const result = classifyLeaf(leaf);
    counts[result.finderMode] = (counts[result.finderMode] || 0) + 1;
    manifest[leaf.leafId] = {
      categoryId: leaf.leafId,
      categoryName: leaf.leafName,
      parentCategoryId: leaf.parentId,
      parentCategoryName: leaf.parentName,
      itemNamePlural: leaf.leafName.toLowerCase(),
      finderEyebrow: "Find it faster",
      finderTitle: `Find the right ${leaf.leafName.toLowerCase()} in under 30 seconds`,
      finderDescription: "Choose what matters most and we'll narrow the range.",
      hierarchyLevel: leaf.isMainItself ? 1 : 2,
      menuLinked: ["promotional", "clothing", "headwear"].includes(String(leaf.navGroup || "").toLowerCase()),
      finderMode: result.finderMode,
      proposedFamily: result.proposedFamily,
      filterMappingsValidated: result.finderMode !== "excluded",
      exclusionReason: result.finderMode === "excluded" ? result.notes[0] : null,
      dataQualityNotes: result.notes,
      questions: result.questions,
    };
  }

  const total = leaves.length;
  const reconciledSum = counts.curated + counts.inherited + counts.generic + counts.excluded;
  if (reconciledSum !== total || Object.keys(manifest).length !== total) {
    console.error(
      `Reconciliation FAILED: curated(${counts.curated}) + inherited(${counts.inherited}) + generic(${counts.generic}) + excluded(${counts.excluded}) = ${reconciledSum}, expected ${total}. Aborting without writing anything.`
    );
    process.exit(1);
  }

  const manifestSource = `// AUTO-GENERATED by scripts/category-finder/generate-manifest.mjs -- do not hand-edit.
// Source snapshot fetched: ${snapshot.fetchedAt}
export const CATEGORY_FINDER_MANIFEST = ${JSON.stringify(manifest, null, 2)};
`;
  const reconciliationSource = `// AUTO-GENERATED by scripts/category-finder/generate-manifest.mjs -- do not hand-edit.
export const RECONCILIATION = ${JSON.stringify({ totalLeafEntries: total, ...counts }, null, 2)};
`;

  fs.writeFileSync(OUT_MANIFEST, manifestSource);
  fs.writeFileSync(OUT_RECONCILIATION, reconciliationSource);
  console.log(`Reconciled: ${JSON.stringify(counts)} = ${total}. Wrote manifest + reconciliation.`);
}

main();
