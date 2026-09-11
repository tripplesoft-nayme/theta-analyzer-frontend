import baseApi from "../BaseApi/BaseApi";

const chartTemplate = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createATemplate: builder.mutation({
      query: (data) => ({
        url: "/chart-template/create-a-template",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Template", id: "LIST" }],
    }),
    applyTemplate: builder.mutation({
      query: (data) => ({
        url: "/chart-template/apply-template",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Charts", { type: "Template", id: "LIST" }],
    }),
    myTemplates: builder.query({
      query: () => ({
        url: "/chart-template/my-templates",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: any) => ({
                type: "Template" as const,
                id,
              })),
              { type: "Template", id: "LIST" },
            ]
          : [{ type: "Template", id: "LIST" }],
    }),
    applyProgramBuilderTemplate: builder.mutation({
      query: (data) => ({
        url: "/programbuilder-templates/apply-template",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Charts", { type: "Template", id: "LIST" }],
    }),
    createProgramBuilderTemplate: builder.mutation({
      query: ({ clientId, ...data }) => ({
        url: `/programbuilder-templates/${clientId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Template", id: "LIST" }],
    }),
    
    getAllProgramBuilderTemplates: builder.query({
      query: () => "/programbuilder-templates/all",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: any) => ({
                type: "Template" as const,
                id,
              })),
              { type: "Template", id: "LIST" },
            ]
          : [{ type: "Template", id: "LIST" }],
    }),
    getProgramBuilderTemplatesByOwner: builder.query({
      query: (ownerId) => `/programbuilder-templates/owner/${ownerId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: any) => ({
                type: "Template" as const,
                id,
              })),
              { type: "Template", id: "LIST" },
            ]
          : [{ type: "Template", id: "LIST" }],
    }),
    getSingleProgramBuilderTemplate: builder.query({
      query: (id) => `/programbuilder-templates/single/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Template", id }],
    }),
    deleteProgramBuilderTemplate: builder.mutation({
      query: (id) => ({
        url: `/programbuilder-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Template", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateATemplateMutation,
  useApplyTemplateMutation,
  useMyTemplatesQuery,
  useApplyProgramBuilderTemplateMutation,
  useCreateProgramBuilderTemplateMutation,
  useGetAllProgramBuilderTemplatesQuery,
  useGetProgramBuilderTemplatesByOwnerQuery,
  useGetSingleProgramBuilderTemplateQuery,
  useDeleteProgramBuilderTemplateMutation,
} = chartTemplate;
