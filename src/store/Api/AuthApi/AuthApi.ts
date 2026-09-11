import baseApi from "../BaseApi/BaseApi";

const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    registration: builder.mutation({
      query: (credentials) => ({
        url: "/auth/registration",
        method: "POST",
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: (credentials) => ({
        url: "/auth/change-password",
        method: "POST",
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (credentials) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, credentials }) => ({
        url: `/auth/reset-password?token=${token}`,
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
export default authApi;
