// import baseApi from "../BaseApi/BaseApi";

// export const infrastructureNodesApi = baseApi.injectEndpoints({
//       providesTags: [{ type: "Nodes", id: "LIST" }],
//     }),

//     getProjectTree: builder.query<any, string>({
//       query: (projectId) => ({
//         url: `/infrastructure-nodes/project/${projectId}/tree`,
//         method: "GET",
//       }),
//       providesTags: (result) =>
//         result?.data
//           ? [
//               { type: "Nodes", id: "LIST" },
//               ...result.data.map((node: any) => ({
//                 type: "Nodes",
//                 id: node.id,
//               })),
//             ]
//           : [{ type: "Nodes", id: "LIST" }],
//     }),

//     getNodeTree: builder.query<any, string>({
//       query: (nodeId) => ({
//         url: `/infrastructure-nodes/${nodeId}/tree`,
//         method: "GET",
//       }),
//       providesTags: (_result, _error, nodeId) => [
//         { type: "Nodes", id: nodeId },
//       ],
//     }),

//     getFlatNodes: builder.query<any, string>({
//       query: (projectId) => ({
//         url: `/infrastructure-nodes/project/${projectId}/flat`,
//         method: "GET",
//       }),
//       providesTags: [{ type: "Nodes", id: "LIST" }],
//     }),

//     getNodeChildren: builder.query<any, string>({
//       query: (nodeId) => ({
//         url: `/infrastructure-nodes/${nodeId}/children`,
//         method: "GET",
//       }),
//       providesTags: (_result, _error, nodeId) => [
//         { type: "Nodes", id: nodeId },
//       ],
//     }),

//     /* ---------------- EXPORT ---------------- */

//     exportNodes: builder.query<Blob, string>({
//       query: (projectId) => ({
//         url: `/infrastructure-nodes/project/${projectId}/export`,
//         method: "GET",
//         responseHandler: (response) => response.blob(),
//       }),
//     }),

//     /* ---------------- MUTATIONS ---------------- */

//     createNode: builder.mutation<any, any>({
//       query: (payload) => ({
//         url: `/infrastructure-nodes`,
//         method: "POST",
//         body: payload,
//       }),
//       invalidatesTags: [{ type: "Nodes", id: "LIST" }],
//     }),

//     updateNode: builder.mutation<any, { nodeId: string; data: any }>({
//       query: ({ nodeId, data }) => ({
//         url: `/infrastructure-nodes/${nodeId}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: (_result, _error, { nodeId }) => [
//         { type: "Nodes", id: nodeId },
//         { type: "Nodes", id: "LIST" },
//       ],
//     }),

//     deleteNode: builder.mutation<any, string>({
//       query: (nodeId) => ({
//         url: `/infrastructure-nodes/${nodeId}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [{ type: "Nodes", id: "LIST" }],
//     }),

//     importNodes: builder.mutation<any, { projectId: string; data: any }>({
//       query: ({ projectId, data }) => ({
//         url: `/infrastructure-nodes/project/${projectId}/import`,
//         method: "POST",
//         body: data,
//       }),
//       invalidatesTags: [{ type: "Nodes", id: "LIST" }],
//     }),
//   }),
// });

// export const {
//   useGetRootNodesQuery,
//   useGetProjectTreeQuery,
//   useLazyGetProjectTreeQuery,
//   useGetNodeTreeQuery,
//   useGetFlatNodesQuery,
//   useGetNodeChildrenQuery,
//   useExportNodesQuery,
//   useCreateNodeMutation,
//   useUpdateNodeMutation,
//   useDeleteNodeMutation,
//   useImportNodesMutation,
// } = infrastructureNodesApi;

// export default infrastructureNodesApi;
