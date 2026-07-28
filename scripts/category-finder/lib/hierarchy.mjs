// Pure, dependency-free hierarchy traversal shared by fetch-catalogue-snapshot.mjs
// and its tests. Supports arbitrary nesting depth (not just one `subTypes`
// level) and fails loudly and specifically on structural problems instead of
// silently producing a partial or wrong flat list.

class HierarchyError extends Error {
  constructor(message) {
    super(message);
    this.name = "HierarchyError";
  }
}

/**
 * Recursively flattens a category hierarchy into a flat list of leaves
 * (nodes with no children) and a flat list of parents (nodes with children,
 * at any depth). A node is any object with at least {id, name}, optionally
 * a child array under `childrenKey` (default "subTypes").
 *
 * @param {Array<object>} roots - top-level category nodes
 * @param {object} [options]
 * @param {string} [options.childrenKey="subTypes"]
 * @returns {{ leaves: Array<object>, parents: Array<object> }}
 * @throws {HierarchyError} on duplicate IDs, circular references, or
 *   malformed nodes (missing id/name, or a node with both zero-length and
 *   present-but-non-array children).
 */
export function flattenHierarchy(roots, { childrenKey = "subTypes" } = {}) {
  if (!Array.isArray(roots)) {
    throw new HierarchyError(`flattenHierarchy: roots must be an array, got ${typeof roots}`);
  }

  const seenIds = new Map(); // id -> path, for duplicate detection with a useful error
  const leaves = [];
  const parents = [];

  function visit(node, ancestry, parent) {
    if (!node || typeof node !== "object") {
      throw new HierarchyError(`Malformed node encountered under path [${ancestry.join(" > ")}]: not an object.`);
    }
    if (!node.id) {
      throw new HierarchyError(`Malformed node encountered under path [${ancestry.join(" > ")}]: missing id.`);
    }
    if (!node.name) {
      throw new HierarchyError(`Malformed node encountered (id=${node.id}) under path [${ancestry.join(" > ")}]: missing name.`);
    }

    if (ancestry.includes(node.id)) {
      throw new HierarchyError(
        `Circular reference detected: category ${node.id} appears in its own ancestry chain [${ancestry.join(" > ")} > ${node.id}].`
      );
    }

    if (seenIds.has(node.id)) {
      throw new HierarchyError(
        `Duplicate category ID "${node.id}" found at path [${ancestry.join(" > ")}] -- already seen at [${seenIds.get(node.id)}]. Category IDs must be globally unique across the whole hierarchy.`
      );
    }
    seenIds.set(node.id, ancestry.join(" > ") || "(root)");

    const children = node[childrenKey];
    const hasChildrenField = Object.prototype.hasOwnProperty.call(node, childrenKey);
    if (hasChildrenField && children != null && !Array.isArray(children)) {
      throw new HierarchyError(`Malformed node ${node.id}: "${childrenKey}" is present but not an array (got ${typeof children}).`);
    }

    const childList = Array.isArray(children) ? children : [];
    const leafRecord = { id: node.id, name: node.name, parentId: parent ? parent.id : node.id, parentName: parent ? parent.name : node.name, isMainItself: !parent, navGroup: node.navGroup ?? (parent ? parent.navGroup : null), depth: ancestry.length };

    if (childList.length === 0) {
      leaves.push(leafRecord);
      return;
    }

    parents.push({ id: node.id, name: node.name, depth: ancestry.length, childCount: childList.length });
    for (const child of childList) {
      visit(child, [...ancestry, node.id], node);
    }
  }

  for (const root of roots) {
    visit(root, [], null);
  }

  return { leaves, parents };
}

export { HierarchyError };
