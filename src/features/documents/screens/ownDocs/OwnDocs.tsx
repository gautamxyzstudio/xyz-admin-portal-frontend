import { useState } from 'react';
import { Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography/index';
import MDButton from '../../../../components/MDButton/MDButton';
import { useGetDocumentsByUserQuery } from '../../documentsApi';
import ActivityIndicator from '../../../../shared/components/activityIndicator/ActivityIndicator';
import DashboardLayout from '../../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import {
  DocumentCard,
  UploadDialog,
  PreviewDialog,
  EmptyState,
} from '../employee/components';
import type { IDocumentResponse } from '../../documents.types';
import { useSelector } from 'react-redux';
import { userInState } from '../../../auth/authSlice';

// Add props for userId and canDelete
interface OwnDocsProps {
  userId?: number;
  canDelete?: boolean;
  employeeName?: string;
}

const OwnDocs: React.FC<OwnDocsProps> = ({
  userId,
  canDelete = false,
  employeeName,
}) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const user = useSelector(userInState);
  const [previewDocument, setPreviewDocument] =
    useState<IDocumentResponse | null>(null);

  const effectiveUserId = userId || user?.id;

  const {
    data: documentsData,
    isFetching: isLoadingDocuments,
    error: documentsError,
  } = useGetDocumentsByUserQuery(effectiveUserId ?? 0, {
    skip: !effectiveUserId,
  });

  const handlePreviewDocument = (document: IDocumentResponse) => {
    setPreviewDocument(document);
    setOpenPreviewDialog(true);
  };

  if (isLoadingDocuments) {
    return (
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <ActivityIndicator size={80} />
      </MDBox>
    );
  }

  if (documentsError) {
    return (
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <MDTypography variant="h6" color="error">
          Failed to load documents. Please try again.
        </MDTypography>
      </MDBox>
    );
  }

  return (
    <>
      {/* Header */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <MDTypography variant="h4" fontWeight="bold">
          {employeeName ? `${employeeName}'s Documents` : 'My Documents'}
        </MDTypography>
        {!userId && (
          <MDButton
            variant="outlined"
            color="info"
            sx={{ color: '#FF7312', borderColor: '#FF7312' }}
            startIcon={<Add />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload Document
          </MDButton>
        )}
      </MDBox>

      {/* Documents Grid */}
      {documentsData?.data && documentsData.data.length > 0 ? (
        <Grid container spacing={3}>
          {documentsData.data.map((document) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
              <DocumentCard
                document={document}
                onPreview={handlePreviewDocument}
                canDelete={canDelete}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          onUploadClick={() => setOpenUploadDialog(true)}
          showUploadButton={!userId}
          subtitle={
            userId ? 'No documents found for this employee.' : undefined
          }
        />
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        document={previewDocument}
      />
    </>
  );
};

export default OwnDocs;
