---
description: Unified Chart Workflow for Project Builder and Project Details dashboard integration
---

# Unified Chart Data Flow Workflow

This workflow documents the complete end-to-end data flow for chart creation, configuration, tier management, data download/upload, and dashboard preview. It covers all fully-implemented chart types: **StackedBarChart**, **LineChart**, **PieChart**, **HorizontalBarChart**, **ProgressRing**, **RagChart**, **FunnelChart**, and **RadarChart**.

---

## Architecture & Prop Flow

This diagram illustrates how props and actions flow through the component hierarchy during chart creation and after publishing.

### 1. Component & Prop Hierarchy
```mermaid
flowchart TD
    subgraph "Parent Context: Project Builder"
        PB["<b>ClientProjectBuilder.tsx</b><br/><i>State: selectedWidgets</i>"]
    end

    PB -- "selectedWidgets,<br/>handleWidgetDelete()" --> View["<b>ProjectDashboardView.tsx</b>"]

    subgraph "Dynamic Creation Phase"
        View -- "onDelete,<br/>isPreview=false" --> Module["<b>ChartModule</b><br/>(e.g., StackedBarChartModule)"]
        Module -- "isCreationMode=true,<br/>onToggleWidget" --> Chart["<b>ChartComponent</b><br/>(e.g., StackedBarChart)"]
        Module -- "onDelete, onClose" --> Config["<b>WidgetConfig</b><br/>(WidgetForChartModuleOne)"]
    end

    subgraph "Published / Persistent Phase"
        View -- "Refetched Data" --> DC["<b>DefaultChartData.tsx</b>"]
        DC -- "isPreview=true" --> ChartP["<b>ChartComponent</b><br/>(Static View)"]
    end

    Config -- "Mutation Success" --> Action["onDelete() + onClose()"]
    Action -- "Clears sidebar selection" --> PB
```

### 2. Chart Creation Sequence
```mermaid
sequenceDiagram
    participant PB as ClientProjectBuilder
    participant View as ProjectDashboardView
    participant Module as ChartModule
    participant Chart as ChartComponent
    participant Config as WidgetConfig
    participant API as ChartApi (Backend)

    PB->>View: Prop: selectedWidgets, handleWidgetDelete
    View->>Module: Prop: onDelete={handleWidgetDelete}, isPreview=false
    
    Module->>Chart: Render (Sample Data mode)
    Note over Module, Chart: User clicks gear icon
    Module->>Config: Render Config Panel
    
    Note over Config, API: User clicks 'Save Changes'
    Config->>API: createChart(payload)
    API-->>Config: { success: true }
    
    Note right of Config: Success Callback
    Config->>Module: onClose() (Hides UI)
    Config->>PB: onDelete() (Removes widget ID from selection)
    
    Note over PB, View: State Update triggers refetch
    View->>API: useGetRootChartQuery()
    API-->>View: Fetched Charts Data
    View->>Chart: Render in DefaultChartData (Real Data mode)
```

### 3. Visual logic Flow (Prop Passing)
```text
[ ClientProjectBuilder ]
   │
   │ prop: handleWidgetDelete ────────────────┐
   ▼                                          │
[ ProjectDashboardView ]                      │
   │                                          │
   │ prop: onDelete={handleWidgetDelete} ─────┤
   ▼                                          │
[ ChartModule (e.g. StackedBarChartModule) ]  │
   │                                          │
   ├─ prop: onToggleWidget ──▶ [ Chart Component ]
   │                                          │
   └─ prop: onDelete={onDelete} ──────────────▼
                                     [ WidgetConfig Panel ]
                                              │
                                              │ API Success
                                              ▼
                                     ┌──────────────────┐
                                     │  onDelete() Call │ ───▶ [ Triggers Parent State Update ]
                                     └──────────────────┘
```

---

## Detailed Component Roles & Lifecycle

This section explains the logical responsibility of each component and how they link together.

| Component | Primary Task | Why? (Rationale) | Connection: Before | Connection: After |
| :--- | :--- | :--- | :--- | :--- |
| **ClientProjectBuilder** | Root state holder & orchestrator. | Centralizes the user's sidebar selections so they persist across re-renders. | **User Input:** Widget sidebar click. | **ProjectDashboardView:** Passes selected IDs down. |
| **ProjectDashboardView** | Layout manager & data fetcher. | Decides whether to show "Placeholder" charts (Creation mode) or "Real" charts (API mode). | **ClientProjectBuilder:** Receives `selectedWidgets`. | **DefaultChartData:** Passes refetched API data. |
| **ChartRegistry** | Central lookup table. | Decouples the sidebar from the components; allows adding new chart types in one place. | **ProjectDashboardView:** Looked up via widget ID. | **Chart Module:** Lazy-loads the specific module. |
| **Chart Module** *(e.g. StackedBarModule)* | Local configuration state manager. | Encapsulates colors, ranges, and titles *before* they are saved to the server. | **ChartRegistry:** Rendered when a widget is selected. | **WidgetConfig + ChartComponent:** Passes local states to both. |
| **WidgetConfig** *(Panel)* | API interface & data validation. | Handles the complex logic of preparing the JSON payload for the `createChart` mutation. | **Chart Module:** Triggered when user clicks the "Gear" icon. | **Backend API:** Sends data. **Parent State:** Calls `onDelete` to clear selection. |
| **DefaultChartData** / **DashboardTab** | Persisted data mapper. | Maps the flat API list of charts back into their specific visual components. | **ProjectDashboardView / API:** Receives fetched chart list. | **Chart Component:** Renders the final visual chart with `isPreview=true`. |
| **Chart Component** *(e.g. StackedBarChart)* | Data visualization engine. | Purely responsible for rendering the chart and handling Excel exports/tiers. | **Chart Module** (Creation) or **DefaultChartData** (Published). | **Visual Output:** Displays to user. |

---

## Phase 1 — Chart Selection & Module Rendering

**Location**: `src/pages/client/ProjectBuilder/` → `ClientProjectBuilder` page

When a user selects a chart type from the widget panel, a category-specific **Module** is rendered:

| Category Key       | Module File                         | Configuration Component          |
|--------------------|-------------------------------------|----------------------------------|
| `BAR`              | `StackedBarChartModule.tsx`         | `WidgetForChartModuleOne`        |
| `LINE`             | `LineChartModule.tsx`               | `WidgetForChartModuleOne`        |
| `HORIZONTAL_BAR`   | `HorizontalBarChartModule.tsx`      | `WidgetForChartModuleOne`        |
| `PIE`              | `PieChartModule.tsx`                | `PieChartConfiguration`          |
| `PROGRESS_RING`    | `ProgressRingModule.tsx`            | `PieChartConfiguration`          |
| `RAG`              | `RagChartModule.tsx`                | `RagConfiguration`               |
| `FUNNEL`           | `FunnelChartModule.tsx`             | `FunnelConfiguration`            |
| `RADAR`            | `RadarChartModule.tsx`              | `WidgetForChartModuleOne`        |

### Module Responsibilities
Each Module:
1. Maintains local state: `widgetTitle`, `xAxisValues`, `legendValues`, `startingRange`, `endingRange`, `numOfLegendDataSet`.
2. Syncs config to Redux via `dispatch(setWidgetConfig({...}))`.
3. Renders a **live preview** of the chart component (MUST pass `isCreationMode={true}`).
4. Renders the **configuration panel** when the user clicks the Widget toggle.

### Configuration Constraints
- **WidgetForChartModuleOne** (Bar/Line/HorizontalBar):
  - Legend count: min `1`, max `5`
  - X-Axis fields: min `1`, max `7`
- **PieChartConfiguration** (Pie):
  - Slice count: min `1`, max `10`
  - No X-Axis fields (uses legend labels as slice names)

---

## Phase 2 — Chart Creation (Save to Backend)

### Payload Structure

**WidgetForChartModuleOne.handleSaveChanges** (Bar, Line, HorizontalBar):
```ts
{
  numberOfDataset: numOfLegendDataSet,             // number
  firstFieldDataset: startingRange,                 // number (Y-axis min)
  lastFieldDataset: endingRange,                    // number (Y-axis max)
  widgets: [{ legendName: string, color: string }], // legend definitions
  title: widgetTitle,                                // string
  status: "ACTIVE",
  category: "BAR" | "LINE" | "HORIZONTAL_BAR",      // matches ChartCategory key
  xAxis: JSON.stringify([
    ["Label", "Legend1", "Legend2", ...],             // header row
    ["Field1", 0, 0, ...],                           // data rows with zeroes
    ["Field2", 0, 0, ...],
  ]),
  yAxis: "{}",
  zAxis: "{}",
  projectId: string,
  rootchart: true,           // root-level chart
  roottitle: widgetTitle,
  grouptitle: widgetTitle,   // used to group tiers
}
```

**PieChartConfiguration.handleSave** (Pie):
```ts
{
  // Same structure, but:
  category: "PIE",
  xAxis: JSON.stringify([
    ["Label", "Slice1", "Slice2", ...],  // header
    ["Value", 0, 0, ...],                // single data row
  ]),
  firstFieldDataset: 0,
  lastFieldDataset: 100,
}
```

### API Call
Both use `useCreateChartMutation()` from `src/store/Api/ChartApi/ChartApi.ts`.

---

## Phase 3 — Dashboard Rendering

### Data Flow: API → Parser → Component

**Files involved**:
- `src/pages/client/ProjectDetails/AllDataTab/DashboardTab.tsx`
- `src/pages/client/ProjectBuilder/Components/DefaultChartData.tsx`

Both follow the same pattern:

#### Step 1: Category Resolution
```ts
const categoryKey = item.category?.toUpperCase();  // e.g., "BAR"
const chartProperty = chartTypes[categoryKey];       // e.g., "barChart"
const chartData = item[chartProperty];               // e.g., item.barChart
```

**ChartCategory mapping** (`src/utils/ChartCategory.ts`):
```ts
{
  BAR: "barChart",
  LINE: "multiAxisChart",
  HORIZONTAL_BAR: "horizontalBarChart",
  PIE: "pi",
  // ... other types
}
```

#### Step 2: Legend Extraction
All chart types extract legends identically:
```ts
const legendValues = (chartData?.widgets || item?.widgets)?.map((w) => ({
  label: w.legendName || w.label,
  color: w.color,
  field: (w.legendName || w.label)?.toLowerCase().replace(/\s+/g, ""),
})) || [];
```

#### Step 3: Data Parsing (Type-Specific)

| Chart Type       | Parser Function                    | Source File                       | Returns                        |
|------------------|------------------------------------|-----------------------------------|--------------------------------|
| StackedBarChart  | `parseXAxisData()`                 | Inline in `DefaultChartData.tsx`  | `{ labels, data }`            |
| LineChart        | `parseLineChartData()`             | `src/utils/parseLineChartData.ts` | `{ labels, data }`            |
| HorizontalBar    | `parseHorizontalBarData()`         | Exported from `HorizontalBarChart.tsx` | `{ labels, data }`       |
| PieChart         | `parsePieChartData()`              | `src/utils/parsePieChartData.ts`  | `PieData[]`                    |
| `ProgressRing`     | `parsePieChartData()`              | `src/utils/parsePieChartData.ts`  | `PieData[]`                    |
| `RagChart`         | `parseCommonChartData()`           | `src/common/Charts/CompletedCharts/Common/chartUtils.ts` | `{ data }` |
| `FunnelChart`      | `parseCommonChartData()`           | `src/common/Charts/CompletedCharts/Common/chartUtils.ts` | `{ labels, data }` |
| `RadarChart`       | `parseCommonChartData()`           | `src/common/Charts/CompletedCharts/Common/chartUtils.ts` | `{ labels, data }` |

**Multi-series parsers** (Bar, Line, HorizontalBar) all follow the same pattern:
```
Input: xAxis = [["Label","Leg1","Leg2"], ["Jan",10,20], ["Feb",15,25]]
       ↓
Output: {
  labels: ["Jan", "Feb"],
  data: {
    "<sanitizedTitle>": [
      { name: "Jan", leg1: 10, leg2: 20 },
      { name: "Feb", leg1: 15, leg2: 25 },
    ]
  }
}
```

**Pie parser** handles two xAxis formats:
- **2-column**: `[["Label","Value"], ["Slice A",10], ["Slice B",20]]` → maps each row to `{ name, value, color }`
- **Multi-series**: `[["Label","Leg1","Leg2"], ["Value",10,20]]` → maps first data row values to legend labels

#### Step 4: Component Rendering

```tsx
// Multi-series (Bar/Line/HorizontalBar) — note: allUploadedData is the parsed data dict
<StackedBarChart
  widgetTitle={item.title}
  xAxisValues={labels}
  legendValues={legendValues}
  numOfLegendDataSet={chartData.numberOfDataset}
  startingRange={chartData.firstFieldDataset}
  endingRange={chartData.lastFieldDataset}
  chartId={item.id}
  projectId={item.projectId}
  allUploadedData={data}           // { [sheetName]: ChartData[] }
  tierLevel={0}
  isPreview={true}                 // hides menu on DashboardTab
/>

// Pie — note: allUploadedData is a flat PieData[]
<PieChartWidget
  widgetTitle={item.title}
  legendValues={legendValues}
  numOfLegendDataSet={chartData.numberOfDataset}
  chartId={item.id}
  allUploadedData={pieData}        // PieData[]
  projectId={item.projectId}
/>

// Progressive Ring
<ProgressRing
  widgetTitle={item.title}
  legendValues={legendValues}
  allUploadedData={pieUploadedData}  // PieData[] (nested {Sheet: Array})
  projectId={item.projectId}
/>

// RAG Chart
<RagChart
  widgetTitle={item.title}
  legendValues={legendValues}
  customThresholds={JSON.parse(item.zAxis)} // Background zones
  allUploadedData={data}            // ChartData[]
  projectId={item.projectId}
/>
```

---

## Phase 4 — Chart Component Internals

### Shared Wrapper: ChartCardWrapper
All four chart components use `ChartCardWrapper` (`src/common/Charts/components/ChartCardWrapper.tsx`):
- **Header**: Title, subtitle, custom header content (legends summary or toggle buttons)
- **Menu** (3-dot popover): Download, Upload, Delete, Widget toggle, Add Tier
- **Footer**: Child tier count indicator
- **`isPreview`**: When `true`, hides the 3-dot menu entirely (used on DashboardTab)

### Data Priority in Chart Components
Each chart determines its display data with a 3-level priority system:

```
Priority 1: Real Uploaded Data   → allUploadedData/localUploadedData (must have non-zero values)
Priority 2: Sample from Config   → generateChartData() / generateLineChartData() using real labels
Priority 3: Default Fallback     → Generic sample with default labels ("Jan","Feb",...)
```

The `isSampleData` flag controls the "(Sample Data)" subtitle indicator.

### Consistent Height
All chart `ResponsiveContainer` heights are set to **400px** for visual consistency on the dashboard:
- `StackedBarChart`: `height={400}`
- `LineChart`: `height={400}`
- `PieChart`: `height={400}`
- `HorizontalBarChart`: `height={Math.max(400, chartData.length * 50)}` (dynamically expands for many bars)

---

## Phase 5 — Tier Management (Child Charts)

Tiers create a hierarchical parent → child chart structure.

### Adding a Tier

1. **User clicks "Add Tier"** in the 3-dot menu (only available when `!isCreationMode`)
2. **`handleAddTierClick`** runs:
   ```ts
   // a) Set group title (root only)
   if (tierLevel === 0) dispatch(setGroupTitle(widgetTitle));

   // b) Build child payload (inherits parent config, resets data)
   const childPayload = {
     numberOfDataset, firstFieldDataset, lastFieldDataset,
     widgets: legendValues.map(l => ({ legendName: l.label, color: l.color })),
     title: "",                          // filled by user in modal
     status: "ACTIVE",
     category: "BAR" | "LINE" | "PIE" | "HORIZONTAL_BAR",
     xAxis: JSON.stringify([
       ["Label", ...legendValues.map(l => l.label)],
       ...xAxisValues.map(label => [label, ...Array(legends.length).fill(0)]),
     ]),
     yAxis: "{}", zAxis: "{}",
     projectId,
     parentId: chartId,                  // links to parent
     rootchart: false,
     roottitle: widgetTitle,
     grouptitle: tierLevel === 0 ? widgetTitle : groupTitle,
   };

   // c) Store in Redux + open modal
   dispatch(setChildPayload(childPayload));
   setShowAddTierModal(true);
   ```

3. **AddTierModal** (`src/common/Modal/AddTierModal.tsx`):
   - Reads `childPayload` from Redux
   - User enters a tier name
   - Calls `createChart({ ...childPayload, title: tierName, grouptitle: parentChartName })`

### Viewing Child Tiers

1. **Fetch children**: `useLazyFindChildrenValueQuery(chartId)` on mount
2. **Click handler**: `handleChartClick` → if `childTiers.length > 0`, opens `TierChartModal`
3. **TierChartModal** renders a grid of child chart components, each with `tierLevel + 1`
4. **Breadcrumb navigation**: Built from `breadcrumbPath` prop, enables back-navigation across levels

### Breadcrumb Construction
```ts
const currentBreadcrumbs = [
  ...(breadcrumbPath.length === 0
    ? [{ id: "dashboard", name: "Dashboard", level: -1 }]
    : breadcrumbPath),
  { id: chartId, name: widgetTitle, level: tierLevel },
];
```

### Child Rendering Per Chart Type

Each chart component maps its children to the **same component type**:

```tsx
// StackedBarChart children render as StackedBarChart
childTiers.map(tier => {
  const tierLegends = (tier?.barChart?.widgets || []).map(...);
  const { labels, data } = parseXAxisData(tier.xAxis, tierLegends, tier.title);
  return <StackedBarChart ... tierLevel={tierLevel + 1} />;
});

// PieChart children use chartTypes mapping dynamically
childTiers.map(tier => {
  const chartWidget = chartTypes[tier.category];
  const tierLegends = (tier?.[chartWidget]?.widgets || []).map(...);
  const pieData = parsePieChartData(tier.xAxis, tierLegends);
  return <PieChartWidget ... tierLevel={tierLevel + 1} />;
});

// LineChart and HorizontalBarChart follow the same pattern
```

---

## Phase 6 — Download Excel

### Flow
1. User clicks **Download** in 3-dot menu (root level only, `tierLevel === 0`)
2. `handleDownload(widgetTitle)` calls `getAllTheLeafChart(projectId)`
   - API returns all **leaf-level** charts grouped by `grouptitle`
3. Finds the matching group: `res.data.find(item => item.grouptitle === title)`
4. For each leaf chart:
   - Extracts `xAxis` labels and `widgets`/legends
   - Creates Excel sheet with headers `["Label", "Legend1", "Legend2", ...]`
   - Rows contain labels with empty/zero data cells for user to fill
5. **Sheet naming**: `{chartTitle}_{chartId}` (truncated to 31 chars for Excel compatibility)
   - Uses `getUniqueSheetName()` to handle duplicates
6. **File naming**: `{widgetTitle}_ID_{id1}__{id2}...xlsx`
7. Downloads via `XLSX.writeFile()`

### Pie Chart Download Differences
- Headers: `["Label", "Value"]` (2-column format)
- Rows: One per slice label, single value column

---

## Phase 7 — Upload Excel

### Flow (Multi-series: Bar, Line, HorizontalBar)
1. User clicks **Upload** in 3-dot menu (root level only)
2. Triggers hidden `<input type="file">` element
3. `handleUpload` reads the `.xlsx` file:
   ```ts
   const wb = XLSX.read(bstr, { type: "binary" });
   const allData: { [key: string]: ChartData[] } = {};

   wb.SheetNames.forEach(sheetName => {
     const rawData = XLSX.utils.sheet_to_json(ws);
     const processedData = rawData.map(row => {
       const item = { name: row["Label"] || "" };
       legendValues.forEach(l => {
         item[l.field] = Number(row[l.label] ?? row[l.field] ?? 0);
       });
       return item;
     });
     allData[sheetName] = processedData;
   });
   ```
4. Stored in `localUploadedData` state → triggers re-render with real data

### Data Matching Strategy
The chart component matches uploaded data to its display by **sheet name ↔ widget title**:
```ts
const sheetName = (widgetTitle || "Sheet")
  .replace(/[:/?*[\]\\]/g, " ")
  .trim()
  .substring(0, 31);

const dataToUse = localUploadedData?.[sheetName] || allUploadedData?.[sheetName];
```

---

## Implementation Checklist for New Chart Types

When implementing a new chart type (e.g., `HISTOGRAM`), follow these steps:

### 1. Category Mapping
- [ ] Add entry in `src/utils/ChartCategory.ts`
  ```ts
  HISTOGRAM: "histogramChart",
  ```

### 2. Chart Module
- [ ] Create `src/components/client/ProjectBuilder/chartModules/HistogramChartModule.tsx`
- [ ] Use `WidgetForChartModuleOne` (multi-series) or custom config
- [ ] Pass `isCreationMode={true}` to the chart component (CRITICAL: this prevents empty Add Tier/Download modals in creation mode)
- [ ] Sync config to Redux via `setWidgetConfig`

### 3. Chart Component (Full Feature Parity)
- [ ] Create `src/common/Charts/HistogramChart.tsx` with:
  - [ ] Types: `ChartData`, `LegendValue`, `BreadcrumbItem`, `Props`
  - [ ] Data priority system (uploaded → sample config → fallback)
  - [ ] `ResponsiveContainer height={400}` for consistency
  - [ ] `ChartCardWrapper` with full `menuActions`
  - [ ] `handleCopy`, `handleDownload`, `handleUpload`, `handleAddTierClick`, `handleChartClick`
  - [ ] Tier modal rendering with breadcrumb navigation
  - [ ] Child tier fetching via `useLazyFindChildrenValueQuery`
  - [ ] `AddTierModal` + `TierChartModal` integration

### 4. Data Parser (if custom format needed)
- [ ] Create `src/utils/parseHistogramData.ts` (or reuse `parseXAxisData`)
- [ ] Export from the file for use in `DefaultChartData.tsx` and `DashboardTab.tsx`

### 5. Dashboard Integration
- [ ] Add rendering block in `DefaultChartData.tsx` for `categoryKey === "HISTOGRAM"`
- [ ] Add rendering block in `DashboardTab.tsx` for `categoryKey === "HISTOGRAM"`
- [ ] Import the parser and chart component

### 6. Testing
- [ ] Create a chart via Project Builder → verify save
- [ ] View on Dashboard → verify rendering with sample data
- [ ] Download Excel → verify template format
- [ ] Upload Excel → verify data appears in chart
- [ ] Add Tier → verify child creation
- [ ] View child tiers → verify breadcrumb navigation

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/utils/ChartCategory.ts` | Category → API property mapping |
| `src/pages/client/ProjectBuilder/Components/DefaultChartData.tsx` | Dashboard chart renderer (Project Builder preview) |
| `src/pages/client/ProjectDetails/AllDataTab/DashboardTab.tsx` | Dashboard chart renderer (Project Details) |
| `src/common/Charts/components/ChartCardWrapper.tsx` | Shared chart card UI wrapper |
| `src/common/Modal/AddTierModal.tsx` | Create child tier modal |
| `src/common/Modal/TierChartModal.tsx` | View child tiers modal with breadcrumbs |
| `src/store/Slices/ChartSlice/ChartSlice.ts` | Redux state: `childPayload`, `groupTitle`, `widgetConfig` |
| `src/store/Api/ChartApi/ChartApi.ts` | API: `createChart`, `findChildrenValue`, `getAllTheLeafChart` |
| `src/utils/parseLineChartData.ts` | Line chart xAxis parser |
| `src/utils/parsePieChartData.ts` | Pie chart xAxis parser |
| `src/utils/clientPannelHelpers/programBuilderHelpers.ts` | Sample data generators |
| `src/components/client/ProjectBuilder/WidgetForChartModuleOne.tsx` | Shared config panel (Bar/Line/HorizontalBar) |
| `src/components/client/ProjectBuilder/chartConfigurations/PieChartConfiguration.tsx` | Pie-specific config panel |

### Reference Implementations (Fully Featured)
- **Multi-series**: `src/common/Charts/StackedBarChart.tsx` (Bar), `LineChart.tsx`, `HorizontalBarChart.tsx`
- **Single-series**: `src/common/Charts/PieChart.tsx`, `ProgressRing.tsx`
- **Specialty/Status**: `src/common/Charts/CompletedCharts/Rag/RagChart.tsx` (RAG)
