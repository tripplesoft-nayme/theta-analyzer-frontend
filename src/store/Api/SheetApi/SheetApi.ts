import baseApi from "../BaseApi/BaseApi";

const sheetApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadSheet: builder.mutation({
      query: (data) => ({
        url: "/sheet/submit-cell",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useUploadSheetMutation } = sheetApi;

export default sheetApi;
