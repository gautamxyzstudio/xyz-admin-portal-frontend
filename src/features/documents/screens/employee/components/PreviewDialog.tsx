import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import MDBox from '../../../../../components/MDBox/MDBox';
import MDTypography from '../../../../../components/MDTypography/index';
import MDButton from '../../../../../components/MDButton/MDButton';
import type { IDocumentResponse } from '../../../documents.types';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: IDocumentResponse | null;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  document,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <MDTypography variant="h6" fontWeight="bold">
          {document?.attributes?.documentName}
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        {document && (
          <MDBox textAlign="center">
            {document.attributes.document.data.attributes.mime.startsWith(
              'image/'
            ) ? (
              <img
                // @ts-ignore
                src={`${import.meta.env.VITE_API_BASE_URL}${
                  document.attributes.document.data.attributes.url
                }`}
                alt={document.attributes.documentName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <MDBox p={4}>
                <MDTypography variant="h6" color="text" mb={2}>
                  Preview not available for this file type
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="info"
                  startIcon={<Download />}
                  onClick={() =>
                    window.open(
                      // @ts-ignore
                      `${import.meta.env.VITE_API_BASE_URL}${
                        document.attributes.document.data.attributes.url
                      }`,
                      '_blank'
                    )
                  }
                >
                  Download to View
                </MDButton>
              </MDBox>
            )}

            <MDBox mt={3} textAlign="left">
              <MDTypography variant="body2" color="text">
                <strong>File Name:</strong>{' '}
                {document.attributes.document.data.attributes.name}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                <strong>File Type:</strong>{' '}
                {document.attributes.document.data.attributes.mime}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                <strong>File Size:</strong>{' '}
                {formatFileSize(
                  document.attributes.document.data.attributes.size * 1024
                )}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                <strong>Uploaded:</strong>{' '}
                {formatDate(document.attributes.createdAt)}
              </MDTypography>
            </MDBox>
          </MDBox>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton
          onClick={onClose}
          variant="outlined"
          color="info"
          sx={{
            color: '#FF7312',
            borderColor: '#FF7312',
            '&:hover': {
              borderColor: '#FF7312',
            },
          }}
        >
          Close
        </MDButton>
        {document && (
          <MDButton
            variant="outlined"
            color="info"
            sx={{
              color: '#FF7312',
              borderColor: '#FF7312',
              '&:hover': {
                borderColor: '#FF7312',
              },
            }}
            startIcon={<Download />}
            onClick={() =>
              window.open(
                // @ts-ignore
                `${import.meta.env.VITE_API_BASE_URL}${
                  document.attributes.document.data.attributes.url
                }`,
                '_blank'
              )
            }
          >
            Download
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PreviewDialog;
