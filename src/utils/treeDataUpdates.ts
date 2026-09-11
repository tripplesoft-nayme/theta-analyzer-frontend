import { TreeDataNode } from "@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeChart";

/**
 * Updates a decomposition tree with dual values (Target and Achieved) from CSV row maps.
 * Rolls up child values to update parent totals automatically.
 */
export const updateDecompositionTreeWithValues = (
  root: TreeDataNode,
  v1Map: Map<string, number>,
  v2Map: Map<string, number>,
): TreeDataNode => {
  const updateNode = (node: TreeDataNode): TreeDataNode => {
    // 1. If it's a leaf node, update from the maps if present
    if (!node.children || node.children.length === 0) {
      const updatedNode = {
        ...node,
        value1: node.value1 ?? 0,
        value2: node.value2 ?? 0,
      };

      if (v1Map.has(node.name)) {
        const val1 = v1Map.get(node.name) ?? 0;
        updatedNode.value1 = val1;
      }

      if (v2Map.has(node.name)) {
        updatedNode.value2 = v2Map.get(node.name) ?? 0;
      }

      return updatedNode;
    }

    // 2. If it's a parent, recursively update all children first
    const updatedChildren = node.children.map((child) => updateNode(child));

    // 3. Roll up: The parent's values become the sum of the children's values
    const v1Sum = updatedChildren.reduce(
      (sum, child) => sum + (child.value1 || 0),
      0,
    );
    const v2Sum = updatedChildren.reduce(
      (sum, child) => sum + (child.value2 || 0),
      0,
    );

    return {
      ...node,
      children: updatedChildren,
      value1: v1Sum,
      value2: v2Sum,
    };
  };

  return updateNode(root);
};
