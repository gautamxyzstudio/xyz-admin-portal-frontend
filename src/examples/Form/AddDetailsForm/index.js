import React, { useState } from "react";
import MDBox from "../../../components/MDBox/MDBox";
import MDInput from "../../../components/MDInput";
import { apiendpoint } from "../../../api/endpoint";
import axios from "axios";
import MDTypography from "../../../components/MDTypography";
import {
  Card,
  FormControl,
  Grid,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import MDButton from "../../../components/MDButton/MDButton";
import DashboardLayout from "../../LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../Navbars/DashboardNavbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles.css";
import { useMutation } from "../../../api/customApi";

const AddDetails = () => {
  const navigate = useNavigate();
  const [imagePath, setImagePath] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [isImageUploaded, setIsImageUploaded] = useState(false); // State for image upload
  const [isValid, setIsValid] = useState(false);
  const [dataValue, setData] = useState({
    name: "",
    designation: "",
    empCode: "",
    phoneNumber: "",
    joiningDate: "",
    email: "",
    status: "",
    leave_balance: "",
    Photo: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    designation: "",
    empCode: "",
    phoneNumber: "",
    joiningDate: "",
    email: "",
    status: "",
    leave_balance: "",
    Photo: "",
  });

  const validateForm = () => {
    var isValid = true;
    const newErrors = {};

    // Validations for name
    if (!dataValue.name.match(/^[A-Za-z\s]{2,50}$/)) {
      newErrors.name =
        "Name should start with an uppercase letter and be at least 3 characters long.";
      isValid = false;
    }

    // Validations for Email
    if (!dataValue.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Enter a valid email address.";
      isValid = false;
    }

    // Validations for designation
    if (!dataValue.designation.match(/^[A-Za-z\s]{2,50}$/)) {
      newErrors.designation =
        "Designation should start with an uppercase letter.";
      isValid = false;
    }

    // Validations for Phone number
    if (!dataValue.phoneNumber.match(/^[0-9]+$/)) {
      newErrors.phoneNumber = "Phone number must contain only digits (0-9).";
      isValid = false;
    } else if (dataValue.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits long.";
      isValid = false;
    }

    // Validations for Emp Code
    if (!dataValue.empCode.startsWith("XYZ-")) {
      newErrors.empCode = "Employee code should start with 'XYZ-'.";
      isValid = false;
    } else if (!dataValue.empCode.match(/^XYZ-[0-9]+$/)) {
      newErrors.empCode = "Employee codemust contain only digits (0-9).";
      isValid = false;
    } else if (dataValue.empCode.length !== 8) {
      newErrors.empCode = "Employee code must be exactly 4 digits long.";
      isValid = false;
    }

    // Validations for Leave Balance
    if (!dataValue.leave_balance.match(/^[0-9]+$/)) {
      newErrors.leave_balance = "Leave balance must contain only digits (0-9).";
      isValid = false;
    } else if (dataValue.leave_balance >= 20) {
      newErrors.leave_balance = "Maximum Leave is 20 or less.";
      isValid = false;
    }

    setErrors(newErrors);
    setIsValid(isValid);
  };

  const handleClose = () => navigate("/employees");

  const { makeRequest } = useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadImageId = await handleUploadImg();
      if (handleUploadImg) {
        try {
          const token = localStorage.getItem("auth");
          let fieldsData = { ...dataValue, Photo: [uploadImageId] };
          const empDetailsResponse = await makeRequest({
            type: "post",
            url: apiendpoint.addinfo,
            token: token,
            body: { data: fieldsData },
          });
          if (empDetailsResponse) {
            toast.success("Employee details added successfully!");
            navigate("/employees", { state: { refreshed: true } });
          }
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      toast.error("An error occurred while adding employee details.");
      console.error("API ERROR:", error);
    }
  };

  // Upload the Image
  const handleUploadImg = async () => {
    console.log(uploadedImage, "uploading..");
    const formData = new FormData();
    formData.append("files", uploadedImage);
    try {
      const uploadImageResponse = await axios.post(
        apiendpoint.uploadImg,
        formData
      );
      console.log(uploadImageResponse.data, "upload");
      return uploadImageResponse.data[0]?.id || null;
    } catch (error) {
      toast.error("Image upload failed.");
      console.error("Image upload error:", error);
      return null;
    }
  };

  const option = ["active", "deactivate"];

  const handleSelectOption = (e) => {
    setData((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleChange = (e) => {
    setData({
      ...dataValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgPath = URL.createObjectURL(file);
      console.log(
        "========================Create ImgPath============",
        imgPath,
        "path of image",
        "========================Create ImgPath============"
      );
      setImagePath(imgPath);
      setUploadedImage(file);
      setIsImageUploaded(true); // Set image uploaded state to true
    } else {
      setIsImageUploaded(false); // Reset state if no file selected
    }
  };

  return (
    <>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}></Grid>
        </Grid>
        <Card>
          <MDBox
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
            <MDTypography
              gridRow="1"
              gridColumn="3/7"
              variant="h5"
              fontWeight="medium"
              color="white"
              mt={1}
            >
              Employee Information
            </MDTypography>
            <MDTypography
              gridRow="2"
              gridColumn="3/7"
              variant="button"
              color="white"
            >
              Enter details to register
            </MDTypography>
            <MDTypography gridColumn="8" gridRow="1/2" variant="button">
              <IconButton size="medium" color="white" onClick={handleClose}>
                <Icon fontSize="large" fontWeight="900">
                  close
                </Icon>
              </IconButton>
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox
              component="form"
              role="form"
              display="grid"
              onSubmit={handleSubmit}
            >
              <MDBox mb={1} gridRow="1" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Name"
                  name="name"
                  variant="standard"
                  value={dataValue.name}
                  onChange={handleChange}
                  fullWidth
                  onBlur={validateForm} // Validate on blur
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </MDBox>
              <MDBox mb={1} gridRow="2" gridColumn="1/4">
                <MDInput
                  type="email"
                  label="Email"
                  name="email"
                  variant="standard"
                  value={dataValue.email}
                  onChange={handleChange}
                  fullWidth
                  onBlur={validateForm} // Validate on blur
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </MDBox>
              <MDBox mb={1} gridRow="3" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Designation"
                  name="designation"
                  variant="standard"
                  value={dataValue.designation}
                  onChange={handleChange}
                  onBlur={validateForm} // Validate on blur
                  error={!!errors.designation}
                  helperText={errors.designation}
                  fullWidth
                />
              </MDBox>
              <MDBox mb={1} gridRow="4" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Phone Number"
                  variant="standard"
                  name="phoneNumber"
                  value={dataValue.phoneNumber}
                  onChange={handleChange}
                  onBlur={validateForm} // Validate on blur
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  fullWidth
                />
              </MDBox>
              <MDBox mb={1} gridRow="5" gridColumn="1/4">
                <MDInput
                  type="text"
                  label="Employee Code"
                  variant="standard"
                  name="empCode"
                  value={dataValue.empCode}
                  onChange={handleChange}
                  onBlur={validateForm}
                  error={!!errors.empCode}
                  helperText={errors.empCode}
                  fullWidth
                />
              </MDBox>
              <MDBox
                mb={1}
                gridRow="6"
                gridColumn="1/4"
                textTransform="capitalize"
              >
                <FormControl variant="standard" fullWidth>
                  <InputLabel id="select-standard-label">Status</InputLabel>
                  <Select
                    labelId="select-standard-label"
                    id="select-standard"
                    value={dataValue.status}
                    onChange={handleSelectOption}
                    label="Status"
                  >
                    {option.map((option, index) => (
                      <MenuItem value={option} key={index}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MDBox>
              <MDBox mb={1} mt={1} gridRow="7" gridColumn="1/4">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Joining Date"
                    slotProps={{
                      textField: { variant: "standard", fullWidth: true },
                    }}
                    value={dayjs(dataValue.joiningDate)}
                    disableFuture
                    onChange={(e) => {
                      setData((prev) => ({
                        ...prev,
                        joiningDate: e.format("YYYY-MM-DD"),
                      }));
                    }}
                  />
                </LocalizationProvider>
              </MDBox>
              <MDBox mb={1} mt={1} ml={4} gridRow="7" gridColumn="4/8">
                <MDInput
                  type="text"
                  label="Leave Balance"
                  name="leave_balance"
                  variant="standard"
                  value={dataValue.leave_balance}
                  onChange={handleChange}
                  onBlur={validateForm} // Validate on blur
                  error={!!errors.leave_balance}
                  helperText={errors.leave_balance}
                  fullWidth
                />
              </MDBox>
              <MDBox
                mb={1}
                gridColumn="4/8"
                gridRow="1/7"
                textAlign="center"
                color="gray"
              >
                <MDTypography pb={2} color="grey">
                  Upload Image:
                </MDTypography>
                <MDInput
                  type="file"
                  variant="standard"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                />
                {imagePath && (
                  <MDBox
                    mt={2}
                    display="flex"
                    justifyContent="center"
                    borderRadius="rounded-full"
                    height="300px"
                  >
                    <Image
                      src={imagePath}
                      alt="image preview"
                      className="max-h-[300px] max-w-[300px] rounded-full"
                    />
                  </MDBox>
                )}
              </MDBox>
              <MDBox mt={4} mb={1} gridRow="8" gridColumn="1/8">
                <MDButton
                  onClick={handleSubmit}
                  variant="gradient"
                  color="warning"
                  type="submit"
                  disabled={!isImageUploaded || !isValid}
                >
                  Submit
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </>
  );
};

export default AddDetails;
