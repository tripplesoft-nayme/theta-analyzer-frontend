# Chart System — Technical Documentation

> **Audience:** Developers contributing to or building new chart types in the `lawalx-superadmin-frontend` codebase.  
> **Reference Charts Analyzed:** Area Chart, Column Chart, Pie Chart, Bar (Stacked) Chart

---

## Architecture Overview

The chart system is built on a shared, composable pattern:

```
ProjectBuilder Page
  └── ChartModule (e.g. AreaChartModule)
        ├── Widget Component (renders live preview)
        └── WidgetForChartModuleOne (configuration panel)

DashboardTab / DefaultChartData (renders saved charts from API)
  └── BaseChartContainer (shared container for all "completed" charts)
        ├── ChartCardWrapper (UI shell: header, menu, footer)
        ├── Chart Renderer (Recharts vis)
        ├── AddTierModal
        └── TierChartModal (renders child tiers)
```

---

## 01. Project Builder Flow

### How it starts

The Project Builder page renders a canvas. When a user drags or selects a **chart widget** (e.g., "Area Chart"), a **Chart Module component** is mounted, e.g. `AreaChartModule.tsx`.

Each chart module:
1. Initializes local state for configuration (`widgetTitle`, `xAxisValues`, `legendValues`, `startingRange`, `endingRange`, `numOfLegendDataSet`).
2. Renders the **live-preview chart** on the left using the current state.
3. Conditionally renders the **widget configuration panel** (`WidgetForChartModuleOne`) on the right *only when* `showWidget` is `true`.

### Menu buttons after selection

The chart is wrapped by `ChartCardWrapper`, which renders a `⋯` (three-dots) popover menu. The available menu items are controlled by which `menuActions` props are passed:

| Mode | Available Actions |
|---|---|
| `isCreationMode = true` | **Delete**, **Widget** only |
| `isCreationMode = false` (saved chart) | **Download**, **Add Tier**, **Widget**, **Delete** |

> **Important:** In creation mode only Delete and Widget are available. Download and Add Tier become available only after the chart is saved (i.e., `isCreationMode = false`).

```tsx
// In AreaChartModule.tsx (MANDATORY: must pass isCreationMode={true})
<AreaChart
  isCreationMode={true}    // ← MUST BE TRUE: Hides Download/AddTier in creation mode
  onToggleWidget={handleToggleWidget}
  onDelete={onDelete}
/>
```

The `Widget` button fires `handleToggleWidget` → sets `showWidget = true` → the config panel slides in alongside the preview.

---

## 02. Widget Configuration

### Configuration Component: `WidgetForChartModuleOne`

**File:** `src/common/Charts/CompletedCharts/Widgets/WidgetForChartModuleOne.tsx`

This is the **primary configuration panel** for most chart types (Area, Bar, Column, Line, HeatMap, etc.). Pie Chart and SparkLine have their own config components (`PieChartConfiguration.tsx`, `SparklineWidgetConfig.tsx`).

### Configuration fields

| Field | What it controls |
|---|---|
| Widget Title | The chart's display title and sheet name for Excel export |
| Number of X-Axis Datasets | How many time/label buckets (e.g., "Jan", "Feb") |
| X-Axis Values | The label for each dataset (typed by user) |
| Number of Legend Sets | How many data series to visualize |
| Legend Name + Color | Per-series label and color shown in chart |
| Starting Range / Ending Range | Y-axis domain (min/max values) |

> **Program Builder context**: If `isProgramBuilder = true`, the X-Axis inputs are replaced with cascading dropdowns to select a Project → Chart → Data Scope for Y-Axis data mapping.

### How `Save Changes` works

```tsx
// Simplified from WidgetForChartModuleOne.handleSaveChanges()
const payload = {
  numberOfDataset: numOfLegendDataSet,
  firstFieldDataset: startingRange,
  lastFieldDataset: endingRange,
  widgets: legendValues.map(l => ({ legendName: l.label, color: l.color })),
  title: widgetTitle,
  status: "ACTIVE",
  category: widgetCategory,           // e.g. "AREA"

  xAxis: JSON.stringify([
    // Row 0: header — first column is the label keyword, rest are legend names
    ["label", ...legendValues.map(l => l.label)],
    // Row 1+: data rows — first column is the x-axis label, rest are numeric values
    ...xAxisValues.map(label => [label, ...Array(numOfLegendDataSet).fill(0)]),
  ]),
  yAxis: JSON.stringify([]),
  zAxis: JSON.stringify([]),
  projectId: projectIdFromSlice,
  rootchart: true,
  roottitle: widgetTitle,
  grouptitle: generateId(),          // ← 6-char alphanumeric UUID (not the title!)
};

await createChart(payload).unwrap();
```

> **Key point — `grouptitle`:**  
> The `grouptitle` is set to a **randomly-generated 6-character alphanumeric UUID** via `generateId()`. This ID groups the root chart and all its child tiers together for filtering and Excel export. It is **never** the widget's human-readable title.

After a successful save, `onDelete?.()` and `onClose?.()` are called, which removes the temporary creation widget from the canvas.

---

## 03. Chart Rendering Logic

### After configuration is saved

1. The temporary widget is unmounted (`onDelete()` removes it from the canvas state).
2. The parent page re-fetches root charts using `useGetRootChartQuery(projectId)` (RTK Query auto-refetches on `invalidatesTags: ["Charts"]`).
3. `DefaultChartData.tsx` receives the updated `projectsChartsData` array and maps each chart item to its component.

### `DefaultChartData.tsx` — the chart router

**File:** `src/pages/client/ProjectBuilder/Components/DefaultChartData.tsx`

```tsx
// Simplified
const DefaultChartData = ({ projectsChartsData }) => {
  return projectsChartsData?.map((item) => {
    const categoryKey = item.category?.toUpperCase();  // e.g. "AREA"

    // 1. Normalize legends from API widgets
    const legendValues = getEffectiveLegendValues(rawLegendValues, []);

    // 2. Parse xAxis string → { labels: string[], data: ChartData[] }
    const { labels, data } = parseCommonChartData(xAxisData, legendValues, item.title);

    const commonProps = {
      widgetTitle: item.title,
      groupTitle: item.grouptitle,      // ← UUID for group identification
      xAxisValues: labels,
      legendValues,
      allUploadedData: data,
      chartId: item.id,
      projectId: item.projectId,
    };

    switch (categoryKey) {
      case "AREA": return <AreaChart {...commonProps} />;
      case "BAR":  return <StackedBarChart {...commonProps} />;
      case "PIE":  return <PieChartWidget {...commonProps} allUploadedData={pieUploadedData} />;
      // ... etc.
    }
  });
};
```

### `xAxis` JSON format (stored in the DB)

```json
[
  ["label", "Legend1", "Legend2"],   // ← Row 0: header — first column is always "label", rest are legend names
  ["Jan", 10, 20],                   // ← Row 1+: data rows
  ["Feb", 15, 25]
]
```

> **Why Row 0 is skipped:** The first row always contains the legend names (column headers), not actual data values. `parseCommonChartData()` skips row 0 unconditionally (by position, not by content inspection), then maps each remaining row to a `ChartData` object keyed by the legend field.

---

## 04. Widget Options After Configuration

`BaseChartContainer` passes menu action props to `ChartCardWrapper`:

```tsx
menuActions={{
  onDownload: !isCreationMode && tierLevel === 0 ? handleDownload : undefined,
  onDelete:   onDelete,
  onAddTier:  !isCreationMode ? () => handleAddTierClick() : undefined,
  onToggleWidget: onToggleWidget,
}}
```

| Condition | Download visible? | Add Tier visible? |
|---|---|---|
| `isCreationMode = true` | ❌ | ❌ |
| `isCreationMode = false`, `tierLevel = 0` | ✅ | ✅ |
| `isCreationMode = false`, `tierLevel > 0` (child) | ❌ | ✅ |

---

## 05. Add Tier Flow

### Trigger

User clicks **"Add Tier"** in the `⋯` menu of a saved root chart.  
`handleAddTierClick()` in `BaseChartContainer` runs:

```tsx
const handleAddTierClick = () => {
  const childPayload = {
    numberOfDataset: numOfLegendDataSet,
    firstFieldDataset: safeStartingRange,
    lastFieldDataset: safeEndingRange,
    widgets: effectiveLegendValues.map(l => ({ legendName: l.label, color: l.color })),
    title: "",              // ← filled by user in the modal
    status: "ACTIVE",
    category: category,    // e.g. "AREA"
    xAxis: JSON.stringify([...]),
    parentId: chartId,     // ← links child to parent
    rootchart: false,
    roottitle: widgetTitle,
    grouptitle: groupTitle,  // ← inherited from root chart's grouptitle UUID (NOT the widget title)
  };
  dispatch(setChildPayload(childPayload));  // ← store in Redux
  setShowAddTierModal(true);
};
```

> **`grouptitle` inheritance:** Child tiers always receive the same `grouptitle` UUID as their root chart. This UUID is stored in the `groupTitle` prop that `BaseChartContainer` receives from `DashboardTab` / `DefaultChartData`, and is cascaded down to all child tiers via `groupTitle: tier.grouptitle || groupTitle`.

### `AddTierModal`

**File:** `src/common/Modal/AddTierModal.tsx`

1. Displays the `parentChartName` (the root's `groupTitle` UUID).
2. User types a **tier name**.
3. On save, it reads `childPayload` from Redux and merges in `title: tierName`, then calls `createChart(payload)`.
4. The new tier is saved to the database with `rootchart: false`, `parentId: <rootChartId>`, and the same `grouptitle` UUID as the root.

### How child tiers are loaded and displayed

`useChartTierState.ts` calls `useLazyFindChildrenValueQuery(chartId)` whenever a chart's `chartId` is set and not `"root"`. This fetches direct child tiers from the API.

When a user **clicks the root chart card**, `TierChartModal` opens and renders all child tiers using `renderChildChart()`, which in turn renders the same chart component (e.g., `AreaChartWidget`) with the child tier's own data.

---

## 06. Download Flow

### Trigger

User clicks **"Download"** in the `⋯` menu (only visible on `tierLevel === 0`).

### Process — `downloadChartDataAsExcel()`

**File:** `src/common/Charts/CompletedCharts/Common/excelUtils.ts`

```
1. Call useLazyGetAllTheLeafChartQuery(projectId) → fetches all leaf charts grouped by grouptitle.
2. Find the group matching the root chart:
   - Primary: match any chart in group where chart.id === chartId
   - Fallback: match group where group.grouptitle === widgetTitle (legacy)
3. For each leaf chart (= a "tier") in the group:
   a. Parse xAxis JSON → extract labels and data rows
   b. Resolve legends from node.widgets or fallback to current chart's legends
   c. Build Excel sheet data: [["Label", ...legendNames], [row1...], ...]
   d. Create a unique sheet name (enforced ≤ 31 chars for Excel compliance)
4. Write all sheets to a single .xlsx workbook.
5. Trigger browser download as <widgetTitle>_ID_<id1>_<id2>.xlsx.
```

> **Note:** The download is for the **entire chart group** — all leaf tiers belonging to the same root, identified by the shared `groupTitle` UUID.

---

## 07. API Data Rendering

### API Response Shape (from `GET /chart/root/:projectId`)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "My Chart",
      "category": "AREA",
      "grouptitle": "aB3Xz9",
      "rootchart": true,
      "projectId": "...",
      "areaChart": {
        "numberOfDataset": 3,
        "firstFieldDataset": 0,
        "lastFieldDataset": 100,
        "widgets": [
          { "legendName": "Revenue", "color": "#13A490" },
          { "legendName": "Cost", "color": "#35B6EE" }
        ]
      },
      "xAxis": "[[\"label\",\"Revenue\",\"Cost\"],[\"Jan\",10,20],[\"Feb\",15,25]]"
    }
  ]
}
```

### Data Flow in `resolveChartData()`

**File:** `chartUtils.ts`

| Priority | Source | When used |
|---|---|---|
| 1 | `allUploadedData[sheetName]` | CSV was imported for this chart |
| 2 | `generatorFunc(parsedLabels, legends, ...)` | Config saved, no CSV yet → shows configured sample data |
| 3 | `generatorFunc(DEFAULT_X_AXIS_VALUES, DEFAULT_LEGEND_VALUES, ...)` | Fallback default sample |

When `isSampleData = true`, the chart subtitle shows `"(Sample Data) Assessment View"`.

---

## 08. CSV Import Flow

CSV import uses the `uploadChartData` mutation (`PATCH /chart/bulk/value-change`).

### Flow

```
1. User uploads a .xlsx or .csv file (UI component reads file via FileReader/XLSX library).
2. File is parsed → converted to a 2D array matching the xAxis format:
   [["label", "Legend1", "Legend2"], ["Jan", 10, 20], ...]
3. The parsed data is sent to the API as the new xAxis value(s).
4. API responds with updated chart data including the new values.
5. RTK Query invalidates the "Charts" tag → auto-refetches chart data.
6. resolveChartData() now finds data under Priority 1 (uploaded data) → renders real data.
```

> **Sheet name matching:** The uploaded data is stored in `allUploadedData` keyed by `sanitizeSheetName(widgetTitle)`. The chart component looks up `allUploadedData[sanitizeSheetName(widgetTitle)]` to find its data. If you change the chart title after uploading CSV, the lookup will fail — keep titles consistent.

---

## 09. Client Dashboard Chart Download

**File:** `DashboardTab.tsx`

The client-facing `DashboardTab` renders all root charts for a project. When a chart's **Download** button is clicked inside `BaseChartContainer`, the exact same `downloadChartDataAsExcel()` function is called. The only difference from Project Builder is that `isPreview = true` is passed to suppress some edit controls.

---

## 10. How to Build a New Chart Type

Follow these steps to add a new chart type (e.g., a "TreeMap Chart"):

### Step 1 — Create the Module

```
src/common/Charts/CompletedCharts/TreeMapChart/
  ├── TreeMapChart.tsx         ← Visual component
  └── TreeMapChartModule.tsx   ← Module with config state
```

**`TreeMapChartModule.tsx`** pattern:
```tsx
const TreeMapChartModule = ({ onDelete, isPreview }) => {
  const [widgetTitle, setWidgetTitle] = useState("My TreeMap");
  // ... standard state
  return (
    <div>
      <TreeMapChart widgetTitle={widgetTitle} ... isCreationMode onDelete={onDelete} />
      {showWidget && <WidgetForChartModuleOne widgedName="TreeMap Chart" ... />}
    </div>
  );
};
```

### Step 2 — Create the Chart Widget

**`TreeMapChart.tsx`** must use `BaseChartContainer`:

```tsx
export default function TreeMapChart(props: BaseChartProps) {
  const getTierLegends = (tier: any) => { /* extract legends from tier */ };

  return (
    <BaseChartContainer
      {...props}
      category="TREEMAP"               // ← new category key
      excelType="areaChart"            // ← use closest equivalent for now
      generatorFunc={generateTreeMapData}
      getTierLegends={getTierLegends}
      parseTierData={parseTreeMapData}
      renderChildChart={(tier, childProps) => (
        <TreeMapChart {...childProps} key={tier.id} />
      )}
    >
      {({ chartData, effectiveLegendValues }) => (
        /* render Recharts TreeMap here */
      )}
    </BaseChartContainer>
  );
}
```

### Step 3 — Register in `ChartCategory.ts` (only if backend-connected)

> **Important:** `chartTypes` only needs to be updated for charts that are **connected to a backend category**. Charts that are purely UI-only (no API category mapping) do **not** need to be registered here and do **not** require changes to `DefaultChartData.tsx` or `DashboardTab.tsx`.

```ts
export const chartTypes: Record<string, string> = {
  // ... existing
  TREEMAP: "treeMap",   // ← maps to the API response nested key (item.treeMap)
};
```

### Step 4 — Add to `DefaultChartData.tsx` (backend-connected charts only)

```tsx
case "TREEMAP":
  return <TreeMapChart {...commonProps} />;
```

### Step 5 — Add to `DashboardTab.tsx` (backend-connected charts only)

```tsx
if (categoryKey === "TREEMAP") {
  const { labels, data } = parseXAxisData(item?.xAxis, legendValues, item?.title);
  return (
    <TreeMapChart
      key={item.id}
      widgetTitle={item?.title}
      groupTitle={item?.grouptitle}
      xAxisValues={labels}
      legendValues={legendValues}
      chartId={item?.id}
      projectId={projectId}
      allUploadedData={data}
      isPreview={true}
    />
  );
}
```

### Step 6 — Add `excelType` if needed

If the chart has a unique download structure, add the type to `ChartExcelType` in `excelUtils.ts` and update the `downloadChartDataAsExcel` logic accordingly.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `CompletedCharts/Common/BaseChartContainer.tsx` | Shared logic layer for all chart widgets |
| `CompletedCharts/Common/ChartCardWrapper.tsx` | UI shell (header, menu, footer) |
| `CompletedCharts/Common/chartUtils.ts` | Data parsing, normalization, sample fallbacks |
| `CompletedCharts/Common/excelUtils.ts` | Excel export logic |
| `CompletedCharts/Common/chartTypes.ts` | Shared TypeScript types (`BaseChartProps`, `LegendValue`, `ChartData`) |
| `CompletedCharts/Common/useChartTierState.ts` | Tier state: fetch children, breadcrumbs, navigate |
| `CompletedCharts/Widgets/WidgetForChartModuleOne.tsx` | Standard configuration panel (used by most chart types) |
| `Modal/AddTierModal.tsx` | Modal to name and create a child tier |
| `components/client/ProjectBuilder/utils/useGenerateId.tsx` | Generates 6-char alphanumeric group UUID |
| `pages/client/ProjectBuilder/Components/DefaultChartData.tsx` | Renders saved charts in Project Builder canvas |
| `pages/client/ProjectDetails/AllDataTab/DashboardTab.tsx` | Renders saved charts in client dashboard |
| `store/Api/ChartApi/ChartApi.ts` | All chart RTK Query endpoints |
| `store/Slices/ChartSlice/ChartSlice.ts` | Redux state: `groupTitle`, `childPayload`, `projectId` |
| `utils/ChartCategory.ts` | `chartTypes` map — only backend-connected chart categories |

---

## Important Conventions

- **`grouptitle`** is always a UUID (never a human-readable name) to avoid collisions across projects.
- **`rootchart: true`** marks the primary chart; all tiers have `rootchart: false`.
- **`xAxis` Row 0** always contains the legend names (column headers). Row 0 is always skipped by `parseCommonChartData()` — parsers skip by position unconditionally.
- **`isPreview = true`** hides all edit controls (menu, widget toggle, add tier) for read-only views.
- **`allUploadedData`** is keyed by `sanitizeSheetName(widgetTitle)` — always sanitize titles using the shared util before doing a lookup.
- **Download is only on `tierLevel === 0`** (root charts) and is not available in `isCreationMode`.
- **Only register in `chartTypes`** if the chart has a backend API category. Pure UI/visual-only charts do not need backend integration and should not modify `DefaultChartData.tsx` or `DashboardTab.tsx`.


