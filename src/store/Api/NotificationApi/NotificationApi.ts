import baseApi from "../BaseApi/BaseApi";

// ─── Payload types ────────────────────────────────────────────────────────────

export interface NotificationPermissions {
  id?: string;
  userId?: string;
  // CLIENT / shared
  onProjectApproval?: boolean;
  onProjectRejection?: boolean;
  fileImportByEmployees?: boolean;
  weeklySummary?: boolean;
  storageLimit?: boolean;
  billPayment?: boolean;
  overdueProject?: boolean;
  // EMPLOYEE only
  returnProject?: boolean;
  assignNewProject?: boolean;
  projectPublish?: boolean;
  // MANAGER only
  createNewProject?: boolean;
  submittedProject?: boolean;
  // VIEWER only
  projectAdd?: boolean;
  projectRemove?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const notificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Fetch received notifications ──────────────────────────────────────
    getNotifications: builder.query<any, void>({
      query: () => "notification/received",
      providesTags: ["Notification"],
    }),

    // ── Mark single notification as read ─────────────────────────────────
    updateNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ── Mark all as read ─────────────────────────────────────────────────
    readAllNotification: builder.mutation<any, void>({
      query: () => ({
        url: `notification/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ── Fetch current user's permission settings ──────────────────────────
    getNotificationPermissions: builder.query<{ data: NotificationPermissions }, void>({
      query: () => "notification/permissions",
      providesTags: ["NotificationPermissions"],
    }),

    // ── Update CLIENT permissions ─────────────────────────────────────────
    updateNotificationPermissionsClient: builder.mutation<any, Partial<NotificationPermissions>>({
      query: (data) => ({
        url: "notification/client",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── Update EMPLOYEE permissions ───────────────────────────────────────
    updateNotificationPermissionsEmployee: builder.mutation<any, Partial<NotificationPermissions>>({
      query: (data) => ({
        url: "notification/employee",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),

    // ── Update MANAGER permissions ────────────────────────────────────────
    updateNotificationPermissionsManager: builder.mutation<any, Partial<NotificationPermissions>>({
      query: (data) => ({
        url: "notification/manager",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),
    // ── Update VIEWER permissions ─────────────────────────────────────────
    updateNotificationPermissionsViewer: builder.mutation<any, Partial<NotificationPermissions>>({
      query: (data) => ({
        url: "notification/viewer",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationPermissions"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useUpdateNotificationMutation,
  useReadAllNotificationMutation,
  useGetNotificationPermissionsQuery,
  useUpdateNotificationPermissionsClientMutation,
  useUpdateNotificationPermissionsEmployeeMutation,
  useUpdateNotificationPermissionsManagerMutation,
  useUpdateNotificationPermissionsViewerMutation,
} = notificationApi;

export default notificationApi;