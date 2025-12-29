import { Card, CardContent, IconButton, Chip } from '@mui/material';
import { Visibility, Download, Delete } from '@mui/icons-material';
import MDBox from '../../../../../components/MDBox/MDBox';
import MDTypography from '../../../../../components/MDTypography/index';
import type { IDocumentResponse } from '../../../documents.types';
import { useDeleteDocumentMutation } from '../../../documentsApi';
import { toast } from 'react-toastify';

interface DocumentCardProps {
  document: IDocumentResponse;
  onPreview: (document: IDocumentResponse) => void;
  canDelete?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  canDelete,
}) => {
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return '📊';
    return '📎';
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(document.id).unwrap();
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <MDBox display="flex" alignItems="center" mb={1}>
          <span style={{ fontSize: '2rem', marginRight: '8px' }}>
            {getFileIcon(document.attributes.document.data.attributes.mime)}
          </span>
          <MDTypography variant="h6" fontWeight="medium" noWrap>
            {document.attributes.documentName}
          </MDTypography>
        </MDBox>

        <MDBox mb={0.5}>
          <Chip
            sx={{ color: '#FF7312', borderColor: '#FF7312' }}
            label={document.attributes.document.data.attributes.ext.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
          />
        </MDBox>

        <MDBox mb={0.5}>
          <MDTypography variant="caption" color="text">
            Size:{' '}
            {formatFileSize(
              document.attributes.document.data.attributes.size * 1024
            )}
          </MDTypography>
        </MDBox>

        <MDBox mb={0.5}>
          <MDTypography variant="caption" color="text">
            Uploaded: {formatDate(document.attributes.createdAt)}
          </MDTypography>
        </MDBox>

        <MDBox display="flex" gap={1} mt="auto">
          <IconButton
            sx={{ color: '#FF7312' }}
            size="small"
            color="primary"
            onClick={() => onPreview(document)}
            title="Preview"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() =>
              window.open(
                // @ts-ignore
                `${import.meta.env.VITE_API_BASE_URL}${
                  document.attributes.document.data.attributes.url
                }`,
                '_blank'
              )
            }
            title="Download"
          >
            <Download sx={{ color: '#FF7312' }} />
          </IconButton>
          {canDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={handleDelete}
              title="Delete"
              disabled={isDeleting}
            >
              <Delete />
            </IconButton>
          )}
        </MDBox>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
