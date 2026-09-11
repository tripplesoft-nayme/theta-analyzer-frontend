/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { X, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { TreeDataNode } from "@/Common/Charts/CompletedCharts/DecompositionTree/DecompositionTreeChart";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useCreateChartMutation, useCreateProgramChartMutation, useLazyGetRootChartQuery, useLayoutUpdateMutation } from "@/store/Api/ChartApi/ChartApi";
import { useGetUser } from "@/hooks/useGetUser";
import { useLocation } from "react-router-dom";
import { generateId } from "@/Common/Charts/CompletedCharts/Common/WidgetsConfiguration/utils/generateId";
import { setWidgetConfig } from "@/store/Slices/ChartSlice/ChartSlice";
import { AssignedByProfile } from "./WidgetCommon";

/* -------------------------------------------------------------
   TYPES
------------------------------------------------------------- */

type NodeFields = {
  name: string;
  value1: number;
  value2: number;
  color: string;
};

type FormValues = {
  widgetTitle: string;
  value1Label: string;
  value2Label: string;
  nodes: Record<string, NodeFields>;
};

type Props = {
  widgetTitle: string;
  setWidgetTitle: (title: string) => void;
  treeData: TreeDataNode;
  onTreeDataChange: (data: TreeDataNode) => void;
  onClose: () => void;
  onDelete?: () => void;
  layoutW?: number;
  layoutH?: number;
  orderIndex?: number;
  onSaveOverride?: (payload: any) => void;
};

/* -------------------------------------------------------------
   PURE TREE HELPERS  (defined outside component � stable refs)
------------------------------------------------------------- */

const rollupTree = (node: TreeDataNode): TreeDataNode => {
  if (!node.children || node.children.length === 0) return node;
  const updatedChildren = node.children.map(rollupTree);
  const v1Sum = updatedChildren.reduce((s, c) => s + (c.value1 || 0), 0);
  const v2Sum = updatedChildren.reduce((s, c) => s + (c.value2 || 0), 0);
  return {
    ...node,
    children: updatedChildren,
    value1: v1Sum > 0 ? v1Sum : node.value1,
    value2: v2Sum > 0 ? v2Sum : node.value2,
  };
};

/** Flatten tree into a record keyed by node id � used for RHF default values. */
const flattenTree = (node: TreeDataNode): Record<string, NodeFields> => {
  const result: Record<string, NodeFields> = {};
  const traverse = (n: TreeDataNode) => {
    result[n.id] = {
      name: n.name,
      value1: n.value1,
      value2: n.value2,
      color: n.color || "#3b82f6",
    };
    n.children?.forEach(traverse);
  };
  traverse(node);
  return result;
};

/** Apply RHF flat values onto a tree structure (non-mutating).
 *  Explicitly excludes the legacy `value` field so it can never
 *  be carried forward from old DB payloads via the spread. */
const applyFormToTree = (
  node: TreeDataNode,
  formNodes: Record<string, NodeFields>,
): TreeDataNode => {
  // Destructure `value` out so it is not spread into the result
  const { value: _legacy, ...rest } = node as any;
  return {
    ...rest,
    name: formNodes[node.id]?.name ?? node.name,
    value1: Number(formNodes[node.id]?.value1 ?? node.value1),
    value2: Number(formNodes[node.id]?.value2 ?? node.value2),
    color: formNodes[node.id]?.color ?? node.color,
    children: node.children?.map((c) => applyFormToTree(c, formNodes)),
  };
};

/**
 * Recursively removes the legacy `value` field from every node.
 * Needed because existing DB records were saved before `value` was
 * retired, so the raw incoming xAxis JSON still carries it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripLegacyFields = (node: any): TreeDataNode => {
  const { value: _v, ...clean } = node;
  return {
    ...clean,
    children: node.children?.map(stripLegacyFields),
  } as TreeDataNode;
};

const updateNodeInTree = (
  node: TreeDataNode,
  targetId: string,
  updater: (n: TreeDataNode) => TreeDataNode,
): TreeDataNode => {
  if (node.id === targetId) return updater(node);
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.map((c) => updateNodeInTree(c, targetId, updater)),
  };
};

const deleteNodeFromTree = (
  node: TreeDataNode,
  targetId: string,
): TreeDataNode | null => {
  if (node.id === targetId) return null;
  if (!node.children) return node;
  const filtered = node.children
    .map((c) => deleteNodeFromTree(c, targetId))
    .filter((c): c is TreeDataNode => c !== null);
  return { ...node, children: filtered.length > 0 ? filtered : undefined };
};

/* -------------------------------------------------------------
   NODE ROW  � memoized; only re-renders on structural prop changes
   Inputs are uncontrolled (registered via RHF `register`).
   Layout updates fire only on onBlur, not on every keystroke.
------------------------------------------------------------- */

type NodeRowProps = {
  nodeId: string;
  isRoot: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  v1Label: string;
  v2Label: string;
  register: UseFormRegister<FormValues>;
  onCommit: () => void;
  onAddChild: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onToggle: (id: string) => void;
  /** Color of the immediate parent node � drives the child accent stripe */
  parentColor?: string;
  children?: React.ReactNode;
};

const NodeRow = memo(
  ({
    nodeId,
    isRoot,
    isExpanded,
    hasChildren,
    v1Label,
    v2Label,
    register,
    onCommit,
    onAddChild,
    onDeleteNode,
    onToggle,
    children,
    parentColor,
  }: NodeRowProps) => {
    return (
      <div className="mb-2 w-full">
        {/* Left border + micro tint when this node is a child of a coloured parent */}
        <div
          className="flex flex-row-reverse items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded hover:border-gray-300 dark:hover:border-slate-700 transition-colors scrollbar-hide"
          style={
            parentColor
              ? {
                borderLeft: `3px solid ${parentColor}`,
                background: `${parentColor}1a`, // Slightly higher opacity for visibility in dark mode
              }
              : undefined
          }
        >
          {/* Expand / Collapse */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(nodeId)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-500 dark:text-slate-400"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Fields */}
          <div className="flex-1 flex flex-col gap-1 w-fit overflow-hidden">
            {/* Name */}
            <input
              type="text"
              {...register(`nodes.${nodeId}.name`)}
              onBlur={onCommit}
              className="px-2 py-1 w-full text-sm border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:border-blue-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              placeholder="Node name"
            />

            {/* Value1 + Value2 */}
            <div className="flex gap-1 w-full">
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase mb-0.5 ml-1">
                  {v1Label}
                </p>
                <input
                  type="number"
                  {...register(`nodes.${nodeId}.value1`, {
                    valueAsNumber: true,
                  })}
                  onBlur={onCommit}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:border-blue-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  placeholder={v1Label}
                />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase mb-0.5 ml-1">
                  {v2Label}
                </p>
                <input
                  type="number"
                  {...register(`nodes.${nodeId}.value2`, {
                    valueAsNumber: true,
                  })}
                  onBlur={onCommit}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-800 rounded focus:outline-none focus:border-blue-400 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  placeholder={v2Label}
                />
              </div>
            </div>

            {/* Color + Actions */}
            <div className="flex items-center justify-between gap-5 mt-1">
              <input
                type="color"
                {...register(`nodes.${nodeId}.color`)}
                onBlur={onCommit}
                className="w-full h-8 border border-gray-200 dark:border-slate-800 rounded cursor-pointer bg-transparent"
                title="Node color"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onAddChild(nodeId)}
                  className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Add Child"
                >
                  <Plus size={16} />
                </button>
                {!isRoot && (
                  <button
                    type="button"
                    onClick={() => onDeleteNode(nodeId)}
                    className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Child rows rendered outside NodeRow so they don't affect memo comparison */}
        {hasChildren && isExpanded && <div className="mt-1">{children}</div>}
      </div>
    );
  },
);

NodeRow.displayName = "NodeRow";

/* -------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------- */

const TreeConfiguration = ({
  widgetTitle,
  setWidgetTitle,
  treeData,
  onTreeDataChange,
  onClose,
  onDelete,
  layoutW,
  layoutH,
  orderIndex,
  onSaveOverride,
}: Props) => {
  /* -- Auth / Project setup -- */
  const [projectId, setProjectId] = useState<string>("");
  const projectIdFromSlice = useAppSelector(
    (state) => state.chartSlice.projectId,
  );
  const location = useLocation();
  const projectIdFromState = location.state?.projectId;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (projectIdFromSlice) setProjectId(projectIdFromSlice);
    else if (projectIdFromState) setProjectId(projectIdFromState);
  }, [projectIdFromSlice, projectIdFromState]);

  const isProgramBuilder = location.pathname.includes("program-builder");
  const programId = useAppSelector((state) => state.chartSlice.programId);
  const [createChart, { isLoading }] = useCreateChartMutation();
  const [createProgramChart, { isLoading: isSavingProgram }] = useCreateProgramChartMutation();
  const [getRootChartByProject] = useLazyGetRootChartQuery();
  const [layoutUpdate] = useLayoutUpdateMutation();
  const { name, role, profileImage } = useGetUser();
  const assignedBy = {
    name: name || "Admin User",
    role: role || "Analyst",
    image: profileImage || "",
  };

  /* -- Local tree structure (tracks add/delete/expand only) -- */
  const [treeStructure, setTreeStructure] = useState<TreeDataNode>(treeData);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["root"]),
  );

  /**
   * Ref mirror of treeStructure so that stable callbacks (commitToParent,
   * handleDeleteNode) can read the latest structural state without being
   * listed as useCallback dependencies � which would change their identity
   * and force every memoized NodeRow to re-render.
   */
  const treeStructureRef = useRef<TreeDataNode>(treeStructure);
  useEffect(() => {
    treeStructureRef.current = treeStructure;
  }, [treeStructure]);

  /* -- React Hook Form -- */
  const { register, getValues, setValue } = useForm<FormValues>({
    defaultValues: {
      widgetTitle,
      value1Label: treeData.value1Label || "Target",
      value2Label: treeData.value2Label || "Achieved",
      nodes: flattenTree(treeData),
    },
  });

  /* ----------------------------------------------------------
     commitToParent
     Called only on input blur � never on every keystroke.
     1. Reads current form values.
     2. Applies them onto the structural tree.
     3. Runs rollupTree (parent values = sum of children).
     4. Syncs rolled-up sums back into form fields (parent value1/value2).
     5. Notifies parent component.
  ----------------------------------------------------------- */
  const commitToParent = useCallback(() => {
    const { value1Label, value2Label, widgetTitle: wt, nodes } = getValues();

    const applied = applyFormToTree(treeStructureRef.current, nodes);
    const withLabels: TreeDataNode = { ...applied, value1Label, value2Label };
    const rolledUp = rollupTree(withLabels);

    // Sync parent sums back into the form so the UI shows correct totals
    const flatRolled = flattenTree(rolledUp);
    Object.entries(flatRolled).forEach(([id, vals]) => {
      setValue(`nodes.${id}.value1`, vals.value1, { shouldDirty: false });
      setValue(`nodes.${id}.value2`, vals.value2, { shouldDirty: false });
    });

    setTreeStructure(rolledUp);
    setWidgetTitle(wt);
    onTreeDataChange(rolledUp);
  }, [getValues, setValue, setWidgetTitle, onTreeDataChange]);
  // NOTE: treeStructure is read via ref � NOT listed as dependency � so this
  // callback stays stable across renders and NodeRow never re-renders because
  // of onCommit identity changes.

  /* -- Structural handlers (memoized, stable) -- */

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleAddChild = useCallback(
    (parentId: string) => {
      const newId = `node-${Date.now()}`;

      // Pre-register the new node in RHF so its inputs bind immediately
      setValue(`nodes.${newId}.name`, "New Node");
      setValue(`nodes.${newId}.value1`, 0);
      setValue(`nodes.${newId}.value2`, 0);
      setValue(`nodes.${newId}.color`, "#3b82f6");

      setTreeStructure((prev) => {
        const updated = updateNodeInTree(prev, parentId, (node) => ({
          ...node,
          children: [
            ...(node.children || []),
            { id: newId, name: "New Node", value1: 0, value2: 0 },
          ],
        }));
        return rollupTree(updated);
      });

      setExpandedNodes((prev) => new Set([...prev, parentId]));
    },
    [setValue],
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (nodeId === treeStructureRef.current.id) {
      toast.error("Cannot delete root node");
      return;
    }
    setTreeStructure((prev) => {
      const deleted = deleteNodeFromTree(prev, nodeId);
      return deleted ? rollupTree(deleted) : prev;
    });
  }, []);

  /* -- Save -- */
  const handleSave = async () => {
    const { value1Label, value2Label, widgetTitle: wt, nodes } = getValues();
    const title = wt || widgetTitle;

    if (!title) {
      toast.error("Please enter a widget title");
      return;
    }
    if (!isProgramBuilder && !projectId) {
      toast.error("Please select a project first");
      return;
    }

    const applied = applyFormToTree(treeStructureRef.current, nodes);
    const finalTree: TreeDataNode = { ...applied, value1Label, value2Label };
    const toSave = rollupTree(finalTree);

    const targetOrder = orderIndex !== undefined ? Number(orderIndex) : 1;
    let shiftPayload: any[] = [];
    try {
      if (typeof targetOrder === "number" && !isProgramBuilder && projectId) {
        const existingRes = await getRootChartByProject(projectId).unwrap();
        const existingCharts = existingRes?.data || existingRes || [];
        if (Array.isArray(existingCharts)) {
          existingCharts.forEach((c: any) => {
            const currentOrder = typeof c.order === "number" ? c.order : 0;
            if (currentOrder >= targetOrder) {
              let rawHeight = c.height ? Number(c.height) : 15;
              if (rawHeight >= 50) {
                rawHeight = Math.max(1, Math.round((rawHeight + 8) / 28));
              }
              shiftPayload.push({
                id: c.id,
                height: rawHeight,
                width: c.width ? Number(c.width) : 10,
                order: currentOrder + 1,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate chart shift payload", err);
    }

    const toastId = toast.loading("Creating Decomposition Tree...");
    const payload: any = {
      numberOfDataset: 1,
      firstFieldDataset: 0,
      lastFieldDataset: 100,
      widgets: [{ legendName: toSave.name, color: toSave.color || "#3b82f6" }],
      title,
      status: "ACTIVE",
      category: "DECOMPOSITION_TREE",
      xAxis: JSON.stringify(stripLegacyFields(toSave)),
      yAxis: JSON.stringify({}),
      zAxis: JSON.stringify({}),
      projectId,
      rootchart: true,
      roottitle: title,
      grouptitle: generateId(),
    };

    if (isProgramBuilder) {
      payload.programid = programId;
      payload.projectnumber = 1;
      payload.order = 1;
      payload.width = "100%";
      payload.height = "400px";

      // Program Builder does not accept these properties
      delete payload.projectId;
      delete payload.yAxis;
      delete payload.zAxis;
      delete payload.rootchart;
      delete payload.roottitle;
      delete payload.grouptitle;
    } else {
      payload.width = layoutW !== undefined ? Number(layoutW) : 10;
      payload.height = layoutH !== undefined ? Number(layoutH) : 15;
      payload.order = targetOrder;
    }

    if (onSaveOverride) {
      toast.dismiss(toastId);
      onSaveOverride(payload);
      return;
    }

    try {
      if (shiftPayload.length > 0) {
        try {
          await layoutUpdate(shiftPayload).unwrap();
        } catch (layoutErr) {
          console.error("Failed to update bulk layout order shifting", layoutErr);
        }
      }
      const res = isProgramBuilder
        ? await createProgramChart(payload).unwrap()
        : await createChart(payload).unwrap();

      if (res?.success) {
        toast.success("Decomposition Tree created successfully", {
          id: toastId,
        });
        dispatch(setWidgetConfig({ id: "decomposition-tree", config: null }));
        onDelete?.();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create decomposition tree:", error);
      toast.error("Failed to create Decomposition Tree", { id: toastId });
    }
  };

  /* -- Recursive tree renderer -- */
  const renderTree = (
    node: TreeDataNode,
    depth = 0,
    parentColor?: string,
  ): React.ReactNode => {
    const hasChildren = !!(node.children && node.children.length > 0);
    const isExpanded = expandedNodes.has(node.id);
    const isRoot = node.id === treeStructureRef.current.id;
    // Read labels from form (synchronous � no subscription needed here)
    const v1Label = getValues("value1Label") || "Target";
    const v2Label = getValues("value2Label") || "Achieved";

    return (
      <NodeRow
        key={node.id}
        nodeId={node.id}
        isRoot={isRoot}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        v1Label={v1Label}
        v2Label={v2Label}
        register={register}
        onCommit={commitToParent}
        onAddChild={handleAddChild}
        onDeleteNode={handleDeleteNode}
        onToggle={handleToggle}
        parentColor={parentColor}
      >
        {node.children?.map((child) =>
          renderTree(child, depth + 1, node.color),
        )}
      </NodeRow>
    );
  };

  /* -- Render -- */
  return (
    <div className="min-w-[350px] w-1/3 h-fit max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Configuration</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors text-gray-500 dark:text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1 scrollbar-hide">
        {/* Widget Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
            Widget Title
          </label>
          <input
            type="text"
            {...register("widgetTitle")}
            onBlur={commitToParent}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
            placeholder="Enter widget title"
          />
        </div>

        {/* Custom Labels */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">
              Primary Label
            </label>
            <input
              type="text"
              {...register("value1Label")}
              onBlur={commitToParent}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              placeholder="e.g. Target"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">
              Secondary Label
            </label>
            <input
              type="text"
              {...register("value2Label")}
              onBlur={commitToParent}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              placeholder="e.g. Achieved"
            />
          </div>
        </div>

        {/* Tree Structure */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
            Tree Structure
          </label>
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Click + to add children, edit values inline, or delete nodes
          </div>
          {renderTree(treeStructure)}
        </div>

        {/* Accountable Owner */}
        <AssignedByProfile assignedBy={assignedBy} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-800 shrink-0 mt-auto bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-800 rounded-md text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSavingProgram}
          className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading || isSavingProgram ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default TreeConfiguration;
