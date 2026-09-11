/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStaffEmpStateCarts: builder.query({
      query: () => `/manager/dashboard`,
      providesTags: ["Manager", "Submission"],
    }),
    getTopOverdueProjects: builder.query({
      query: () => `/manager/projects/top-overdue`,
      providesTags: ["Manager"],
    }),
    getSubmissionStatus: builder.query({
      query: (params) => {
        return {
          url: `/manager/submission-status`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Manager"],
    }),
    getAllManagerPrograms: builder.query({
      query: (params) => ({
        url: "/manager/program",
        method: "GET",
        params,
      }),
      providesTags: ["Manager"],
    }),
    getAllManagerProgramsForProgramPage: builder.query({
      query: (params) => ({
        url: "/program/all",
        method: "GET",
        params,
      }),
      providesTags: ["Manager"],
    }),
    getUpcomingDeadlines: builder.query({
      query: (params) => ({
        url: "/manager/projects/upcoming-deadlines",
        method: "GET",
        params,
      }),
      providesTags: ["Manager"],
    }),
    getAllActivityLogs: builder.query({
      query: (params) => ({
        url: "/activities",
        method: "GET",
        params,
      }),
      providesTags: ["Manager"],
    }),
    getAllLatestSubmissions: builder.query({
      query: (params) => ({
        url: "/submitted/all",
        method: "GET",
        params,
      }),
      providesTags: ["Manager", "Submission"],
    }),
    // getAllLatestSubmissions: builder.query({
    //   query: (params) => ({
    //     url: "/manager/all-manager-submission",
    //     method: "GET",
    //     params,
    //   }),
    //   providesTags: ["Manager"],
    // }),
    deleteManagerProject: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/project/manager-project-softdelete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manager"],
    }),
    // for project page
    getProjectPageStateCarts: builder.query({
      query: () => `/manager/project-dashboard`,
      providesTags: ["Manager", "Submission"],
    }),
    getProgramAllProjects: builder.query({
      query: (params) => ({
        url: "/project",
        method: "GET",
        params,
      }),
      providesTags: ["Manager"],
    }),
    getManagerProgramOverview: builder.query({
      query: (id: string) => ({
        url: `/manager/program/${id}/overview`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        "Manager",
        "ProgramOverview",
        { type: "Manager", id: "LIST" },
        { type: "Manager", id },
        { type: "ProgramOverview", id: "LIST" },
        { type: "ProgramOverview", id },
      ],
    }),
    // for program review
    getProjectReviewPageCards: builder.query({
      query: () => `/manager/overview`,
      providesTags: [
        "Manager",
        "Submission",
        "ReviewActivity",
        { type: "Manager", id: "LIST" },
        { type: "Submission", id: "LIST" },
      ],
    }),
    getAllReviewProjects: builder.query({
      query: (params) => ({
        url: "/manager/submissions",
        method: "GET",
        params,
      }),
      providesTags: ["Manager", "Submission"],
    }),
    getAllReviewProjectsReviewerActivity: builder.query({
      query: () => `/manager/activity`,
      providesTags: ["Manager", "Submission"],
    }),
    editSubmission: builder.mutation<
      any,
      { submissionId: string; action: string }
    >({
      query: ({ submissionId, action }) => ({
        url: `/manager/${submissionId}/status`,
        method: "PATCH",
        body: { status: action },
      }),
      invalidatesTags: ["Manager", "Submission", "ReviewActivity"],
    }),
    deleteSubmission: builder.mutation<any, { submissionId: string }>({
      query: ({ submissionId }) => ({
        url: `/manager/${submissionId}/delete-submission`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manager", "Submission"],
    }),
    // for favorite projects
    getFavoriteProjects: builder.query<any, void>({
      query: () => `/favorites-project/me`,
      providesTags: ["Manager", "Favorite"],
    }),
    addProjectToFavorite: builder.mutation<any, { projectId: string }>({
      query: (body) => ({
        url: `/favorites-project`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Manager", "Favorite"],
    }),
    removeProjectFromFavorite: builder.mutation({
      query: (projectId) => ({
        url: "/favorites-project",
        method: "DELETE",
        body: { projectId: projectId },
      }),
      invalidatesTags: ["Manager", "Favorite"],
    }),
    // for notification
    getNotification: builder.query<any, void>({
      query: () => `/notification/received`,
      providesTags: ["Manager"],
    }),
    // for global search
    getGlobalSearchItems: builder.query({
      query: (searchText) => ({
        url: "/manager/global-search",
        method: "GET",
        params: { query: searchText },
      }),
      providesTags: ["Manager"],
    }),
    createSubmission: builder.mutation<
      any,
      {
        information: string;
        submission: string;
        projectId: string;
        ipAddress?: string;
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
      invalidatesTags: ["Manager", "Employee", "Submission"],
    }),
    updateSubmissionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/submitted/${id}/status`,
        method: "PATCH",
        body: status,
      }),
      invalidatesTags: ["Submission", "Charts", "ReviewActivity"],
    }),
  }),
});

export const {
  useGetStaffEmpStateCartsQuery,
  useGetTopOverdueProjectsQuery,
  useGetSubmissionStatusQuery,
  useGetAllManagerProgramsQuery,
  useGetAllManagerProgramsForProgramPageQuery,
  useGetUpcomingDeadlinesQuery,
  useGetAllActivityLogsQuery,
  useGetAllLatestSubmissionsQuery,
  useDeleteManagerProjectMutation,
  useGetProjectPageStateCartsQuery,
  useGetProgramAllProjectsQuery,
  useGetManagerProgramOverviewQuery,
  useGetProjectReviewPageCardsQuery,
  useGetAllReviewProjectsQuery,
  useGetAllReviewProjectsReviewerActivityQuery,
  useEditSubmissionMutation,
  useDeleteSubmissionMutation,
  useGetFavoriteProjectsQuery,
  useAddProjectToFavoriteMutation,
  useRemoveProjectFromFavoriteMutation,
  useGetNotificationQuery,
  useGetGlobalSearchItemsQuery,
  useCreateSubmissionMutation,
  useUpdateSubmissionStatusMutation,
} = userApi;

export default userApi;
