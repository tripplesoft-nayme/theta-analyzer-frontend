import baseApi from "../BaseApi/BaseApi";

export enum ActionType {
    ASSIGNEE_ADDED = "ASSIGNEE_ADDED",
    // Add other types as they appear in the system
}

export interface IActivityLog {
    id: string;
    timestamp: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    description: string;
    projectName: string;
    ipAddress: string;
    actionType: string | ActionType;
    metadata: Record<string, unknown>;
    [key: string]: string | number | boolean | null | undefined | object;
}

export interface IActivityLogResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: IActivityLog[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const activityLogApi = baseApi.injectEndpoints({
  overrideExisting: true,
    endpoints: (builder) => ({
        getAllActivityLog: builder.query<IActivityLogResponse, void>({
            query: (arg: any) => {
                const searchParams = new URLSearchParams();
                if (arg && typeof arg === 'object') {
                    Object.entries(arg).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            searchParams.append(key, String(value));
                        }
                    });
                }
                return {
                    url: "/activities",
                    method: "GET",
                    params: searchParams,
                }
            }
        }),
        exportActivityLog: builder.query<Blob, void>({
            query: () => "/activities/export",
        }),
        getActivityLogById: builder.query<IActivityLog, string>({
            query: (id) => `/activities/${id}`,
        }),
        getActivityLogByUserId: builder.query<IActivityLogResponse, string>({
            query: (id) => `/activities/user/${id}`,
        }),

    }),
});

export const {
    useGetAllActivityLogQuery,
    useExportActivityLogQuery,
    useGetActivityLogByIdQuery,
    useGetActivityLogByUserIdQuery
} = activityLogApi;

export default activityLogApi;