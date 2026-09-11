# Builder Configuration & Chart Logic Documentation

This document outlines the standardized architecture for Project and Program Builder widget configurations, focusing on data flow, state management, and the implementation of complex charts like the Stacked Bar Chart.

## 1. Project vs. Program Builder: The Core Difference

| Feature              | Project Builder Configuration                 | Program Builder Configuration                           |
| :------------------- | :-------------------------------------------- | :------------------------------------------------------ |
| **Logic Type**       | **Direct Entry / Sample Data**                | **Aggregation / Value Detection**                       |
| **Primary Goal**     | Define structure for a single project's data. | Aggregate data across multiple projects or sources.     |
| **Data Source**      | Manual entry of X-Axis labels and Ranges.     | Selection of existing charts ("Sources") from projects. |
| **Config Component** | `ProjectBuilderConfigurationOne.tsx`          | `ProgramBuilderConfigurationOne.tsx`                    |
| **Payload Schema**   | `chartData` (JSON) + `xAxis` (2D Array)       | `similervalueDitects` (Aggregation map)                 |

---

## 2. Configuration Flow & State Management

### A. Component Hierarchy

1. **Module Wrapper** (`StackedBarChartModule`): Manages local UI state (title, ranges) and dispatches to Redux.
2. **Chart Layout** (`ProjectDashboardView`): The canvas where widgets live.
3. **Configuration Panel** (`WidgetForChartModuleOne`): A router that toggles between Project and Program config views based on the `isProgramBuilder` flag.

### B. The "Value Detect" Process (Program Builder)

Program Builder supports two configuration modes: **General Configuration** (same as Project Builder) and **Data Aggregation** (Value Detect).

#### 1. The Aggregation Process

When `isValueDetectOn` is enabled in `ProgramBuilderConfigurationOne.tsx`:

1.  **Cascading Selection**: User selects a **Project** (within the program) → selects a **Source Chart**.
2.  **Compatibility Filtering**: The source chart dropdown only shows charts that match the current widget's category (e.g., BAR, LINE).
3.  **Legend Intersection**:
    - The widget calculates the **intersection of legends** across all selected source charts.
    - Example: Chart A has ["Active", "Closed"]; Chart B has ["Active", "Pending"]. The aggregated chart will only show the **"Active"** legend.
    - This ensures data consistency across disparate sources.
4.  **Automatic X-Axis**: The X-axis labels are automatically generated using the **Titles** of the selected source charts.

#### 2. Aggregation Payload

Unlike standard charts that send a manual `xAxis` 2D array, the aggregation mode sends:

- **`similervalueDitects`**: A mapping array:
  ```json
  "similervalueDitects": [
    {
      "chartlist": ["chart_id_1", "chart_id_2", "..."],
      "legentName": ["Common Legend A", "Common Legend B"]
    }
  ]
  ```
- **`projectnumber: 1`**: A flag used by the backend to identify this as an aggregated chart requiring dynamic value calculation.

---

## 3. Chart Working Logic: Stacked Bar Chart Example

The Stacked Bar Chart utilizes a robust pipeline to transform raw API data into visual components.

### A. Data Transformation (`chartUtils.ts`)

The API stores chart data as a **2D Array** (Excel-like format) to maintain simplicity for the backend. `parseCommonChartData` converts this:

```json
// Raw API (XAxis 2D Array)
[["Labels", "Completed", "Pending"], ["Jan", 10, 20], ["Feb", 15, 25]]

// Transformed (Recharts Format)
[
  { "name": "Jan", "completed": 10, "pending": 20 },
  { "name": "Feb", "completed": 15, "pending": 25 }
]
```

### B. Visualization Component (`StackedBarChart.tsx`)

- **Container**: Wrapped in `BaseChartContainer` to handle auto-scaling, legends, and skeleton states.
- **Stacking**: Multiple `<Bar />` components are rendered with `stackId="a"`.
- **Dynamic Legends**: Cycles through `effectiveLegendValues` to create bars with specific `dataKey` and `fill` colors.

---

## 4. Implementation Rules for New Charts

When adding a new chart type, follow these "Golden Rules":

1. **Mandatory Props**: Every widget must accept `isPreview`, `onDelete`, and `height`.
2. **Registry Mapping**: Register the new chart in `ChartRegistry.ts` with its metadata and component.
3. **Naming Logic**: Legend fields must be derived from labels using:
   `label.toLowerCase().replace(/\s+/g, "")`
4. **Value Detect Support**: If implementing for Program Builder, ensure `ProgramBuilderConfigurationOne` is updated to handle the specific payload properties required by your chart category.
5. **BaseContainer Usage**: Always use `BaseChartContainer` as the parent to ensure layout consistency (e.g., correctly responding to the 20-column grid).

---

## 5. Summary of Dependencies

- **Recharts**: For heavy-lifting visualization.
- **Redux (`chartSlice`)**: Syncs configuration state across the builder.
- **RTK Query (`ChartApi`)**: Handles all persistence and "Value Detect" source fetching.
- **Lucide React**: Standard icon set for UI controls.
