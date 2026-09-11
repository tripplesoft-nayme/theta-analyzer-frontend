import baseApi from "../BaseApi/BaseApi";

const verificationApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    verificationType: builder.mutation({
      query: (type: string) => ({
        url: `/otp/send/${type}`,
        method: "POST",
      }),
    }),
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `/otp/verify/email`,
        method: "POST",
        body: data,
      }),
    }),
    verifyPhone: builder.mutation({
      query: (data) => ({
        url: `/otp/verify/phone`,
        method: "POST",
        body: data,
      }),
    }),
    otpGoogle: builder.query({
      query: () => ({
        url: `/otp/google`,
        method: "GET",
      }),
    }),
    otpGoogleCallback: builder.query({
      query: () => ({
        url: `/otp/google/callback`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useVerificationTypeMutation,
  useVerifyEmailMutation,
  useVerifyPhoneMutation,
  useOtpGoogleQuery,
  useOtpGoogleCallbackQuery,
} = verificationApi;
export default verificationApi;
