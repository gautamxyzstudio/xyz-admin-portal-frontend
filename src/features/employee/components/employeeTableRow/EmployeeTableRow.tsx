import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography';

const EmployeeTableRow = ({ image, name, email }) => {
  return (
    <MDBox
      display="flex"
      sx={{
        overflow: 'scroll',
      }}
      alignItems="center"
      lineHeight={1}
    >
      <img src={image} alt="" className="size-12 object-center rounded-full" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography
          display="block"
          variant="caption"
          color="text"
          textTransform="capitalize"
          fontWeight="bold"
        >
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );
};

export default EmployeeTableRow;
