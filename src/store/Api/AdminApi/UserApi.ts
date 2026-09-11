/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllUsers: builder.mutation({
      query: () => ({
        url: "users",
        method: "GET",
      }),
    }),
    getUserById: builder.mutation({
      query: (id: string) => ({
        url: `users/${id}`,
        method: "GET",
      }),
    }),
    getUserProfile: builder.mutation({
      query: () => ({
        url: "users/profile",
        method: "GET",
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (data: any) => ({
        url: "users",
        method: "PATCH",
        body: data,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllUsersMutation,
  useGetUserByIdMutation,
  useGetUserProfileMutation,
  useUpdateUserProfileMutation,
  useDeleteUserMutation,
} = userApi;
export default userApi;
