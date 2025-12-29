/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { apiendpoint } from '../../api/endpoint';
import { ApiMethodType } from '../../state/types';
import type { IDocument, IDocumentsListResponse } from './documents.types';

export const enhancedDocumentsApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Documents'],
});

export const documentsApi = enhancedDocumentsApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentsByUser: builder.query<IDocumentsListResponse, number>({
      query: (id: number) => ({
        url: apiendpoint.getDocumentsByUser(id),
        method: ApiMethodType.get,
      }),
      providesTags: ['Documents'],
    }),
    addNewDocument: builder.mutation<any, IDocument>({
      query: (data: IDocument) => ({
        url: apiendpoint.postDocuments,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ['Documents'],
    }),
    deleteDocument: builder.mutation<any, number>({
      query: (id: number) => ({
        url: apiendpoint.deleteDocuments(id),
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
