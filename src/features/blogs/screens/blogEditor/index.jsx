import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Editor } from "@tinymce/tinymce-react";
import { useMutation } from "../../../../api/customApi";
import { apiendpoint } from "../../../../api/endpoint";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { ArrowBack } from "@mui/icons-material";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * BlogEditor component for creating and editing blog posts.
 */
const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const editorRef = useRef(null);
  const [imagePath, setImagePath] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [existingImageId, setExistingImageId] = useState("");
  const { setIsLoading } = useLoadingWrapper();
  const [isSlugSynced, setIsSlugSynced] = useState(true);
  const [inputValue, setInputValue] = useState({
    metaTitle: "",
    metaDescr: "",
    title: "",
    description: "",
    blogDate: "",
    blogData: "",
    blogSlug: "",
  });

  const { makeRequest } = useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog post if editing
  useEffect(() => {
    if (id) {
      fetchBlogPost(Number(id));
    }
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (isSlugSynced && inputValue.title) {
      setInputValue((prev) => ({
        ...prev,
        blogSlug: slugify(inputValue.title),
      }));
      setIsSlugSynced(false);
    }
  }, [inputValue.title, isSlugSynced]);

  // Fetch blog post details
  const fetchBlogPost = useCallback(
    async (blogId) => {
      try {
        setIsLoading(true);
        const response = await makeRequest({
          type: "get",
          url: apiendpoint.editBlogs(blogId),
        });
        if (response) {
          const attrs = response.data.attributes;
          setInputValue({
            metaTitle: attrs.metaTitle || "",
            metaDescr: attrs.metaDescr || "",
            title: attrs.title || "",
            description: attrs.shortDesc || "",
            blogDate: attrs.BlogDate || "",
            blogData: attrs.blogData || "",
            blogSlug: attrs.blogSlug || "",
          });
          const bannerData = attrs.banner?.data;
          setExistingImageId(bannerData?.id || "");
          if (bannerData?.attributes?.url) {
            setImagePath(
              bannerData.attributes.url.startsWith("https")
                ? bannerData.attributes.url
                : `${import.meta.env.VITE_API_BASE_URL}${
                    bannerData.attributes.url
                  }`
            );
          } else {
            setImagePath("");
          }
        }
      } catch (error) {
        toast.error("Failed to fetch blog post.");
      } finally {
        setIsLoading(false);
      }
    },
    [makeRequest]
  );

  // Handle post submission
  const handleSavePost = useCallback(async () => {
    setIsSubmitting(true);

    const editorContent = editorRef.current?.getContent?.() ?? "";
    if (!editorContent) {
      toast.error("Blog content is required");
      setIsSubmitting(false);
      return;
    }
    try {
      const bannerId = await handleUploadBanner();
      if (bannerId) {
        await saveBlogPost(bannerId, editorContent);
      }
    } catch (err) {
      toast.error("Failed to save content.");
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line
  }, [uploadedImage, existingImageId, inputValue, id]);

  // Uploads the banner image if a new one is selected.
  const handleUploadBanner = useCallback(async () => {
    if (uploadedImage) {
      const formData = new FormData();
      formData.append("files", uploadedImage);
      try {
        const res = await axios.post(apiendpoint.uploadImg, formData);
        return res.data[0]?.id || null;
      } catch {
        toast.error("Image upload failed.");
        return null;
      }
    }
    return existingImageId;
  }, [uploadedImage, existingImageId]);

  // Save or update the blog post
  const saveBlogPost = useCallback(
    async (bannerId, editorContent) => {
      try {
        const url = id
          ? apiendpoint.editBlogs(Number(id))
          : apiendpoint.postBlogs;
        const body = {
          data: {
            metaTitle: inputValue.metaTitle,
            metaDescr: inputValue.metaDescr,
            BlogDate: inputValue.blogDate,
            title: inputValue.title,
            shortDesc: inputValue.description,
            banner: [bannerId],
            blogData: editorContent,
            blogSlug: inputValue.blogSlug,
          },
        };
        const response = id
          ? await axios.put(apiendpoint.editBlogs(Number(id)), body)
          : await axios.put(apiendpoint.postBlogs, body);
        if (response) {
          toast.success("Content saved successfully!");
          navigate("/blog", { state: { refreshed: true } });
        }
      } catch {
        toast.error("Failed to save content.");
      }
    },
    [id, inputValue, navigate]
  );

  // Handle selecting and previewing an image
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePath(URL.createObjectURL(file));
      setUploadedImage(file);
    }
  }, []);

  // Handles changes to fields
  const handleInputChange = (field) => (e) => {
    setInputValue((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handles blogging date
  const handleDateChange = (date) => {
    setInputValue((prev) => ({
      ...prev,
      blogDate: date ? date.format("YYYY-MM-DD") : "",
    }));
  };

  return (
    <CustomBox customClasses="p-6 w-full h-full flex flex-col gap-y-5 overflow-clip">
      <div className="w-full h-fit flex flex-col gap-y-3">
        <button
          type="button"
          onClick={() => navigate("/blog")}
          className="flex items-center gap-x-1 text-base font-bold text-primary cursor-pointer"
        >
          <ArrowBack className="font-bold" fontSize="medium" />
          Back
        </button>
        <h3 className="w-full text-center font-bold text-3xl">Blog Editor</h3>
      </div>
      <LinearGradient customClasses="py-0.25" />

      <div className="w-full flex flex-col h-full gap-y-8 overflow-y-scroll scrollbar-hide">
        {/* Meta tags */}
        <div className="w-full flex flex-row gap-x-10 items-start justify-between mt-6">
          <TextField
            label="Meta Title"
            value={inputValue.metaTitle}
            onChange={handleInputChange("metaTitle")}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Meta Description"
            value={inputValue.metaDescr}
            onChange={handleInputChange("metaDescr")}
            multiline
            fullWidth
            variant="outlined"
            size="small"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Publish Date"
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  variant: "outlined",
                },
              }}
              value={inputValue.blogDate ? dayjs(inputValue.blogDate) : null}
              onChange={handleDateChange}
            />
          </LocalizationProvider>
        </div>
        {/* Main blog fields */}
        <div className="w-full flex flex-row gap-x-10 items-start justify-between">
          <TextField
            label="Blog Title"
            value={inputValue.title}
            onChange={(e) =>
              setInputValue((prev) => ({
                ...prev,
                title: e.target.value,
                blogSlug: slugify(e.target.value),
              }))
            }
            multiline
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Blog Slug"
            value={inputValue.blogSlug}
            onChange={(e) => {
              setIsSlugSynced(false);
              setInputValue((prev) => ({
                ...prev,
                blogSlug: e.target.value,
              }));
            }}
            multiline
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Short Description:"
            value={inputValue.description}
            onChange={handleInputChange("description")}
            multiline
            fullWidth
            variant="outlined"
            size="small"
          />
        </div>
        {/* Banner Upload */}
        <div className="w-full flex flex-col gap-y-4">
          <div className="w-full flex flex-row gap-x-2 items-center-safe">
            <span className="text-lg font-semibold">Upload Blog Banner:</span>
            <input
              type="file"
              accept="image/*"
              className="file-input bg-primary-20"
              onChange={handleImageChange}
            />
          </div>
          {imagePath && (
            <div className="w-full h-100 rounded-2xl overflow-clip flex justify-center items-center">
              <img
                src={imagePath}
                alt="image preview"
                className="max-h-full max-w-full rounded-lg shadow"
              />
            </div>
          )}
          <LinearGradient customClasses="py-0.25" />
        </div>
        {/* Blog Content Editor */}
        <div className="w-full h-full flex flex-col gap-y-4">
          <span className="text-lg font-semibold">Text Editor:</span>
          <Editor
            apiKey="hu5s7mnpfr8f0jgu9z04b77lk7qum6i84m2v8pmww6znrvlx"
            onInit={(_evt, editor) => {
              editorRef.current = editor;
            }}
            initialValue={inputValue.blogData || ""}
            init={{
              placeholder: "Write here...",
              height: 350,
              menubar: false,
              plugins: [
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "fullscreen",
                "wordcount",
                "insertdatetime",
                "media",
                "table",
                "code",
              ],
              toolbar:
                "blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | link | image | removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              quickbars_selection_toolbar:
                "bold italic underline | blocks | bullist numlist | blockquote quicklink",
              automatic_uploads: true,
              file_picker_types: "image",
              images_reuse_filename: true,
              images_upload_url: apiendpoint.UPLOAD_IMAGE,
            }}
          />

          <CustomButton
            onClick={handleSavePost}
            buttonStyle={isSubmitting ? "disabled" : "primary"}
            type="submit"
            disabled={isSubmitting}
            label={id ? "Update Post" : "Save Post"}
            customStyles="w-fit"
          />
        </div>
      </div>
    </CustomBox>
  );
};

export default BlogEditor;
