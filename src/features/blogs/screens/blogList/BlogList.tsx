/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import { Pagination, Skeleton } from "@mui/material";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { TbPlus } from "react-icons/tb";
import dayjs from "dayjs";
import { Icons } from "../../../../assets/myAssets/exporter";
import {
  useDeleteBlogMutation,
  useLazyGetBlogListQuery,
} from "../../blogListApi";
import type { IBlogResponse } from "../../types";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";

const useBlogListData = () => {
  const [getAllBlog] = useLazyGetBlogListQuery();
  const [blogList, setBlogList] = useState<IBlogResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { setIsLoading } = useLoadingWrapper();

  const fetchBlogList = useCallback(
    async (pageNumber: number, showLoading: boolean = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const response = await getAllBlog(pageNumber).unwrap();
        setBlogList(response.data || []);
        setTotalPages(response.meta.pagination.pageCount);
        setPage(pageNumber);
        return response;
      } catch (error) {
        setBlogList([]);
        throw error;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
        setIsInitialLoading(false);
      }
    },
    [getAllBlog, setIsLoading],
  );
  return {
    blogList,
    page,
    totalPages,
    isInitialLoading,
    fetchBlogList,
  };
};

const BlogList = () => {
  const navigate = useNavigate();
  // const { data, isLoading, isFetching } = useGetBlogListQuery();
  const [deleteBlog] = useDeleteBlogMutation();
  const { isLoading, setIsLoading } = useLoadingWrapper();

  const { blogList, page, totalPages, isInitialLoading, fetchBlogList } =
    useBlogListData();

  // Load current week on mount
  useEffect(() => {
    fetchBlogList(1, true); // Show loading on initial load
  }, []);

  const handlePageChange = async (newPage: number) => {
    await fetchBlogList(newPage, true); // Show loading for pagination
  };

  const handleAddPost = () => navigate(`/blog/post_blog`);

  const onPressEdit = (id: number) => navigate(`/blog/edit_blog/${id}`);

  const handleDelete = async (id: number) => {
    if (window.confirm("Do you want to delete?") && id) {
      try {
        setIsLoading(true);
        await deleteBlog(id).unwrap();
        await fetchBlogList(1, true);
        toast.success("Blog deleted successfully");
      } catch (error) {
        toast.error((error as any)?.message ?? "Something went wrong");
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <CustomBox customClasses="w-full h-full p-5 pb-0 flex flex-col gap-y-6">
      <div className="w-full h-auto flex flex-row items-center-safe justify-between">
        <h2 className="text-2xl font-semibold text-black">Blog List</h2>
        <CustomButton
          label="Post New Blog"
          icon={<TbPlus size={24} />}
          buttonStyle="primary"
          onClick={handleAddPost}
          customStyles="px-5 py-2.5"
        />
      </div>
      <div className="scrollbar-hide max-h-[73vh] overflow-y-scroll w-full h-full flex flex-col gap-y-6 justify-between items-center">
        {isInitialLoading ? (
          <div className="w-full border border-black-20 rounded-2xl p-6 flex flex-row items-start gap-x-4">
            <Skeleton
              animation="pulse"
              width={480}
              height={200}
              variant="rounded"
            />
            <div className="flex flex-col gap-1">
              {[100, 800, 700, 500].map((width, index) => (
                <Skeleton
                  key={index}
                  animation="pulse"
                  width={width}
                  height={index === 0 ? 40 : 30}
                  variant="text"
                />
              ))}
            </div>
          </div>
        ) : (
          blogList.map((item: IBlogResponse) => {
            const blogData = item?.attributes;
            const imageUrl = blogData?.banner?.data?.attributes?.url.startsWith(
              "https",
            )
              ? `${blogData?.banner.data?.attributes?.url}`
              : `${import.meta.env.VITE_API_BASE_URL}${
                  blogData?.banner?.data?.attributes?.formats?.medium?.url
                }`;
            const date = dayjs(blogData?.BlogDate).format("DD/MM/YYYY");
            const shortDesc = blogData?.shortDesc;
            const href = `https://www.xyz.studio/blog/${blogData?.blogSlug}`;

            return (
              <div
                key={item.id}
                className="w-full border border-black-20 rounded-2xl p-6 flex flex-row items-start gap-x-4"
              >
                <div className="relative w-120 overflow-hidden bg-cover rounded-xl shadow">
                  <img
                    src={imageUrl}
                    className="transition duration-1000 ease-in-out hover:scale-125 w-full h-full"
                    alt={blogData?.title}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="w-full flex flex-row items-center justify-between">
                    <span className="text-base text-black">{date}</span>
                    <div className="flex flex-row items-center gap-x-2">
                      <button
                        className="w-7 h-7 rounded p-1 bg-background cursor-pointer"
                        onClick={() => onPressEdit(item.id)}
                      >
                        <img
                          alt="edit"
                          src={Icons.EDIT}
                          className="w-full h-full"
                        />
                      </button>
                      <button
                        className="w-7 h-7 rounded p-1 bg-lightRed cursor-pointer"
                        onClick={() => handleDelete(item.id)}
                      >
                        <img
                          alt="delete"
                          src={Icons.DELETE}
                          className="w-full h-full"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="w-[90%] h-full flex flex-col">
                    <h2 className="font-semibold text-black mt-2.5 text-2xl">
                      {blogData?.title}
                    </h2>
                    <p className="text-base text-black-50 mt-3 line-clamp-3">
                      {shortDesc}
                    </p>
                    <Link
                      to={href}
                      className="text-primary mt-5 text-base font-bold"
                      target="_blank"
                    >
                      View Blog
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div className="w-full flex justify-center sticky bottom-0 bg-white pb-4 pt-4 shadow">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, page) => {
              handlePageChange(page);
            }}
            disabled={isInitialLoading || isLoading}
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 500,
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#FF7300",
                color: "#fff",
              },
              "& .MuiPaginationItem-previousNext": {
                backgroundColor: "#f7f7f7",
              },
            }}
          />
        </div>
      </div>
    </CustomBox>
  );
};
export default BlogList;
