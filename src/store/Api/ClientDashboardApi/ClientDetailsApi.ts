import adminApi from "../BaseApi/AdminApi";

export interface IAssignedChart {
  id: string;
  clientId: string;
  chartName: string;
  isWorking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IClientDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  contactPersonName: string;
  email?: string | null;
  phoneNumber?: string | null;
  isReferred: boolean;
  referrerName: string | null;
  referrerEmail: string | null;
  referrerPhone: string | null;
  discoverySource: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  showFooter: boolean;
  customFooterText: string | null;
  supportContactLink: string | null;
  subdomain: string;
  region: string;
  timeZone: string;
  language: string;
  enableOnboarding: boolean;
  autoGenDashboard: boolean;
  industryTemplate: string | null;
  enableCustomCharts: boolean;
  storageQuotaGb: number;
  archiveThreshold: number;
  archiveAfterDays: number;
  usageWarningAlert: boolean;
  billingCycle: string;
  subscriptionPlan: string;
  discountCode: string | null;
  startBillingDate: string | null;
  trialPeriodDays: number;
  paymentMethod: string | null;
  internalNotes: string | null;
  isActive: boolean;
  userId: string;
  name: string | null;
  industryCatagory: string | null;
  assignedCharts: IAssignedChart[];
  user?: {
    id: string;
    email: string;
    phoneNumber?: string | null;
    name?: string | null;
    role: string;
    status: boolean;
    profileImage?: string | null;
    createdAt: string;
  } | null;
}

export interface IClientDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IClientDetails;
}

export interface IClientDetailsRequest {
  name?: string;
  email?: string;
  contactPersonName?: string;
  phoneNumber?: string;
  isReferred?: boolean;
  password?: string;
  referrerName?: string;
  referrerEmail?: string;
  referrerPhone?: string;
  discoverySource?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showFooter?: boolean;
  customFooterText?: string;
  supportContactLink?: string;
  subdomain?: string;
  region?: string;
  timeZone?: string;
  language?: string;
  enableOnboarding?: boolean;
  autoGenDashboard?: boolean;
  industryTemplate?: string;
  enableCustomCharts?: boolean;
  assignedCharts?: string[];
  storageQuotaGb?: number;
  archiveThreshold?: number;
  archiveAfterDays?: number;
  usageWarningAlert?: boolean;
  billingCycle?: string;
  subscriptionPlan?: string;
  discountCode?: string;
  startBillingDate?: string;
  trialPeriodDays?: number;
  paymentMethod?: string;
  internalNotes?: string;
  logo?: File | string | null;
  favicon?: File | string | null;
}

const clientDetails = adminApi.injectEndpoints({
  overrideExisting: true,
    endpoints: (builder) => {
        return {
            getClientDetails: builder.query<IClientDetailsResponse, { id: string }>({
                query: ({ id }) => `/clients/getSingle/${id}`,
                providesTags: ["ClientDetails"],
            }),
            updateClientDetails: builder.mutation<
                IClientDetailsResponse,
                { id: string; data: Partial<IClientDetailsRequest> | FormData }
            >({
                query: ({ id, data }) => ({
                    url: `/clients/update/${id}`,
                    method: "PUT",
                    body: data
                }),
                invalidatesTags: ["ClientDetails"],
            }),
        };
    },
});

export const { useGetClientDetailsQuery, useUpdateClientDetailsMutation } =
    clientDetails;

export default clientDetails;