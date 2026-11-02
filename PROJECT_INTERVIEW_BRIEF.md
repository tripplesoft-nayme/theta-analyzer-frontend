# LawalX Frontend — Interview Brief

## 30-second summary

LawalX is a multi-role project and program management SPA. It lets client organizations define programs and projects, build configurable dashboards from many chart/widget types, manage sheet-like project data, schedules, files, submissions, reviews, notifications, and support conversations. Managers supervise programs and approve work, employees execute and submit work, and viewers receive read-oriented access.

The frontend is React 19 + TypeScript + Vite, with React Router, Redux Toolkit/RTK Query, persisted JWT authentication, Tailwind CSS v4/shadcn/Radix UI, many visualization libraries, Socket.IO, spreadsheet tooling, maps, and PDF/CSV/Excel export.

## Repository snapshot

- Branch/commit inspected: `main` at `5a0ec4d` (`update`).
- 987 non-generated project files; 947 TypeScript/TSX/CSS files.
- About 174,475 source lines, inflated heavily by duplicate and unused code.
- Main areas: `pages` 278 files, `Common` 227, `common` 227, `components` 70, `Layout` 47, `store` 35.
- `src/Common` and `src/common` contain 227 exact duplicate pairs. This is dangerous on case-insensitive development filesystems and case-sensitive CI/Linux.
- There are many `Unused` folders containing prototypes or retired screens.
- No README and no automated unit/integration/E2E test files were found.

## Runtime architecture

```text
main.tsx
  -> StrictMode
  -> ChunkErrorBoundary
  -> Redux Provider
  -> redux-persist PersistGate
  -> ThemeProvider
  -> RouterProvider
       -> App (global search + branding hooks)
       -> public/auth pages
       -> ProtectedRoute
            -> role-specific dashboard layout
            -> nested, mostly lazy-loaded feature pages

UI -> generated RTK Query hooks -> baseApi/adminApi -> backend REST APIs
UI -> Socket.IO -> notifications and support chat
UI -> local/session storage -> auth, theme, dashboard layouts, builder context
```

`App` itself is intentionally thin. It invokes global search and system-branding hooks, then renders the shared layout/outlet. Each portal owns a dashboard layout, header, sidebar, and nested route tree.

## User roles and active portals

`ProtectedRoute` reads the persisted Redux user, requires an access token, and checks the decoded role. Unauthenticated users go to `/login`; wrong roles go to `/unauthorized`.

- `CLIENT` -> `/client-panel`: overview, employees, programs, program/project builders, project details, project reviews, activity log, support/feedback/contact, settings, profile, notifications.
- `MANAGER` -> `/staff-manager-panel`: overview, projects, submissions, programs, project builder, reviews/approval, support, settings, profile, notifications.
- `EMPLOYEE` -> `/staff-employee-panel`: overview, assigned projects, upload submission, review/preview, files, settings, profile, notifications.
- `VIEWER` -> `/viewer-panel`: overview, projects, programs, project details, settings, profile, notifications.
- `SUPPORTER` is present in the role type but has no mounted portal.
- Admin pages and `getAdminRoutes()` exist, but `Routes.tsx` does not mount `AdminDashboardLayout` or the admin route tree. Admin is currently unreachable through the active router.

## Authentication and authorization

- Auth state is in `src/store/Slices/AuthSlice/authSlice.ts` and persisted under `persist:lawalx-auth` in browser local storage.
- Login/registration/password reset use RTK Query endpoints.
- JWTs are decoded client-side to populate `userId`, `clientId`, `employeeId`, `userEmail`, and `role`.
- There are two API/auth domains:
  - `baseApi` uses `VITE_API_BASE_URL` and the normal access/refresh tokens.
  - `adminApi` uses `VITE_API_ADMIN_URL` and admin access/refresh tokens.
- Both base queries attach `Authorization` and intercept HTTP 401. They call `/auth/refresh-token`, update Redux, then retry the original request; failed refresh logs the user out.
- Important interview caveat: frontend route guards improve UX but are not security boundaries. The backend must enforce tenant and role authorization on every endpoint.
- Risk: long-lived tokens are persisted in local storage, which increases exposure if an XSS bug exists. HttpOnly/Secure/SameSite cookies would reduce token theft risk.
- Risk: `setUser` logs the decoded token to the console and assumes token decoding succeeds.

## State and data flow

Redux store slices:

- `auth`: persisted identity/tokens.
- `form`: builder/form state.
- `file`: selected/uploaded file workflow state.
- `chartSlice`: dashboard/chart state and selection.
- `baseApi` and `adminApi`: RTK Query cache and request lifecycle.

RTK Query is the main server-state layer. There are 29 API files containing roughly 116 query declarations and 115 mutation declarations (including commented code in the raw count). Cache tags connect mutations to selective refetches—for example `Project`, `Program`, `Submission`, `Charts`, `Files`, `Favorite`, and `Notification`.

Typical flow:

1. A routed page reads IDs from URL params, navigation state, Redux, or session storage.
2. Generated RTK Query hooks fetch domain data.
3. Loading skeletons and error/empty states render during the request lifecycle.
4. Mutations update the backend and invalidate related tags.
5. RTK Query refetches affected queries, keeping screens synchronized.

Browser storage is also used for:

- theme selection;
- persisted auth via redux-persist;
- per-user/per-project dashboard layout and widget order;
- active project-details tab;
- project/program builder IDs across refreshes;
- one-time lazy-chunk reload recovery.

## Main domain model

The business hierarchy is approximately:

```text
Client / tenant
  -> users (client owners, managers, employees, viewers)
  -> programs
       -> projects
            -> charts/widgets and dashboard layout
            -> sheet/table data
            -> Gantt tasks/dependencies
            -> files/file groups
            -> submissions
                 -> review status/activity
            -> tags, deadlines, activity logs, RAID information
```

The frontend repeatedly uses `clientId`, `programId`, `projectId`, `submissionId`, `employeeId`, chart IDs, file-group IDs, and history IDs as routing/API context.

## Core features

### Program and project management

- Create programs and projects, edit metadata/status/tags, view summaries and assigned staff.
- Filter, search, paginate, favorite, and group programs/projects.
- Role-specific dashboards expose status cards, overdue work, upcoming deadlines, recent submissions, and activity.

### Configurable dashboard/chart builder

This is the most technically distinctive area.

- Users assemble project/program dashboards from configurable widgets.
- Widget definitions and layout are fetched from the API, edited locally, then persisted through chart/layout mutations.
- The dashboard restores unsaved layout/order from local storage and reconciles temporary widgets with server-created chart IDs.
- Widgets are lazy-loaded and isolated with a chart error boundary to keep one bad visualization from crashing the dashboard.
- Supported visualizations include line, area, stacked/horizontal/column bars, pie/donut, radar, scatter, bubble, histogram, Pareto, funnel, gauge, waterfall, candlestick, heat maps, calendar heat map, treemap, bullet, cohort, box plot, polar, geographic map, decomposition tree, matrix/data tables, RAG, progress ring, sparklines, project information, media, and Gantt.
- Templates can be created, listed, applied, and deleted for charts and program-builder layouts.
- Vite manually separates heavy chart, spreadsheet, PDF, mapping, animation, icon, and framework dependencies into vendor chunks.

### Project details workspace

Project details exposes lazy-loaded tabs:

- dashboard;
- sheet/data grid;
- Gantt;
- files;
- RAID log.

The sheet area supports spreadsheet-style editing and cell submission, Excel/CSV processing, chart-data uploads, IP/geolocation metadata, and role/submission-aware behavior. Gantt supports tasks and dependencies through multiple explored libraries and a custom implementation.

### Submission and review workflow

- Employees select a program/project, upload grouped files, preview them, and submit for review.
- Managers/clients inspect submission content, charts, sheets, Gantt, files, and RAID data through a shared review-details screen.
- Reviewers can approve/reject/update statuses, edit or delete submissions, and view reviewer activity/history.
- Cache invalidation links submission changes back to employee, manager, dashboard, chart, and review views.

### Files and exports

- Program/project file lists, file groups, uploads, previews, downloads, deletes, and review submission.
- PDF generation uses both `@react-pdf/renderer` and DOM capture (`html2canvas-pro` + jsPDF), depending on the workflow.
- CSV/Excel support uses SheetJS, Papa Parse, export-to-csv, and FileSaver.

### Real-time behavior

- A shared Socket.IO client authenticates with the access token and listens for notification events.
- Client support chat creates a separate authenticated socket, joins a ticket room, sends/receives messages, and emits/displays typing indicators.
- Notification APIs also provide list/read/read-all and per-role permission settings.
- The old notification context implementation is commented out; the active modal performs socket subscription directly.

### Maps and location

- Leaflet/React Leaflet and Google Maps packages are present.
- OpenStreetMap tiles and Nominatim geocoding/reverse-geocoding are used.
- Some submission/sheet workflows fetch the public IP address, likely for audit metadata.

## UI and styling

- Tailwind CSS v4 with CSS theme tokens in `src/index.css`.
- shadcn-style components backed by Radix primitives.
- Light/dark themes via `next-themes`, including a View Transitions API circular reveal animation.
- Responsive layouts, reusable tables/forms/modals, skeleton loading states, Sonner toasts, Lucide/React Icons, and Framer Motion.
- Branding is fetched through `useSystemBranding` and mapped into CSS/design tokens.

## Reliability and performance choices

- Route and heavy-widget lazy loading through `lazyWithRetry`.
- A chunk error boundary detects stale deployment chunks and reloads once using a session-storage guard, avoiding infinite reload loops.
- Vite manual chunking isolates large vendors and keeps PDF dependencies under native dynamic splitting due to prior initialization issues.
- RTK Query provides request deduplication, caching, invalidation, and generated loading/error state.
- Error boundaries isolate route/chunk and chart-rendering failures.
- Skeletons are used extensively to reduce layout shifts and communicate loading.
- Docker uses a Node 22.18 Alpine build stage and Nginx static serving on port 3000. Vercel and Netlify-style `_redirects` both provide SPA fallback to `index.html`.

## Major engineering risks / honest improvement list

1. **Case-only duplicated tree:** all 227 files under `Common` are duplicated under `common`. Consolidate to one canonical casing and enforce import casing in CI.
2. **No automated tests:** add a small Vitest/React Testing Library layer for auth refresh/guards and builder reducers/hooks, then Playwright smoke tests for each role's critical path.
3. **Admin route is disconnected:** either mount and protect it or remove/archive it to avoid false confidence.
4. **Very large components:** `CreateProject` (~1,786 lines), custom Gantt (~1,741), `SheetTab` (>1,100), review hook (~978), and headers are difficult to reason about. Split by cohesive behavior, not arbitrary size.
5. **Excessive `any` and inconsistent endpoint typing:** define API response/request contracts and use RTK Query generics to catch backend/frontend drift.
6. **Local-storage tokens:** prefer server-issued HttpOnly cookies if the backend can support them; otherwise strengthen CSP and XSS controls.
7. **Multiple overlapping libraries:** several chart and Gantt libraries raise bundle size, consistency, licensing, and maintenance costs. Standardize where feature coverage permits.
8. **Unused/prototype code in production source:** archive or remove it so search, linting, and bundle analysis reflect the active product.
9. **Inconsistent API paths/naming:** examples include `/chart` vs `/charts`, `programbuilder` vs `program-builder`, missing leading slashes, and `submitionId` spelling. Centralized typed contracts would help.
10. **Direct third-party fetches:** Nominatim, IPify, avatars, Unsplash, CDN Leaflet assets, and remote error imagery create privacy, availability, CSP, and rate-limit dependencies.
11. **Current checkout cannot be built locally:** `node_modules` exists but dependencies are absent; `npm run build` fails because `tsc` is not installed. Run `npm ci` before treating build status as a code failure.
12. **No meaningful commit history in this checkout:** only the current commit was visible, limiting architectural archaeology.

## Strong interview explanation of key decisions

### Why RTK Query?

It fits an API-heavy dashboard: generated hooks standardize loading/error states, caching avoids duplicate requests, tag invalidation keeps related screens consistent after mutations, and it integrates with the existing Redux identity and builder state.

### Why role-specific layouts and routes?

The roles share domain components but have different navigation and workflows. Separate route trees keep permissions/navigation explicit while shared pages—project details, review details, profile, notifications, and chart widgets—avoid reimplementation.

### Why lazy loading and custom chunk recovery?

The application ships many large visualization and document-processing libraries. Route/widget lazy loading reduces initial JavaScript. After a new deployment, a user can hold an old HTML page referencing deleted chunks; `lazyWithRetry` and the chunk boundary reload once to pick up the new manifest.

### Why persist only selected client state?

Auth survives refresh through redux-persist. Builder navigation context uses session storage because it should survive refresh but not necessarily a new browser session. Dashboard draft layouts use scoped local-storage keys so unsaved arrangements survive navigation while server data remains managed by RTK Query.

### Hardest likely feature

The dashboard builder: it coordinates drag/drop/resizing, dozens of heterogeneous lazy widgets, temporary and server IDs, per-project storage keys, local draft restoration, backend mutations, templates, role-specific read/edit modes, full-screen behavior, and export—while isolating chart failures.

### Example end-to-end workflow

1. Client creates a program and project.
2. The project/program IDs are preserved in route/session context.
3. Client adds and configures dashboard widgets and source data.
4. Chart mutations persist definitions; layout mutation persists positions/order.
5. Employee sees assigned work, uploads grouped files, and creates a submission.
6. Manager/client sees cache-refreshed review queues, opens the combined review workspace, and approves/rejects.
7. Submission/chart/dashboard tags invalidate, updating status cards and activity views.
8. Socket notifications inform connected users; exports provide offline PDF/CSV/Excel artifacts.

## Likely interview questions and concise answers

**What is the project?**  
A role-based SaaS frontend for program/project delivery, configurable analytics, employee submissions, review/approval, file management, scheduling, and collaboration.

**What did the frontend own?**  
Routing and role UX, client state, API caching and mutation flows, dashboard/widget configuration, rich data visualization, sheet/Gantt/file interfaces, exports, real-time notifications/chat, theming, and resilience around lazy deployments.

**How is state divided?**  
Server state is in RTK Query; cross-page client state is in small Redux slices; auth is persisted; temporary builder context uses session storage; dashboard drafts/layout preferences use scoped local storage; local component state handles transient UI.

**How does token refresh work?**  
The shared base query attaches the Redux token. On 401 it submits the refresh token, updates the access token, retries once, and logs out if refresh fails. A separate base API repeats the pattern for the admin service.

**How do mutations update the UI?**  
Each API domain declares cache tags. Mutations invalidate list/entity tags, and RTK Query automatically refetches subscribed queries.

**How is access controlled?**  
Route guards enforce logged-in and allowed-role navigation in the browser; backend authorization must remain authoritative.

**How did you manage bundle size?**  
Lazy route/widget imports, manual Vite vendor chunks for chart/state/router/maps/spreadsheet libraries, and native dynamic splitting for the problematic PDF dependency graph.

**What would you improve first?**  
Remove the exact `Common`/`common` duplicate tree, restore reproducible installs/CI, add critical-path tests, reconnect or delete admin routes, then type and split the highest-risk builder/sheet components.

**How would you test it?**  
Unit-test auth refresh and core layout/data transforms; component-test role guards and mutation states; integration-test RTK Query invalidation with mocked APIs; E2E-test login plus one create/submit/review path per role; add a production build and case-sensitive import check in CI.

**What is a scaling concern?**  
Large dashboard payloads and many concurrent widgets. Use pagination/aggregation server-side, lazy widget rendering, query deduplication, memoized transforms, virtualization for grids, and measure bundle/runtime costs before adding more libraries.

## Commands and environment

```bash
npm ci
npm run dev       # Vite dev server, configured for port 5174
npm run build     # TypeScript project build + Vite production build
npm run lint
npm run preview   # port 8080
npm run build:analyze
docker compose up --build  # static Nginx app on port 3000
```

Required frontend environment variables found in source:

- `VITE_API_BASE_URL`
- `VITE_API_ADMIN_URL`
- `VITE_SOCKET_URL`

## Verification status

- Static repository analysis: completed across file inventory, routes, stores, APIs, feature areas, build/deploy configuration, browser storage, sockets, and duplicates.
- Production build: attempted, but the checkout's dependency installation is empty/incomplete (`npm ls` reports all direct packages missing), so `tsc` cannot start.
- No source files were changed other than adding this brief.

