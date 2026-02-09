import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type {
  IAnnouncementApiResponse,
  IAnnouncementRequest,
  IAnnouncementResponse,
  IAnnouncementUI,
} from "./types";

export const enhancedAnnouncementListApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Announcement"],
});

export const announcementListApi = enhancedAnnouncementListApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create holiday
    createAnnouncement: builder.mutation<IAnnouncementUI, IAnnouncementRequest>(
      {
        query: (data) => ({
          url: endpoints.getAnnouncements,
          method: ApiMethodType.post,
          body: data,
        }),
        invalidatesTags: ["Announcement"],
      }
    ),
    // Get All Announcement
    getAnnouncements: builder.query<IAnnouncementUI[], void>({
      query: () => ({
        url: endpoints.getAnnouncements,
        method: ApiMethodType.get,
      }),
      providesTags: ["Announcement"],
      transformResponse: (
        response: IAnnouncementResponse
      ): IAnnouncementUI[] => {
        return response.data.map((item) => ({
          id: item.id,
          title: item.attributes.Title,
          description: item.attributes.Description,
          date: item.attributes.Date,
        }));
      },
    }),

    // Get Announcement Detail by Id
    getAnnouncementById: builder.query<IAnnouncementUI, number>({
      query: (id: number) => ({
        url: endpoints.getAnnouncementById(id),
        method: ApiMethodType.get,
      }),
      providesTags: (_result, _error, id) => [{ type: "Announcement", id }],
      transformResponse: (
        response: IAnnouncementApiResponse
      ): IAnnouncementUI => {
        return {
          id: response.data.id,
          title: response.data.attributes.Title,
          date: response.data.attributes.Date,
          description: response.data.attributes.Description,
        };
      },
    }),

    // Update the Announcement Detail by Id
    updateAnnouncement: builder.mutation<
      IAnnouncementUI,
      { id: number; data: IAnnouncementRequest }
    >({
      query: ({ id, data }) => ({
        url: endpoints.getAnnouncementById(id),
        method: ApiMethodType.PUT,
        body: data,
      }),
      invalidatesTags: ["Announcement"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useLazyGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useGetAnnouncementsQuery,
} = announcementListApi;
