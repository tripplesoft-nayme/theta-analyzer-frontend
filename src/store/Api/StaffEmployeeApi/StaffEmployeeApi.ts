/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const staffEmployeeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStaffEmployeeOverviewCards: builder.query({
      query: () => ({
        url: `/employeeDashboard/dashboard`,
        method: "GET",
      }),
      providesTags: ["Employee", "Submission", { type: "Employee", id: "LIST" }, { type: "Submission", id: "LIST" }],
    }),
    getStaffEmployeeTopOverDue: builder.query({
      query: () => ({
        url: `/employeeDashboard/projects/top-overdue`,
        method: "GET",
      }),
      providesTags: ["Employee"],
    }),
    getStaffEmployeeUpcomingDeadlines: builder.query({
      query: (params) => ({
        url: "/employeeDashboard/projects/upcoming-deadlines",
        method: "GET",
        params,
      }),
      providesTags: ["Employee"],
    }),
    getStaffEmployeeLatestSubmissions: builder.query({
      query: (query) => {
        const searchParams = new URLSearchParams();

        Object.keys(query).forEach((key) => {
          if (
            query[key] !== undefined &&
            query[key] !== null &&
            query[key] !== ""
          ) {
            searchParams.append(key, query[key].toString());
          }
        });

        return {
          url: `/submitted`,
          method: "GET",
          params: searchParams,
        };
      },
      providesTags: ["Employee", "Submission"],
    }),
    getStaffEmployeeSubmissionStatus: builder.query({
      query: () => ({
        url: `/employeeDashboard/submission-status`,
        method: "GET",
      }),
      providesTags: ["Employee", "Submission", { type: "Employee", id: "LIST" }, { type: "Submission", id: "LIST" }],
    }),
    getFavoriteProjects: builder.query<any, void>({
      query: () => `/favorites-project/me`,
      providesTags: ["Employee"],
    }),
    addToFavouriteProject: builder.mutation<any, string>({
      query: (projectId) => ({
        url: `/favorites-project`,
        method: "POST",
        body: { projectId },
      }),
      invalidatesTags: ["Employee"],
    }),
    removeFavouriteProject: builder.mutation({
      query: (projectId) => ({
        url: "/favorites-project",
        method: "DELETE",
        body: { projectId: projectId },
      }),
      invalidatesTags: ["Employee"],
    }),
    getNotifications: builder.query({
      query: () => `/notification/received`,
    }),
    getEmployeeAllProjects: builder.query({
      query: (params) => ({
        url: "/project",
        method: "GET",
        params,
      }),
      providesTags: ["Employee"],
    }),
    getAllEmployeeSubmissions: builder.query({
      query: (params) => ({
        url: "/submitted/all",
        method: "GET",
        params,
      }),
      providesTags: ["Employee", "Submission"],
    }),
    createEmployeeSubmission: builder.mutation<
      any,
      {
        information: string;
        submission: string;
        projectId: string;
        ipAddress?: string;
        status?: string;
        elements: {
          chartId: string;
          xAxis: string;
          yAxis: string;
          zAxis: string;
        }[];
      }
    >({
      query: (data) => ({
        url: `/submitted`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Employee", "Submission"],
    }),
    deleteEmployeeSubmission: builder.mutation<any, string>({
      query: (id) => ({
        url: `/submitted/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee", "Submission"],
    }),
    getSubmissionPreview: builder.query({
      query: ({ submittedId, projectId }) => ({
        url: `/submitted/submittedpreviews/${submittedId}/${projectId}`,
        method: "GET",
      }),
      providesTags: ["Submission"],
    }),
    getEmployeeSubmissionById: builder.query({
      query: (id: string) => ({
        url: `/submitted/${id}`,
        method: "GET",
      }),
      providesTags: ["Submission"],
    }),
    updateEmployeeStatus: builder.mutation({
      query: (data) => ({
        url: `/submitted/${data.submitionId}/employee-status`,
        method: "PATCH",
        body: { status: data.status, information: data.information },
      }),
      invalidatesTags: ["Employee", "Submission"],
    }),
    updateEmployeeSubmissionData: builder.mutation({
      query: (data) => ({
        url: `/submitted/${data.submitionId}/axis-data`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["Employee", "Submission"],
    }),
    getEmployeeDashboardActivity: builder.query({
      query: () => ({
        url: `/employeeDashboard/activity`,
        method: "GET",
      }),
      providesTags: ["Employee", "Submission"],
    }),
  }),
});

export const {
  useGetStaffEmployeeOverviewCardsQuery,
  useGetStaffEmployeeTopOverDueQuery,
  useGetStaffEmployeeUpcomingDeadlinesQuery,
  useGetStaffEmployeeLatestSubmissionsQuery,
  useGetStaffEmployeeSubmissionStatusQuery,
  useGetFavoriteProjectsQuery,
  useAddToFavouriteProjectMutation,
  useRemoveFavouriteProjectMutation,
  useGetNotificationsQuery,
  useGetEmployeeAllProjectsQuery,
  useCreateEmployeeSubmissionMutation,
  useGetAllEmployeeSubmissionsQuery,
  useDeleteEmployeeSubmissionMutation,
  useGetSubmissionPreviewQuery,
  useUpdateEmployeeStatusMutation,
  useUpdateEmployeeSubmissionDataMutation,
  useGetEmployeeSubmissionByIdQuery,
  useGetEmployeeDashboardActivityQuery,
} = staffEmployeeApi;

export default staffEmployeeApi;
