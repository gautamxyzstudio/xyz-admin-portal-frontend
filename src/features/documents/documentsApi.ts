/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { endpoints } from "../../api/endpoints";
import { ApiMethodType } from '../../state/types';
import type { IDocument, IDocumentsListResponse } from './documents.types';

export const enhancedDocumentsApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Documents'],
});

export const documentsApi = enhancedDocumentsApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentsByUser: builder.query<IDocumentsListResponse, number>({
      query: (id: number) => ({
        url: endpoints.getDocumentsByUser(id),
        method: ApiMethodType.get,
      }),
      providesTags: ['Documents'],
    }),
    addNewDocument: builder.mutation<any, IDocument>({
      query: (data: IDocument) => ({
        url: endpoints.postDocuments,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ['Documents'],
    }),
    deleteDocument: builder.mutation<any, number>({
      query: (id: number) => ({
        url: endpoints.deleteDocuments(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDocumentsByUserQuery,
  useAddNewDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;
