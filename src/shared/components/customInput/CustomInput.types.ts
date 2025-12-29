import { TextFieldProps } from '@mui/material';
export interface ICustomInputProps extends Omit<TextFieldProps, 'InputProps'> {
  label?: string | undefined;
  value: string | number | null | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: React.HTMLInputTypeAttribute | undefined;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number | undefined;
  rightIcon?: React.ReactNode;
  slotProps?: any;
  variant?: 'outlined' | 'standard' | 'filled';
}
