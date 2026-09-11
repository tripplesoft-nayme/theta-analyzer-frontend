# Dark Mode Design Skill

To ensure top-notch consistency and a premium "Senior Designer" aesthetic across the application, follow this strictly defined color palette, utility patterns, and interactive states for all Dark Mode implementations.

## 1. Core Surfaces & Backgrounds

We use a layered approach to create depth. Components should not be the same color as the background.

| Element               | Light Mode     | Dark Mode                              | Rationale                                                                |
| :-------------------- | :------------- | :------------------------------------- | :----------------------------------------------------------------------- |
| **Global Background** | `bg-white`     | `dark:bg-slate-900` (hsl(222 47% 10%)) | Deep, premium navy base.                                                 |
| **Card / Container**  | `bg-white`     | `dark:bg-slate-900` (hsl(222 47% 13%)) | Slightly lighter than background to create elevation.                    |
| **Sidebar**           | `bg-[#F8FAFC]` | `dark:bg-slate-900/80`                 | Semi-transparent slate for a modern sidebar feel.                        |
| **Popovers / Modals** | `bg-white`     | `dark:bg-slate-900`                    | Consistent with card surfaces but often with higher elevation (shadows). |

## 2. Typography Hierarchy

Avoid pure white (`#FFF`) for body text to reduce eye strain.

| Role                 | Light Mode      | Dark Mode             |
| :------------------- | :-------------- | :-------------------- |
| **Headings (H1-H4)** | `text-gray-900` | `dark:text-slate-100` |
| **Primary Body**     | `text-gray-700` | `dark:text-slate-200` |
| **Secondary / Meta** | `text-gray-600` | `dark:text-slate-400` |
| **Muted / Labels**   | `text-gray-500` | `dark:text-slate-500` |

## 3. Border Settings

Borders must be subtle to avoid a "boxy" look.

- **Standard Border**: `border-gray-200` &rarr; `dark:border-slate-800`
- **Subtle Divider**: `border-border` &rarr; `dark:border-slate-800/50`
- **Interactive Border**: `hover:border-blue-500` &rarr; `dark:hover:border-blue-400`
- **Input Border**: `border-gray-300` &rarr; `dark:border-slate-800` (use `dark:focus:border-slate-600` for focus).

## 4. Hover & Interactive States

Hover effects should be subtle and consistent.

- **Standard Hover**: `hover:bg-gray-100` &rarr; `dark:hover:bg-slate-800`
- **Ghost Button Hover**: `hover:bg-gray-100` &rarr; `dark:hover:bg-slate-800`
- **Table Row Hover**: `hover:bg-gray-100` &rarr; `dark:hover:bg-slate-800/80`
- **Link Hover**: `hover:text-blue-600` &rarr; `dark:hover:text-blue-400`

## 5. Components & Interactive Elements

### Buttons

- **Primary**: `bg-blue-600` &rarr; `dark:bg-blue-600` (Maintain high contrast).
- **Secondary**: `bg-white` &rarr; `dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800`.
- **Active State**: Use `dark:bg-blue-600` for active toggles (like Board/Table view).

### Status Badges

Always use translucent backgrounds in dark mode for a professional look.

- **Success**: `bg-emerald-50 text-emerald-700` &rarr; `dark:bg-emerald-500/10 dark:text-emerald-400`
- **Warning**: `bg-yellow-50 text-yellow-700` &rarr; `dark:bg-amber-500/10 dark:text-amber-400`
- **Error**: `bg-red-50 text-red-700` &rarr; `dark:bg-rose-500/10 dark:text-rose-400`

### Skeletons

Skeletons should match the surface they sit on.

- **Base**: `bg-gray-200` &rarr; `dark:bg-slate-800`
- **Animation**: Standard pulse animation.

### Tables

Tables must use zebra striping and defined header backgrounds for a structured, professional look.

- **Header Background**: `bg-[#F7F9FA]` &rarr; `dark:bg-slate-900`
- **Header Text**: `text-gray-900` &rarr; `dark:text-slate-300` (Use `font-medium`)
- **Row (Even)**: `bg-[#F7F9FA]` &rarr; `dark:bg-slate-900/50`
- **Row (Odd)**: `bg-white` &rarr; `dark:bg-slate-900`
- **Border**: `border-[#E2E8F0]` &rarr; `dark:border-slate-800`
- **Cell Padding**: Standard `px-6 py-3.5` for all content cells.

### Action Columns

Action columns should be concise and use consistent iconography.

- **Button Variant**: Use `ghost` or `outline` variants.
- **Icon Colors**:
    - **View**: `text-blue-500` &rarr; `dark:text-blue-400`
    - **Edit**: `text-emerald-600` &rarr; `dark:text-emerald-400`
    - **Delete**: `text-red-600` &rarr; `dark:text-rose-400`
- **Hover State**: `dark:hover:bg-slate-800` or `dark:hover:bg-blue-500/10`.
- **Interaction**: Always use `e.stopPropagation()` if the table row is clickable.

## 6. Implementation Rules

1. **Never use solid black** (`#000`) for backgrounds.
2. **Layering is key**: If a card is on the background, the card must be lighter than the background.
3. **Consistency**: Always use the slate-based utilities above if applying manually.
4. **Transparency**: Use opacity (e.g., `/10`, `/50`) for overlays and status backgrounds to blend with the deep navy base.
