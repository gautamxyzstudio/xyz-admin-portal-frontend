import { Badge } from '@mui/material';
import MDBadge from '../../../../components/MDBadge/index';
import MDBox from '../../../../components/MDBox/MDBox';

interface EmployeeStatusRowProps {
  status: boolean;
}

const EmployeeStatusRow = ({ status }: EmployeeStatusRowProps) => (
  <MDBox marginLeft={5}>
    <Badge
      color={status ? 'success' : 'error'}
      badgeContent={
        <div className="text-[10px] text-white font-medium">
          {status ? 'Active' : 'Inactive'}
        </div>
      }
      size="sm"
      component={MDBadge}
    />
  </MDBox>
);

export default EmployeeStatusRow;
