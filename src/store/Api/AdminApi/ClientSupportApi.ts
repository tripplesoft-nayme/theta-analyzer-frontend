import adminApi from "../BaseApi/AdminApi";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ClientSupportApi = adminApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createSupport: builder.mutation({
      query: (data: any) => ({
        url: "client-support/create-ticket",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MyTickets"],
    }),
    getMyTickets: builder.query({
      query: () => ({
        url: "client-support/my-tickets",
        method: "GET",
      }),
      providesTags: ["MyTickets"],
    }),
    getTicketMessages: builder.query({
      query: (id: string) => {
        return {
          url: `client-support/${id}/my-ticket`,
          method: "GET",
        }
      },
      providesTags: ["MyTickets"],
    }),
  }),
});

export const {
  useCreateSupportMutation,
  useGetMyTicketsQuery,
  useGetTicketMessagesQuery,
  useLazyGetTicketMessagesQuery,
} = ClientSupportApi;
export default ClientSupportApi;
