import type { ICustomInputProps } from './CustomInput.types';
import TextField from '@mui/material/TextField';

const CustomInput: React.FC<ICustomInputProps> = ({
  label,
  type,
  maxLength,
  value,
  error,
  slotProps,
  errorMessage,
  onChange,
  variant = 'outlined',
  ...props
}) => {
  const CustomSlotProps = {
    ...slotProps,
    htmlInput: {
      maxLength: maxLength,
    },
  };
  return (
    <div className="w-full">
      <TextField
        {...props}
        label={label}
        type={type}
        slotProps={CustomSlotProps}
        value={value}
        onChange={onChange}
        error={error}
        variant={variant}
      />
      {errorMessage && (
        <p className="text-xs mt-1 text-red-700">{errorMessage}</p>
      )}
    </div>
  );
};

export default CustomInput;
