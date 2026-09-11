import baseApi from "../BaseApi/BaseApi";

export const filesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET /api/v1/files: Get all files filtered by projectId or programId
    getFiles: builder.query<any, { projectId?: string; programId?: string }>({
      query: (params) => ({
        url: "/files",
        params,
      }),
      providesTags: ["Files"],
    }),

    // POST /api/v1/files/project/{projectId}: Upload files for a project
    bulkUploadProjectFiles: builder.mutation<any, { projectId: string; body: FormData }>({
      query: ({ projectId, body }) => ({
        url: `/files/project/${projectId}/bulk`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),

    // POST /api/v1/files/project/{projectId}: Upload a file for a project
    uploadProjectFile: builder.mutation<any, { projectId: string; body: FormData }>({
      query: ({ projectId, body }) => ({
        url: `/files/project/${projectId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),

    // GET /api/v1/files/project/{projectId}: Get all files for a specific project
    getProjectFiles: builder.query<any, string>({
      query: (projectId) => `/files/project/${projectId}`,
      providesTags: ["Files"],
    }),

    // POST /api/v1/files/program/{programId}: Upload files for a program
    bulkUploadProgramFiles: builder.mutation<any, { programId: string; body: FormData }>({
      query: ({ programId, body }) => ({
        url: `/files/program/${programId}/bulk`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files", "ProgramFiles"],
    }),

    // GET /api/v1/files/program/{programId}: Get all files for a specific program
    getProgramFiles: builder.query<any, string>({
      query: (programId) => `/files/program/${programId}`,
      providesTags: ["Files", "ProgramFiles"],
    }),

    // GET /api/v1/files/{id}: Get a single file by ID
    getFileById: builder.query<any, string>({
      query: (id) => `/files/${id}`,
      providesTags: ["Files"],
    }),

    // PATCH /api/v1/files/{id}: Update file metadata
    updateFileMetadata: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/files/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Files"],
    }),

    // DELETE /api/v1/files/{id}: Soft-delete a file by ID
    deleteFile: builder.mutation<any, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    getProjectFilesByGroup: builder.query<any, string>({
      query: (projectId) => `/files/project/${projectId}/grouped`,
      providesTags: ["Files", "ProjectFiles"],
    }),
    getProgramFilesByGroup: builder.query<any, string>({
      query: (programId) => `/files/program/${programId}/grouped`,
      providesTags: ["Files", "ProgramFiles"],
    }),
    updateFileGroup: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/files/group/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    deleteFileGroup: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/files/group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    rejectFile: builder.mutation<any, { fileId: string; rejectedNote: string }>({
      query: ({ fileId, rejectedNote }) => ({
        url: `/files/${fileId}/reject`,
        method: "PATCH",
        body: { rejectedNote },
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),
    publishFile: builder.mutation<any, { fileId: string }>({
      query: ({ fileId }) => ({
        url: `/files/${fileId}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),
    reviewFile: builder.mutation<any, { fileId: string }>({
      query: ({ fileId }) => ({
        url: `/files/${fileId}/review`,
        method: "PATCH",
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),
    submitProjectFile: builder.mutation<any, { projectId: string; groupId: string; body: FormData }>({
      query: ({ projectId, groupId, body }) => ({
        url: `/files/project/${projectId}/file-groups/${groupId}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Files", "ProjectFiles"],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useBulkUploadProjectFilesMutation,
  useUploadProjectFileMutation,
  useGetProjectFilesQuery,
  useBulkUploadProgramFilesMutation,
  useGetProgramFilesQuery,
  useGetProjectFilesByGroupQuery,
  useGetProgramFilesByGroupQuery,
  useGetFileByIdQuery,
  useUpdateFileMetadataMutation,
  useUpdateFileGroupMutation,
  useDeleteFileMutation,
  useDeleteFileGroupMutation,
  useRejectFileMutation,
  usePublishFileMutation,
  useReviewFileMutation,
  useSubmitProjectFileMutation,
} = filesApi;
