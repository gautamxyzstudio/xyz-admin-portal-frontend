import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography';

const EmployeeDesignationRow = ({ title }) => (
  <MDBox lineHeight={1} textAlign="left">
    <MDTypography
      display="block"
      variant="caption"
      color="text"
      fontWeight="medium"
    >
      {title}
    </MDTypography>
  </MDBox>
);

export default EmployeeDesignationRow;
