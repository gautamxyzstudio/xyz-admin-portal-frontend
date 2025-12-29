
import type { ICustomInputProps } from '../customInput/CustomInput.types';

export interface IPasswordInputProps extends ICustomInputProps {
  showPassword: boolean;
  handleClickShowPassword: () => void;
}
