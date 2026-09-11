import { IProgram } from "@/types";
import baseApi from "../BaseApi/BaseApi";
const programApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createProgram: builder.mutation({
      query: (data) => ({
        url: "/program",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Program", id: "LIST" },
        { type: "ClientStats", id: "LIST" },
        { type: "Timeline", id: "LIST" },
      ],
    }),

    getAllProgram: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: "/program/all",
          method: "GET",
          params,
        };
      },
      providesTags: (result) =>
        result?.data?.data
          ? [
            ...result.data.data.map((program: IProgram) => ({
              type: "Program",
              id: program.id,
            })),
            { type: "Program", id: "LIST" },
          ]
          : [{ type: "Program", id: "LIST" }],
    }),

    getProgramById: builder.query({
      query: (id) => {
        return {
          url: `/program/${id}`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Program", id }],
    }),

    getProjectsByProgramId: builder.query({
      query: ({ programId, args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: `/program/${programId}/projects`,
          method: "GET",
          params,
        };
      },
      providesTags: (_result, _error, programId) => [
        { type: "Project", id: "LIST" },
        { type: "Program", id: "LIST" },
        { type: "Program", id: programId },
      ],
    }),

    updateProgramName: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/program/${id}/name`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Program", id },
        { type: "Program", id: "LIST" },
      ],
    }),
    updateProgramById: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/program/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Program", id },
        { type: "Program", id: "LIST" },
      ],
    }),
    getChartTitleId: builder.mutation({
      query: (bodyData) => ({
        url: `/chart`,
        method: "POST",
        body: bodyData,
      }),
    }),
    // getStackBarChartCSVfilesTitleId: builder.query({
    //   query: () => `/charts/stack-bar-chart`,
    // }),
    // getHeatmapChartCSVfilesTitleId: builder.query({
    //   query: () => `/charts/heat-map-chart`,
    // }),
    // getMultiAxisLineChartCSVfilesTitleId: builder.query({
    //   query: () => `/charts/multi-axis-line-chart`,
    // }),
    getProgramOverview: builder.query({
      query: (id) => {
        return {
          url: `/program/${id}/overview`,
          method: "GET",
        };
      },
      providesTags: (_result, _error, id) => [
        { type: "ProgramOverview", id },
        { type: "ProgramOverview", id: "LIST" },
        "ProgramOverview",
      ],
    }),
    createTags: builder.mutation({
      query: (bodyData) => ({
        url: `/tags`,
        method: "POST",
        body: bodyData,
      }),
      invalidatesTags: ["Tags"],
    }),
    getAllTags: builder.query({
      query: (programId) => `/tags/program/${programId}`,
      providesTags: ["Tags"],
    }),
  }),
});
export const {
  useCreateProgramMutation,
  useGetAllProgramQuery,
  useGetProgramByIdQuery,
  useGetProjectsByProgramIdQuery,
  useLazyGetProjectsByProgramIdQuery,
  useUpdateProgramNameMutation,
  useGetChartTitleIdMutation,
  useUpdateProgramByIdMutation,
  // useGetStackBarChartCSVfilesTitleIdQuery,
  // useGetHeatmapChartCSVfilesTitleIdQuery,
  // useGetMultiAxisLineChartCSVfilesTitleIdQuery,
  useCreateTagsMutation,
  useGetAllTagsQuery,
  useGetProgramOverviewQuery,
} = programApi;

export default programApi;
