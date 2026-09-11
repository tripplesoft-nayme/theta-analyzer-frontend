# ProjectDashboardView Architecture Guide

The `ProjectDashboardView` has been decomposed from a single massive file into a modular, decoupled architecture. This guide explains the responsibility of each file to help you navigate and maintain the dashboard.

## 📁 Directory Structure
```
ProjectDashboardView/
├── ProjectDashboardView.tsx          # The Main Orchestrator
├── DashboardGridItemRenderer.tsx     # The Widget Switchboard
├── DefaultDashboardWidgets.tsx       # Placeholder / Default State
├── DragDropPlaceholder.tsx           # Inline Drop Target UI
├── FullscreenToggle.tsx              # Fullscreen Button UI
├── ChartErrorBoundary.tsx            # Error Catching Wrapper
└── hooks/
    ├── useDashboardData.ts           # API & Data aggregation
    ├── useDashboardLayout.ts         # Grid Layout & Persistence
    ├── useDashboardDragDrop.ts       # Drag/Drop & Auto-scroll
    └── useFullscreen.ts              # Fullscreen Browser API
```

---

## 🧩 The Core Orchestrator

### `ProjectDashboardView.tsx`
This is the root container. It **does not** contain heavy logic anymore. Instead, its job is simply to:
1. Call the custom hooks to get the data, layout state, and drag handlers.
2. Render the `DashboardGridItemRenderer` in a loop over the layout grid.
3. Render the `DefaultDashboardWidgets` if the dashboard is empty.

---

## 🪝 The Logic Layer (Custom Hooks)

These hooks handle all the "brains" of the dashboard, meaning you don't have to look at complex `useEffects` while trying to write UI code.

### `hooks/useDashboardData.ts`
**Responsibility**: Fetching and parsing all API data.
- Executes the RTK Query hooks (`useGetRootChartQuery`, `useGetProjectInformationTableQuery`, etc.)
- Merges API responses and Redux templates into a single `finalChartsData` array.
- Determines if the dashboard currently `hasTableData` or `hasFilesData`.

### `hooks/useDashboardLayout.ts`
**Responsibility**: Managing the visual grid sizes and layout persistence.
- Initializes and maintains the `layouts` state (width `w` and height `h` for every widget).
- Handles the complex logic that enforces minimum sizes (e.g., Marimekko charts requiring minimum height).
- Listens to active configuration clicks and dynamically expands/reverts the sidebar width to `w: 20` using a `MutationObserver`.
- Saves the layout and order to browser `localStorage`.

### `hooks/useDashboardDragDrop.ts`
**Responsibility**: Handling the physics and state of dragging items.
- Manages the `draggedItemId` and Re-ordering logic.
- **Auto-scroller**: Contains the `setInterval` logic that automatically scrolls the window up or down if the user drags a widget near the top or bottom of the screen.

### `hooks/useFullscreen.ts`
**Responsibility**: Interacting with the native browser fullscreen API.
- Toggles fullscreen mode and safely catches browser rejection errors.
- Automatically collapses the global sidebar when fullscreen is engaged.

---

## 🎨 The UI Layer (Sub-Components)

These are pure React components responsible exclusively for rendering visuals.

### `DashboardGridItemRenderer.tsx`
**Responsibility**: The "Switchboard" for the grid.
- Takes an `id` string (e.g., `project-info-table`, `file-group-123`, or a custom chart ID).
- Contains the `if / else` logic to figure out *what* component to actually render for that ID.
- Wraps the final widget inside the draggable/resizable `<DashboardGridItem>`.

### `DefaultDashboardWidgets.tsx`
**Responsibility**: The Empty State.
- If a project is completely empty and has no widgets added yet, this component renders the default "Getting Started" visuals (`KpiModule`, `ApexColumnChart`, `DoughnutChart`, `HeatmapChart`).

### `DragDropPlaceholder.tsx`
**Responsibility**: The Drop Zone UI.
- The blue, dashed "Release to add widget" box with a pulse animation that appears inside the grid when a user drags a new widget from the sidebar over the canvas.

### `FullscreenToggle.tsx`
**Responsibility**: The Floating Button.
- Renders the floating circular button in the bottom right corner of the screen with the `Maximize2` / `Minimize2` icons.

### `ChartErrorBoundary.tsx`
**Responsibility**: Preventing crash cascades.
- A React Class Component that wraps individual widgets. If one specific chart crashes due to a data error, it catches the error and displays a red "Component Error" box, keeping the rest of the dashboard alive and functional.
