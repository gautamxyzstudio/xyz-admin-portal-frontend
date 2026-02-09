/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";

export const enhancedBlogsListApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Blogs"],
});

export const blogsListApi = enhancedBlogsListApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogList: builder.query<any, number>({
      query: (pageNumber: number) => ({
        url: endpoints.getBlogsList(pageNumber),
        method: ApiMethodType.get,
      }),
      providesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation<any, number>({
      query: (id) => ({
        url: endpoints.deleteBlogs(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});
export const {
  useGetBlogListQuery,
  useDeleteBlogMutation,
  useLazyGetBlogListQuery,
} = blogsListApi;
