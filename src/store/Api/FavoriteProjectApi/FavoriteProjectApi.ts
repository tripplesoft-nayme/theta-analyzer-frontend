import baseApi from "../BaseApi/BaseApi";

const favoriteProjectApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getFavoriteProjects: builder.query({
      query: () => `/favorites-project/me`,
      providesTags: ["Favorite"],
    }),
    addFavoriteProject: builder.mutation({
      query: (projectId: string) => ({
        url: `/favorites-project`,
        method: "POST",
        body: { projectId },
      }),
      invalidatesTags: ["Favorite"],
    }),
    removeFavoriteProject: builder.mutation({
      query: (projectId: string) => ({
        url: `/favorites-project`,
        method: "DELETE",
        body: { projectId },
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetFavoriteProjectsQuery,
  useAddFavoriteProjectMutation,
  useRemoveFavoriteProjectMutation,
} = favoriteProjectApi;

export default favoriteProjectApi;
