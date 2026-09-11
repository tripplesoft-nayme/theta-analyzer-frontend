import baseApi from "../BaseApi/BaseApi";

const deadlineApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUpcomingDeadlines: builder.query({
      query: (params) => ({
        url: "/employeeDashboard/projects/upcoming-deadlines",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetUpcomingDeadlinesQuery } = deadlineApi;
export default deadlineApi;
