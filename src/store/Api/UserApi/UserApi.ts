import baseApi from "../BaseApi/BaseApi";

export interface GenericResponse<T> {
  status: string;
  message: string;
  data: T;
}

const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        }); 
        return {
          url: "/users",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["Users"],
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUsers: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    createManager: builder.mutation({
      query: (data) => ({
        url: "/users/managers/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Manager"],
    }),
    getAllManagers: builder.query({
      query: (args = {}) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: "/users/managers",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["Manager"],
    }),
    createEmployee: builder.mutation({
      query: (data) => ({
        url: "/users/employees/create-employee",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Employee"],
    }),
    createViewer: builder.mutation({
      query: (data) => ({
        url: "/users/viewers/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Viewer"],
    }),
    getAllViewers: builder.query({
      query: (args = {}) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
        return {
          url: "/users/viewers",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["Viewer"],
    }),

    getUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    getManagerById: builder.query({
      query: (id) => ({
        url: `/users/managers/${id}`,
        method: "GET",
      }),
      providesTags: ["Manager"],
    }),

    getEmployeeById: builder.query({
      query: (id) => ({
        url: `/users/employees/${id}`,
        method: "GET",
      }),
      providesTags: ["Employee"],
    }),

    getViewerById: builder.query({
      query: (id) => ({
        url: `/users/viewers/${id}`,
        method: "GET",
      }),
      providesTags: ["Viewer"],
    }),

    bulkDeleteUsers: builder.mutation({
      query: (data) => ({
        url: "/users/bulk",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Users", "Employee", "Manager", "Viewer"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUsersMutation,
  useGetAllManagersQuery,
  // useGetAllEmployeesQuery,
  useGetProfileQuery,
  useGetAllViewersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useGetManagerByIdQuery,
  useGetEmployeeByIdQuery,
  useGetViewerByIdQuery,
  useCreateManagerMutation,
  useCreateEmployeeMutation,
  useCreateViewerMutation,
  useBulkDeleteUsersMutation,
} = userApi;

export default userApi;
