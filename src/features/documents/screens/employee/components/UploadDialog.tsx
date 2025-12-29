import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import MDBox from '../../../../../components/MDBox/MDBox';
import MDTypography from '../../../../../components/MDTypography/index';
import MDButton from '../../../../../components/MDButton/MDButton';
import { useAddNewDocumentMutation } from '../../../documentsApi';
import { useUploadFileMutation } from '../../../../../shared/api/sharedApi';
import type { ICustomErrorResponse } from '../../../../../state/types';
import ActivityIndicator from '../../../../../shared/components/activityIndicator/ActivityIndicator';
import { userInState } from '../../../../auth/authSlice';
import { useSelector } from 'react-redux';
import { useSnackBarContext } from '../../../../../wrappers/snackbarContext/useSnackBarContext';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose }) => {
  const [documentName, setDocumentName] = useState('');
  const user = useSelector(userInState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { displaySnackbar } = useSnackBarContext();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [addDocument, { isLoading: isAddingDocument }] =
    useAddNewDocumentMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) {
      displaySnackbar('error', 'Please select a file and enter document name');
      return;
    }

    if (typeof user?.id !== 'number') {
      displaySnackbar('error', 'User information is missing. Cannot upload document.');
      return;
    }

    try {
      // Upload file first
      const formData = new FormData();
      formData.append('files', selectedFile);
      const uploadResponse = await uploadFile(formData).unwrap();

      // Create document with uploaded file ID
      const documentData = {
        data: {
          documentName: documentName.trim(),
          document: uploadResponse[0].id.toString(),
          user: user.id,
        },
      };

      await addDocument(documentData).unwrap();

      displaySnackbar('success', 'Document uploaded successfully');
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      const errorResponse = error as ICustomErrorResponse;
      displaySnackbar(
        'error',
        errorResponse.message || 'Failed to upload document'
      );
    }
  };

  const handleClose = () => {
    setDocumentName('');
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDTypography variant="h6" fontWeight="bold">
          Upload New Document
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <MDBox mt={2}>
          <TextField
            fullWidth
            label="Document Name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
            margin="normal"
          />

          <MDBox mt={3} textAlign="center">
            <Button
              component="label"
              variant="outlined"
              color="info"
              sx={{
                color: '#FF7312',
                borderColor: '#FF7312',
                '&:hover': {
                  borderColor: '#FF7312',
                },
              }}
              startIcon={<CloudUpload />}
            >
              Select File
              <VisuallyHiddenInput
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
            </Button>

            {selectedFile && (
              <MDBox>
                <MDTypography variant="body2" color="text">
                  Selected: {selectedFile.name}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Size: {formatFileSize(selectedFile.size)}
                </MDTypography>
              </MDBox>
            )}

            {previewUrl && selectedFile?.type.startsWith('image/') && (
              <MDBox mt={2}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </MDBox>
            )}
          </MDBox>
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton
          onClick={handleClose}
          color="secondary"
          variant="outlined"
          sx={{
            color: '#FF7312',
            borderColor: '#FF7312',
            '&:hover': {
              borderColor: '#FF7312',
            },
          }}
        >
          Cancel
        </MDButton>
        <MDButton
          onClick={handleUpload}
          variant="outlined"
          color="info"
          sx={{
            color: '#FF7312',
            borderColor: '#FF7312',
            '&:hover': {
              borderColor: '#FF7312',
            },
          }}
          disabled={
            !selectedFile ||
            !documentName.trim() ||
            isUploading ||
            isAddingDocument
          }
        >
          {isUploading || isAddingDocument ? (
            <ActivityIndicator size={20} />
          ) : (
            'Upload'
          )}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
