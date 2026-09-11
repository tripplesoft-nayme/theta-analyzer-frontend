import baseApi from "../BaseApi/BaseApi";

export interface ISystemConfig {
  id: string;
  remoteClientId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  subdomain: string;
  region: string;
  timeZone: string;
  language: string;
  subscriptionPlan: string;
  isActive: boolean;
  lastSyncAt: string;
}

export interface ISystemConfigResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISystemConfig;
}

// ─── Notification Permissions ─────────────────────────────────────────────────
export interface INotificationPermissions {
  id: string;
  userId: string;
  // Shared
  onProjectApproval: boolean;
  onProjectRejection: boolean;
  weeklySummary: boolean;
  storageLimit: boolean;
  billPayment: boolean;
  overdueProject: boolean;
  // Client-only
  fileImportByEmployees?: boolean;
  // Employee-only
  returnProject?: boolean;
  assignNewProject?: boolean;
  projectPublish?: boolean;
  // Manager-only
  createNewProject?: boolean;
  submittedProject?: boolean;
  // Viewer-only
  projectAdd?: boolean;
  projectRemove?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPermissionsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: INotificationPermissions;
}

// ─── Role-specific update DTOs ────────────────────────────────────────────────
export interface IClientNotificationDto {
  onProjectApproval?: boolean;
  onProjectRejection?: boolean;
  fileImportByEmployees?: boolean;
  weeklySummary?: boolean;
  storageLimit?: boolean;
  billPayment?: boolean;
  overdueProject?: boolean;
}

export interface IEmployeeNotificationDto {
  returnProject?: boolean;
  assignNewProject?: boolean;
  projectPublish?: boolean;
  onProjectApproval?: boolean;
  onProjectRejection?: boolean;
  weeklySummary?: boolean;
  storageLimit?: boolean;
  billPayment?: boolean;
  overdueProject?: boolean;
}

export interface IManagerNotificationDto {
  fileImportByEmployees?: boolean;
  weeklySummary?: boolean;
  createNewProject?: boolean;
  submittedProject?: boolean;
  onProjectApproval?: boolean;
  onProjectRejection?: boolean;
  storageLimit?: boolean;
  billPayment?: boolean;
  overdueProject?: boolean;
}

export interface IViewerNotificationDto {
  weeklySummary?: boolean;
  projectAdd?: boolean;
  projectRemove?: boolean;
}

const settingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Notification permissions (GET) ────────────────────────────────────────
    getNotificationPermissions: builder.query<INotificationPermissionsResponse, void>({
      query: () => "/notification/permissions",
      providesTags: ["NotificationPermissions"],
    }),

    // ── Client (PATCH) ────────────────────────────────────────────────────────
    updateNotificationClient: builder.mutation<INotificationPermissionsResponse, IClientNotificationDto>({
      query: (data) => ({
        url: "/notification/client",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── Employee (PATCH) ──────────────────────────────────────────────────────
    updateNotificationEmployee: builder.mutation<INotificationPermissionsResponse, IEmployeeNotificationDto>({
      query: (data) => ({
        url: "/notification/employee",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── Manager (PATCH) ───────────────────────────────────────────────────────
    updateNotificationManager: builder.mutation<INotificationPermissionsResponse, IManagerNotificationDto>({
      query: (data) => ({
        url: "/notification/manager",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── Viewer (PATCH) ────────────────────────────────────────────────────────
    updateNotificationViewer: builder.mutation<INotificationPermissionsResponse, IViewerNotificationDto>({
      query: (data) => ({
        url: "/notification/viewer",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── System Config (GET) ───────────────────────────────────────────────────
    getSystemConfig: builder.query<ISystemConfigResponse, void>({
      query: () => "/system-config",
      providesTags: ["SystemConfig"],
    }),
  }),
});

export const {
  useGetNotificationPermissionsQuery,
  useUpdateNotificationClientMutation,
  useUpdateNotificationEmployeeMutation,
  useUpdateNotificationManagerMutation,
  useUpdateNotificationViewerMutation,
  useGetSystemConfigQuery,
} = settingsApi;
export default settingsApi;
