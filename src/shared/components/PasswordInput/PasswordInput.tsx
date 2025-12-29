import type { IPasswordInputProps } from './PasswordInput.types';
import { IconButton, InputAdornment } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import CustomInput from '../customInput/CustomInput';

const PasswordInput: React.FC<IPasswordInputProps> = ({
  showPassword,
  handleClickShowPassword,
  ...props
}) => {
  return (
    <CustomInput
      label={'Password'}
      type={showPassword ? 'text' : 'password'}
      fullWidth
      error={!!props.errorMessage}
      errorMessage={props.errorMessage} 
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                className="z-10"
                onClick={handleClickShowPassword}
                edge="start"
              >
                {showPassword ? (
                  <VisibilityOutlined  className='text-primary' />
                ) : (
                  <VisibilityOffOutlined  className='text-primary'/>
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default PasswordInput;
