# Loading & Skeleton Design System Guidelines

Apply the following guidelines when handling loading states or designing skeletons for components in this application:

## 1. Context-Aware Inline Loading (No Full-Screen Overlays)
- **Do not** return a generic `<div className="text-center">Loading...</div>` or a full-page spinner if only part of the component is fetching data.
- **Do not** hide layout containers (`BoxContainer`), headers, descriptive labels, or static save buttons behind a global loader.
- Keep the component structure rendered and only replace the **dynamic elements** (image sources, form inputs, status tags, detail texts) with inline skeletons.

## 2. Skeleton Sizing & Dimensional Fidelity
Maintain size consistency between the skeleton state and the loaded state to prevent layout shifts (CLS):
- **Text Inputs & Input Boxes**: Replace with a pulsing block of exact matching size, e.g. `w-full h-10 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse`.
- **Dropdowns / Select Elements**: Replace with a matching height placeholder, e.g. `w-full h-11 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse`.
- **Textareas / Address Fields**: Replace with a height-matching pulsing block, e.g. `w-full h-24 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse`.
- **Avatar / Circular Images**: Apply `rounded-full animate-pulse bg-gray-200 dark:bg-slate-800`.
- **Badges, Roles & Status Indicators**: Replace with tiny pill-like blocks, e.g. `h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded animate-pulse`.
- **Toggles / Switches**: Replace with a small block, e.g. `h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse`.

## 3. Handling Multiple Queries / Loading Flags
When a component fetches data from multiple queries (e.g. `useGetProfileQuery` and `useGetClientDetailsQuery`):
- Destructure the `isLoading` state for all relevant hooks.
- Combine them into a single, unified `isLoading` flag at the top of the component:
  ```typescript
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery({});
  const { data: clientData, isLoading: clientLoading } = useGetClientDetailsQuery({ id }, { skip: !id });

  const isLoading = profileLoading || (id ? clientLoading : false);
  ```

## 4. Route Suspense / Lazy-Loading Skeletons
- Any route fallback component (e.g., `ClientSettingsSkeleton.tsx`) should replicate the **page's grid layout and parent containers** with absolute fidelity.
- Instead of using a single large placeholder rectangle (`h-96 w-full`), mock the cards, buttons, checkboxes, and inputs using the visual styles of the inline skeletons to ensure a seamless transition when the chunk finishes loading.
