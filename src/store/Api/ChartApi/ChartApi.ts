import baseApi from "../BaseApi/BaseApi";

const chartApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createChart: builder.mutation({
      query: (data) => ({
        url: "/chart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Charts", "ChartHistory"],
    }),
    getActiveInChart: builder.query({
      query: () => ({
        url: "/chart/activeInChart",
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    getActiveChart: builder.query({
      query: () => ({
        url: "/chart/activeChart",
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    getChartByProjectId: builder.query({
      query: (id) => ({
        url: `/charts/project/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    updateChartConfig: builder.mutation({
      query: ({ id, data }) => ({
        url: `/chart/${id}/update-all`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Charts", "Submission"],
    }),
    getChartById: builder.query({
      query: (id) => ({
        url: `/chart/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    findChildrenValue: builder.query({
      query: (id) => ({
        url: `chart/findChildrenValue/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts", "ChartHistory"],
    }),
    updateChartValue: builder.mutation({
      query: (id) => ({
        url: `/updateChartValue/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Charts", "Submission"],
    }),
    allChartHistory: builder.query({
      query: (id) => ({
        url: `/chart/all-chart-history/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    updateBulkProgramChart: builder.mutation({
      query: (data) => ({
        url: `/programbuilder/bulk-update`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Charts", "Submission"],
    }),
    getRootChart: builder.query({
      query: (arg: string | { id: string; startDate?: string; asOf?: string; page?: number; limit?: number }) => {
        if (typeof arg === "string") {
          return {
            url: `/chart/root/${arg}`,
            method: "GET",
          };
        }
        const { id, startDate, asOf, page, limit } = arg;
        const params: Record<string, any> = {};
        if (startDate) params.startDate = startDate;
        if (asOf) params.asOf = asOf;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        return {
          url: `/chart/root/${id}`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Charts"],
    }),
    getAllTheLeafChart: builder.query({
      query: (projectId: string) => ({
        url: `/chart/onlylevechildren/${projectId}`,
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    uploadChartData: builder.mutation({
      query: (data) => ({
        url: `/chart/bulk/value-change`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Charts", "Submission"],
    }),
    createProgramChart: builder.mutation({
      query: (data) => {
        return {
          url: `/programBuilder`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Charts"],
    }),
    getProgramBuilderChart: builder.query({
      query: (id: string) => ({
        url: `/programbuilder/program-builder/program/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts"],
    }),
    updateProgramCharts: builder.mutation({
      query: ({ id, data }) => ({
        url: `/program-builder/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Charts"],
    }),
    getProjectInformationTable: builder.query({
      query: (id: string) => ({
        url: `/project-information-table/${id}`,
        method: "GET",
      }),
      providesTags: ["Charts", "Table"],
    }),
    createProjectInformationTable: builder.mutation({
      query: (data) => ({
        url: `/project-information-table`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Charts", "Table"],
    }),
    updateProjectInformationTable: builder.mutation({
      query: ({ id, data }) => {
        const { projectId, ...rest } = data;
        return {
          url: `/project-information-table/${id}`,
          method: "PATCH",
          body: rest,
        };
      },
      invalidatesTags: ["Charts", "Table"],
    }),
    deleteProjectInformationTable: builder.mutation({
      query: (id: string) => ({
        url: `/project-information-table/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Charts", "Table"],
    }),
    deleteChart: builder.mutation({
      query: (id: string) => ({
        url: `/chart/soft-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Charts"],
    }),
    deleteProgramChart: builder.mutation({
      query: (id: string) => ({
        url: `/programbuilder/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Charts"],
    }),
    restoreChartHistory: builder.mutation({
      query: ({ historyId, chartId }) => ({
        url: `/chart/restore-history/${historyId}/${chartId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Charts"],
    }),
    layoutUpdate: builder.mutation({
      query: (data) => ({
        url: `/chart/bulk/layout`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Charts"],
    }),
  }),
});

export const {
  useCreateChartMutation,
  useGetActiveInChartQuery,
  useGetActiveChartQuery,
  useAllChartHistoryQuery,
  useGetChartByIdQuery,
  useLazyGetChartByIdQuery,
  useGetChartByProjectIdQuery,
  useLayoutUpdateMutation,
  useLazyGetChartByProjectIdQuery,
  useGetRootChartQuery,
  useLazyGetRootChartQuery,
  useFindChildrenValueQuery,
  useLazyFindChildrenValueQuery,
  useGetAllTheLeafChartQuery,
  useLazyGetAllTheLeafChartQuery,
  useUploadChartDataMutation,
  useCreateProgramChartMutation,
  useGetProgramBuilderChartQuery,
  useUpdateProgramChartsMutation,
  useLazyGetProgramBuilderChartQuery,
  useGetProjectInformationTableQuery,
  useCreateProjectInformationTableMutation,
  useUpdateProjectInformationTableMutation,
  useDeleteProjectInformationTableMutation,
  useDeleteProgramChartMutation,
  useRestoreChartHistoryMutation,
  useDeleteChartMutation,
  useUpdateBulkProgramChartMutation,
  useUpdateChartConfigMutation,
} = chartApi;
export default chartApi;
