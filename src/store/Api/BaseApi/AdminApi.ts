/* eslint-disable @typescript-eslint/no-explicit-any */

import { logOut, setUser } from "@/store/Slices/AuthSlice/authSlice";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_ADMIN_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    const token = state.auth.user?.adminAccessToken;
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
    const refreshToken = state.auth.user?.adminRefreshToken;
    if (!refreshToken) {
      api.dispatch(logOut());
      return result;
    }
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );
    if (refreshResult.data) {
      api.dispatch(setUser(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: ["MyTickets","ClientDetails","ContactSupport","ProductFeedback"]
})

export default adminApi