import adminApi from "../BaseApi/AdminApi";

export interface ContactSupportItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFeedbackItem {
  id: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedMeta {
  total?: number;
  totalItems?: number;
  itemCount?: number;
  limit?: number;
  itemsPerPage?: number;
  totalPages?: number;
  page?: number;
  currentPage?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data: T[] | { items: T[]; meta?: PaginatedMeta };
  meta?: PaginatedMeta;
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const supportApi = adminApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Contact Support APIs
    createContactSupport: builder.mutation<
      SingleResponse<ContactSupportItem>,
      { fullName: string; phoneNumber: string; message: string }
    >({
      query: (body) => ({
        url: "/contact-support",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContactSupport"],
    }),
    getContactSupportList: builder.query<
      PaginatedResponse<ContactSupportItem>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        return {
          url: `/contact-support?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ContactSupport"],
    }),
    getContactSupportById: builder.query<
      SingleResponse<ContactSupportItem>,
      string
    >({
      query: (id) => ({
        url: `/contact-support/${id}`,
        method: "GET",
      }),
      providesTags: ["ContactSupport"],
    }),
    updateContactSupport: builder.mutation<
      SingleResponse<ContactSupportItem>,
      { id: string; fullName?: string; phoneNumber?: string; message?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/contact-support/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ContactSupport"],
    }),
    deleteContactSupport: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/contact-support/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContactSupport"],
    }),

    // Product Feedback APIs
    createProductFeedback: builder.mutation<
      SingleResponse<ProductFeedbackItem>,
      { message: string }
    >({
      query: (body) => ({
        url: "/product-feedback",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProductFeedback"],
    }),
    getProductFeedbackList: builder.query<
      PaginatedResponse<ProductFeedbackItem>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        return {
          url: `/product-feedback?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ProductFeedback"],
    }),
    getProductFeedbackById: builder.query<
      SingleResponse<ProductFeedbackItem>,
      string
    >({
      query: (id) => ({
        url: `/product-feedback/${id}`,
        method: "GET",
      }),
      providesTags: ["ProductFeedback"],
    }),
    updateProductFeedback: builder.mutation<
      SingleResponse<ProductFeedbackItem>,
      { id: string; message?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/product-feedback/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ProductFeedback"],
    }),
    deleteProductFeedback: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/product-feedback/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductFeedback"],
    }),
  }),
});

export const {
  useCreateContactSupportMutation,
  useGetContactSupportListQuery,
  useGetContactSupportByIdQuery,
  useUpdateContactSupportMutation,
  useDeleteContactSupportMutation,

  useCreateProductFeedbackMutation,
  useGetProductFeedbackListQuery,
  useGetProductFeedbackByIdQuery,
  useUpdateProductFeedbackMutation,
  useDeleteProductFeedbackMutation,
} = supportApi;

export default supportApi;
