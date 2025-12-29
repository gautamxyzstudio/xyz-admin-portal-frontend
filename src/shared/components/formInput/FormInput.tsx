import CustomInput from '../customInput/CustomInput';
import type { IFormTextInputProps } from './FormInput.types';

const FormTextInput: React.FC<IFormTextInputProps> = ({
  label,
  value,
  onChange,
  type,
  errorMessage,
  ...props
}) => {
  return (
    <CustomInput
      value={value}
      defaultValue={'default value'}
      label={label}
      type={type}
      fullWidth
      error={errorMessage?.length > 0}
      onChange={onChange}
      sx={{
        '.mui-fogmy4-MuiInputBase-root-MuiOutlinedInput-root': {
          borderRadius: 2,
        },
        '.mui-kbp9eo-MuiFormLabel-root-MuiInputLabel-root': {
          color: '#868686',
        },
        '.mui-es9ybl-MuiFormControl-root-MuiTextField-root label.Mui-focused': {
          color: '#868686',
        },
        '--TextField-brandBorderColor': '#dbdbdb',
        '--TextField-brandBorderHoverColor': '#dbdbdb',
        '--TextField-brandBorderFocusedColor': '#868686',
      }}
      errorMessage={errorMessage}
      {...props}
    />
  );
};

export default FormTextInput;
