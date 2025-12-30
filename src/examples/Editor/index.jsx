import { useEffect, useRef, useState } from "react";
import { useMutation } from "../../api/customApi.js";
import { apiendpoint } from "../../api/endpoint.js";
import { toast } from "react-toastify";
import { Grid, Icon, IconButton, Box, Typography, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MDInput from "../../components/MDInput/index.jsx";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Editor } from "@tinymce/tinymce-react";

/**
 * BlogEditor component for creating and editing blog posts.
 */
const BlogEditor = () => {
  // Router hooks
  const { id } = useParams();
  const navigate = useNavigate();

  // Editor and image state
  const editorRef = useRef(null);
  const [imagePath, setImagePath] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [existingImageId, setExistingImageId] = useState("");

  // Blog form state
  const [inputValue, setInputValue] = useState({
    metaTitle: "",
    metaDescr: "",
    title: "",
    description: "",
    blogDate: "",
    blogData: "",
  });

  // API and loading state
  const { makeRequest } = useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog post if editing
  useEffect(() => {
    if (id) fetchBlogPost(id);
    // eslint-disable-next-line
  }, [id]);

  /**
   * Fetches a blog post by ID and populates the form.
   */
  const fetchBlogPost = async (blogId) => {
    try {
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
        });
        setExistingImageId(attrs.banner?.data?.id || "");
        setImagePath(
          attrs.banner?.data?.attributes.url.startsWith("https")
            ? `${attrs.banner?.data?.attributes?.url}`
            : `${import.meta.env.VITE_API_BASE_URL}${
                attrs.banner?.data?.attributes.url || ""
              }`
        );
      }
    } catch (error) {
      toast.error("Failed to fetch blog post.");
    }
  };

  /**
   * Handles closing the editor and navigating back.
   */
  const handleClose = () => navigate("/blog");

  /**
   * Handles saving or updating the blog post.
   */
  const handleSavePost = async () => {
    setIsSubmitting(true);
    const editorContent = editorRef.current?.getContent();
    if (!editorContent) {
      toast.error("Blog Content is required");
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
  };

  /**
   * Uploads the banner image if a new one is selected.
   * Returns the image ID.
   */
  const handleUploadBanner = async () => {
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
  };

  /**
   * Saves or updates the blog post.
   */
  const saveBlogPost = async (bannerId, editorContent) => {
    try {
      const method = id ? "put" : "post";
      const url = id ? apiendpoint.editBlogs(id) : apiendpoint.postBlogs;
      const body = {
        data: {
          metaTitle: inputValue.metaTitle,
          metaDescr: inputValue.metaDescr,
          BlogDate: inputValue.blogDate,
          title: inputValue.title,
          shortDesc: inputValue.description,
          banner: [bannerId],
          blogData: editorContent,
        },
      };
      const response = await makeRequest({ type: method, url, body });
      if (response) {
        toast.success("Content saved successfully!");
        navigate("/blog", { state: { refreshed: true } });
      }
    } catch {
      toast.error("Failed to save content.");
    }
  };

  /**
   * Handles image file selection and preview.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePath(URL.createObjectURL(file));
      setUploadedImage(file);
    }
  };

  /**
   * Handles changes to form fields.
   */
  const handleInputChange = (field) => (e) => {
    setInputValue((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  /**
   * Handles date selection.
   */
  const handleDateChange = (date) => {
    setInputValue((prev) => ({
      ...prev,
      blogDate: date ? date.format("YYYY-MM-DD") : "",
    }));
  };

  return (
    <>
      <DashboardNavbar />
      <Box pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}></Grid>
        </Grid>
        <div>
          {/* Header */}
          <Box
            display="grid"
            variant="gradient"
            bgColor="warning"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            p={3}
            mb={1}
            textAlign="center"
          >
            <Typography
              gridRow="1"
              gridColumn="3/7"
              variant="h5"
              fontWeight="medium"
              color="white"
              mt={1}
            >
              Blog Post
            </Typography>
            <Typography
              gridRow="2"
              gridColumn="3/7"
              variant="button"
              color="white"
            >
              Blog Post Editor
            </Typography>
            <Typography gridColumn="8" gridRow="1/2" variant="button">
              <IconButton size="medium" color="white" onClick={handleClose}>
                <Icon fontSize="large" fontWeight="900">
                  close
                </Icon>
              </IconButton>
            </Typography>
          </Box>

          {/* Form */}
          <Box variant="gradient" mx={2} mt={3} mb={1}>
            {/* Meta tag data */}
            <Box display="grid" mb={2}>
              <Box my={2} gridRow="1" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Meta Title"
                  variant="standard"
                  value={inputValue.metaTitle}
                  onChange={handleInputChange("metaTitle")}
                  fullWidth
                />
              </Box>
              <Box my={2} gridRow="1" gridColumn="5/10">
                <MDInput
                  type="text"
                  label="Meta Description"
                  variant="standard"
                  value={inputValue.metaDescr}
                  onChange={handleInputChange("metaDescr")}
                  multiline
                  fullWidth
                />
              </Box>
              <Box my={2} gridRow="1" gridColumn="11/12">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Publish Date"
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: { variant: "standard", fullWidth: true },
                    }}
                    value={
                      inputValue.blogDate ? dayjs(inputValue.blogDate) : null
                    }
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            {/* Blog Title and Description */}
            <Box display="grid" mb={2}>
              <Box my={2} gridRow="1" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Blog Title"
                  variant="standard"
                  value={inputValue.title}
                  onChange={handleInputChange("title")}
                  multiline
                  fullWidth
                />
              </Box>
              <Box my={2} gridRow="1" gridColumn="5/12">
                <MDInput
                  type="text"
                  label="Short Description:"
                  variant="standard"
                  value={inputValue.description}
                  onChange={handleInputChange("description")}
                  multiline
                  fullWidth
                />
              </Box>
            </Box>
            {/* Banner Upload */}
            <Box color="gray" display="flex" gap={6}>
              <Typography pb={2}>Upload Blog Banner:</Typography>
              <MDInput
                type="file"
                variant="standard"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Box>
            {imagePath && (
              <Box
                mt={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius="rounded-md"
                height="400px"
              >
                <img
                  src={imagePath}
                  alt="image preview"
                  className="max-h-full max-w-full rounded-lg"
                />
              </Box>
            )}
            <hr />
            {/* Blog Content Editor */}
            <Box color="gray">
              <Typography py={2}>Text Editor:</Typography>
              <Editor
                apiKey="hu5s7mnpfr8f0jgu9z04b77lk7qum6i84m2v8pmww6znrvlx"
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={inputValue?.blogData || ""}
                ref={editorRef}
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
                    "blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "image | removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  automatic_uploads: true,
                  file_picker_types: "image",
                  images_reuse_filename: true,
                  images_upload_url: apiendpoint.UPLOAD_IMAGE,
                }}
              />
              <Box mt={2} display="flex" gap={3}>
                <Button
                  onClick={handleSavePost}
                  variant="gradient"
                  color={isSubmitting ? "secondary" : "warning"}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {id ? "Update Post" : "Save Post"}
                </Button>
              </Box>
            </Box>
          </Box>
        </div>
      </Box>
    </>
  );
};

export default BlogEditor;
