# Skill: Widget Configuration Implementation

This skill defines how to modify or add configuration panels and data logic for Program/Project Builder widgets.

## 1. Project Builder Context (`isProgramBuilder = false`)
- **Action**: Use `ProjectBuilderConfigurationOne.tsx`.
- **State**: Sync `widgetTitle`, `xAxisValues`, `legendValues`, and numeric ranges.
- **Payload**: Generate a JSON `chartData` sample and a 2D `xAxis` array.
- **UI Rule**: Show "Display Settings" (Legend management) and "Standard Value Entry" (X-Axis labels).

## 2. Program Builder Context (`isProgramBuilder = true`)
- **Action**: Use `ProgramBuilderConfigurationOne.tsx` for standard aggregation charts (BAR, LINE, etc.).
- **Specialized Charts**: Pie, RAG, Funnel, and other non-standard charts require their own dedicated configuration components (e.g., `PieChartConfiguration.tsx`) to handle specific aggregation logic or threshold settings.

### A. General Configuration Flow
- **Behavior**: Same as Project Builder (Manual entry).
- **Toggle**: `isValueDetectOn` = `false`.

### B. Data Aggregation Flow (Value Detect)
- **Toggle**: `isValueDetectOn` = `true`.
- **Filtering Logic**: 
    - Fetch source projects via `useLazyGetProjectsByProgramIdQuery`.
    - Fetch source charts via `useLazyGetRootChartQuery`.
    - **Crucial**: Filter charts in the dropdown based on `category` AND ensure they share the same legend set as the first selected chart.
- **Aggregation Logic (Intersection)**:
    - Automatically find the **intersection** of legend labels across all selected source charts.
    - Only common legends are maintained in the resulting chart.
    - **X-Axis Labels**: Automatically populated with the **Titles** of the selected source charts.
- **Payload (Aggregation)**:
    - Uses `similervalueDitects` schema instead of manual `xAxis` array.
    - Sets `projectnumber: 1`.
    - Schema: 
      ```json
      {
        "similervalueDitects": [
          {
            "chartlist": ["chart_id_1", "chart_id_2"],
            "legentName": ["Legend A", "Legend B"]
          }
        ]
      }
      ```

## 3. General Chart Implementation Rules
- **Component Wrapper**: Always wrap visual charts in `BaseChartContainer`.
- **Legend IDs**: Fields must be generated using `.toLowerCase().replace(/\s+/g, "")`. Never use raw indices as keys.
- **Height/Width**:
    - **Width**: Integers 1-20 (mapping to 20-column grid).
    - **Height**: String with "px" suffix (e.g., "412px").
- **Error Handling**: Wrap all visualization components in `ChartErrorBoundary`.

## 4. UI Refinement Standards
- Use `DebouncedInput` for titles and labels to prevent redundant Redux updates.
- Use `lucide-react` for action icons (Trash2, X, Plus, etc.).
- Maintain consistent spacing: `p-6` for containers, `gap-4` for form groups.
- Display numeric inputs for any collection (Number of Legends, Number of X-Axis sets).
