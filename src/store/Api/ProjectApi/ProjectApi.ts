/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import baseApi from "../BaseApi/BaseApi";

const projectApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createProject: builder.mutation({
      query: ({ message, ...data }) => {
        console.log(data, "data");
        return { url: "/project", method: "POST", body: data };
      },
      invalidatesTags: (_res, _err, { programId }) => [
        { type: "Program", id: programId },
        { type: "Project", id: "LIST" },
        { type: "ClientStats", id: "LIST" },
        { type: "Timeline", id: "LIST" },
        { type: "ProgramOverview", id: programId },
      ],
    }),

    getAllProjects: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: "/project",
          method: "GET",
          params,
        };
      },
      providesTags: [
        { type: "Project", id: "LIST" },
        { type: "Manager", id: "LIST" },
        { type: "Employee", id: "LIST" },
      ],
    }),

    searchProjects: builder.query({
      query: (searchTerm) => ({
        url: "/project/search",
        method: "GET",
        params: { name: searchTerm },
      }),
      providesTags: [{ type: "Project", id: "LIST" }],
    }),

    getProjectById: builder.query({
      query: (id) => ({
        url: `/project/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [
        { type: "Project", id },
        { type: "Manager", id },
        { type: "Project", id: "LIST" },
        { type: "Manager", id: "LIST" },
      ],
    }),

    updateProject: builder.mutation({
      query: ({ id, ...project }) => ({
        url: `/project/${id}`,
        method: "PATCH",
        body: project,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        { type: "Manager", id: "LIST" },
        { type: "Overdue", id: "LIST" },
        { type: "ClientStats", id: "LIST" },
        { type: "Timeline", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Project", id: "LIST" },
        { type: "ClientStats", id: "LIST" },
        { type: "Timeline", id: "LIST" },
        { type: "ProgramOverview", id: "LIST" },
      ],
    }),

    getProjectSheets: builder.query({
      query: (id) => ({
        url: `/project/${id}/sheets`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Project", id }],
    }),

    updateProjectStatus: builder.mutation({
      query: (data) => ({
        url: "/project/status",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, data) => {
        const tags: any[] = [
          { type: "Project" as const, id: "LIST" },
          { type: "Manager" as const, id: "LIST" },
          { type: "ClientStats" as const, id: "LIST" },
          { type: "ProgramOverview" as const, id: "LIST" },
        ];
        if (data?.projectId) {
          tags.push({ type: "Project" as const, id: data.projectId });
          tags.push({ type: "Manager" as const, id: data.projectId });
          tags.push({ type: "ClientStats" as const, id: data.projectId });
        }
        return tags;
      },
    }),
    getProjectTags: builder.query({
      query: () => ({
        url: `/project/statuses`,
        method: "GET",
      }),
      providesTags: [{ type: "Project", id: "LIST" }],
    }),
    createProjectTag: builder.mutation({
      query: (data) => ({
        url: `project/statuses`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    deleteProjectTag: builder.mutation({
      query: ({ id, status }) => ({
        url: `project/${id}/statuses/${status}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    getViewerAssignedProjects: builder.query({
      query: ({ programId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (programId) params.append("programId", programId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return {
          url: "/project/viewer/assigned",
          method: "GET",
          params,
        };
      },
      providesTags: [{ type: "Project", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetAllProjectsQuery,
  useLazyGetAllProjectsQuery,
  useSearchProjectsQuery,
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectSheetsQuery,
  useUpdateProjectStatusMutation,
  useGetProjectTagsQuery,
  useCreateProjectTagMutation,
  useDeleteProjectTagMutation,
  useGetViewerAssignedProjectsQuery,
  useLazyGetViewerAssignedProjectsQuery,
} = projectApi;

export default projectApi;
