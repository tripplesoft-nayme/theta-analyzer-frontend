/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const ganttChartApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGanttChartById: builder.query({
      query: (id: string) => ({
        url: `/chart/gantt/${id}`,
        method: "GET",
      }),
      providesTags: ["GanttChart"],
    }),
    updateGanttChartById: builder.mutation({
      query: (data: { id: string; data: any }) => ({
        url: `/chart/gantt/${data.id}`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["GanttChart"],
    }),
    createGanttChart: builder.mutation({
      query: (data: any) => ({
        url: `/chart/gantt`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GanttChart"],
    }),
    deleteGanttChart: builder.mutation({
      query: (id: string) => ({
        url: `/chart/gantt/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GanttChart"],
    }),
  }),
});

export const {
  useGetGanttChartByIdQuery,
  useUpdateGanttChartByIdMutation,
  useCreateGanttChartMutation,
  useDeleteGanttChartMutation,
} = ganttChartApi;
export default ganttChartApi;
