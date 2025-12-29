
import { CloudUpload } from '@mui/icons-material';
import MDBox from '../../../../../components/MDBox/MDBox';
import MDTypography from '../../../../../components/MDTypography/index';
import MDButton from '../../../../../components/MDButton/MDButton';

interface EmptyStateProps {
  onUploadClick: () => void;
  showUploadButton?: boolean;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadClick,
  showUploadButton = true,
  subtitle,
}) => {
  return (
    <MDBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      textAlign="center"
    >
      <CloudUpload sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
      <MDTypography variant="h6" color="text" mb={1}>
        No documents uploaded yet
      </MDTypography>
      <MDTypography variant="body2" color="text" mb={3}>
        {subtitle || 'Upload your first document to get started'}
      </MDTypography>
      {showUploadButton && (
        <MDButton variant="gradient" color="info" onClick={onUploadClick}>
          Upload Document
        </MDButton>
      )}
    </MDBox>
  );
};

export default EmptyState;
