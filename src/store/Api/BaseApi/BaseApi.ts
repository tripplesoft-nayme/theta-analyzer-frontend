/* eslint-disable @typescript-eslint/no-explicit-any */
import { logOut, updateAccessToken } from "@/store/Slices/AuthSlice/authSlice";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    const token = state.auth.user?.accessToken;
    if (token) {
      headers.set("Authorization", `${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const state = api.getState() as any;
    const refreshToken = state.auth.user?.refreshToken;
    if (!refreshToken) {
      api.dispatch(logOut());
      return result;
    }
    const refreshResult: any = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );
    if (refreshResult.data) {
      api.dispatch(updateAccessToken(refreshResult?.data?.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    "Program",
    "Users",
    "Manager",
    "Employee",
    "Viewer",
    "Employees",
    "Project",
    "Dashboard",
    "menuItems",
    "Favorite",
    "Clients",
    "Nodes",
    "Charts",
    "ChartHistory",
    "Notification",
    "Submission",
    "GanttChart",
    "Tags",
    "Table",
    "Template",
    "Files",
    "ProgramFiles",
    "ProjectFiles",
    "SystemConfig",
    "NotificationPermissions",
    "Timeline",
    "Overdue",
    "ContactSupport",
    "ProductFeedback",
    "ClientStats",
    "ProgramOverview",
    "ReviewActivity",
  ],
});
export default baseApi;
