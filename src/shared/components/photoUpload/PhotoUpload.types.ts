export interface IPhotoUploadProps {
  getUploadedImageId: (id: number) => void;
  initialValue?: string | null
   disabled?: boolean;
}
