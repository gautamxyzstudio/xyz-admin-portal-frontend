import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import type {
  KbArticle,
  KbArticlePayload,
  KbArticlesResponse,
  KbProjectsResponse,
} from "./knowledgeBase.types";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["KbProjects", "KbArticles"] });

export const knowledgeBaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getKbProjects: builder.query<KbProjectsResponse, void>({
      query: () => ({ url: endpoints.kbProjects, method: "GET" }),
      providesTags: ["KbProjects"],
    }),

    getKbArticles: builder.query<KbArticlesResponse, number>({
      query: (projectId) => ({ url: endpoints.kbArticles(projectId), method: "GET" }),
      providesTags: (_r, _e, projectId) => [{ type: "KbArticles", id: projectId }],
    }),

    createKbArticle: builder.mutation<
      { data: KbArticle },
      { projectId: number; data: KbArticlePayload }
    >({
      query: ({ projectId, data }) => ({
        url: endpoints.kbArticles(projectId),
        method: "POST",
        body: { data },
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "KbArticles", id: projectId },
        "KbProjects",
      ],
    }),

    uploadKbDocument: builder.mutation<{ data: KbArticle }, { projectId: number; form: FormData }>({
      query: ({ projectId, form }) => ({
        url: endpoints.kbUploadDocument(projectId),
        method: "POST",
        body: form,
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "KbArticles", id: projectId },
        "KbProjects",
      ],
    }),

    updateKbArticle: builder.mutation<
      { data: KbArticle },
      { id: number; projectId: number; data: Partial<KbArticlePayload> }
    >({
      query: ({ id, data }) => ({
        url: endpoints.kbArticle(id),
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "KbArticles", id: projectId },
        "KbProjects",
      ],
    }),

    deleteKbArticle: builder.mutation<{ ok: boolean }, { id: number; projectId: number }>({
      query: ({ id }) => ({ url: endpoints.kbArticle(id), method: "DELETE" }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "KbArticles", id: projectId },
        "KbProjects",
      ],
    }),
  }),
});

export const {
  useGetKbProjectsQuery,
  useGetKbArticlesQuery,
  useCreateKbArticleMutation,
  useUploadKbDocumentMutation,
  useUpdateKbArticleMutation,
  useDeleteKbArticleMutation,
} = knowledgeBaseApi;
