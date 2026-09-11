/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const clientDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOverviewStack: builder.query({
      query: () => "/client-dashboard/overview-stack",
      providesTags: ["Dashboard", "Submission", "ClientStats", { type: "ClientStats", id: "LIST" }],
    }),

    getEmployeeActivity: builder.query({
      query: () => "/client-dashboard/employee-activity",
      providesTags: ["Dashboard"],
    }),

    getTimeline: builder.query({
      query: ({ programId }: { programId: string }) => ({
        url: `/client-dashboard/timeline?programId=${programId}`,
        method: "GET",
      }),
      providesTags: ["Dashboard", "Timeline"],
    }),

    getStatus: builder.query({
      query: ({ period }: { period: string }) =>
        `/client-dashboard/status?period=${period}`,
      providesTags: ["Dashboard"],
    }),

    getOverdue: builder.query({
      query: () => "/client-dashboard/overdue",
      providesTags: ["Dashboard", "Overdue"],
    }),

    getDeadline: builder.query({
      query: (args?: { startDate?: string; endDate?: string }) => {
        const params = new URLSearchParams();
        if (args?.startDate) params.set("startDate", args.startDate);
        if (args?.endDate) params.set("endDate", args.endDate);
        return {
          url: "/client-dashboard/upcoming-deadline",
          method: "GET",
          params,
        };
      },
      providesTags: ["Dashboard"],
    }),
    getAllSubmission: builder.query({
      query: (args: any) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            params.set(key, value as string);
          }
        });
        return {
          url: "/client-dashboard/all-submissions",
          method: "GET",
          params,
        };
      },
      providesTags: ["Dashboard", "Submission"],
    }),

    getSubmissionsStats: builder.query({
      query: () => "/client-dashboard/submissions-stats",
      providesTags: ["Dashboard", "Submission", { type: "Submission", id: "LIST" }],
    }),
    getDashboardReviewActivity: builder.query({
      query: () => "/client-dashboard/activity",
      providesTags: ["Dashboard", "Submission"],
    }),
  }),
});

export const {
  useGetOverviewStackQuery,
  useGetEmployeeActivityQuery,
  useGetTimelineQuery,
  useLazyGetTimelineQuery,
  useGetStatusQuery,
  useGetOverdueQuery,
  useGetDeadlineQuery,
  useGetAllSubmissionQuery,
  useGetDashboardReviewActivityQuery,
  useGetSubmissionsStatsQuery,
} = clientDashboardApi;
export default clientDashboardApi;
