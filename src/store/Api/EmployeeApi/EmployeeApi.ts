/* eslint-disable @typescript-eslint/no-explicit-any */
import baseApi from "../BaseApi/BaseApi";

const employeeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEmployeeDashboardStats: builder.query({
      query: () => ({
        url: "/employeeDashboard/dashboard",
        method: "GET",
      }),
      providesTags: ["Employee", "Submission", "Project", { type: "Employee", id: "LIST" }, { type: "Submission", id: "LIST" }, { type: "Project", id: "LIST" }],
    }),
    getAllEmployees: builder.query({
      query: (args: any) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            params.set(key, value as string);
          }
        });
        return {
          url: `/employees`,
          method: "GET",
          params,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
            { type: "Employees", id: "LIST" },
            ...result.data.map((employee: { id: string }) => ({
              type: "Employees",
              id: employee.id,
            })),
          ]
          : [{ type: "Employees", id: "LIST" }],
    }),

    getSingleEmployee: builder.query({
      query: (id) => {
        return {
          url: `/employees/${id}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Employees", id: "LIST" }],
    }),

    addEmployee: builder.mutation({
      query: (data) => ({
        url: "/users/employees/create-employee",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users", "ProgramOverview"],
    }),
    // addManager: builder.mutation({
    //   query: (data) => ({
    //     url: "/users/managers/create",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Users"],
    // }),
    // addViewer: builder.mutation({
    //   query: (data) => ({
    //     url: "/users/viewers/create",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Users"],
    // }),
    updateEmployee: builder.mutation({
      query: ({ id, ...employeeData }) => ({
        url: `/users/employees/update-employee/${id}`,
        method: "PATCH",
        body: employeeData,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }, "Users", "ProgramOverview"],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }, "Users", "ProgramOverview"],
    }),

    bulkDeleteEmployee: builder.mutation({
      query: (data) => ({
        url: "/employees/bulk/delete",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }, "Users", "ProgramOverview"],
    }),
    getEmployeeTaskStatistics: builder.query({
      query: (id) => `/employees/${id}/statistics`,
    }),
    getEmployeeTaskById: builder.query({
      query: (id) => `/employees/${id}/tasks`,
    }),
  }),
});

export const {
  useGetEmployeeDashboardStatsQuery,
  useGetAllEmployeesQuery,
  useGetSingleEmployeeQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useBulkDeleteEmployeeMutation,
  useGetEmployeeTaskStatisticsQuery,
  useGetEmployeeTaskByIdQuery,
  // useAddManagerMutation,
  // useAddViewerMutation,
} = employeeApi;

export default employeeApi;
