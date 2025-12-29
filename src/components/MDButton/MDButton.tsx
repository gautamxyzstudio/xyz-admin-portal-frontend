/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { type ButtonProps } from '@mui/material';
import MDButtonRoot from './MDButtonRoot';

type CustomColor = 'white' | 'light' | 'dark' | 'orange';
type CustomVariant = 'gradient';

interface MDButtonProps extends Omit<ButtonProps, 'color' | 'variant'> {
  color?: ButtonProps['color'] | CustomColor;
  variant?: ButtonProps['variant'] | CustomVariant;
  size?: 'small' | 'medium' | 'large';
  circular?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

const MDButton = forwardRef<HTMLButtonElement, MDButtonProps>(
  (
    {
      color = 'grey',
      variant = 'contained',
      size = 'medium',
      circular = false,
      iconOnly = false,
      children,
      ...rest
    },
    ref
  ) => (
    <MDButtonRoot
      {...rest}
      ref={ref}
      color={color as ButtonProps['color']}
      variant={variant as ButtonProps['variant']}
      size={size}
      ownerState={{ color, variant, size, circular, iconOnly }}
    >
      {children}
    </MDButtonRoot>
  )
);

// Setting default values for the props of MDButton
MDButton.defaultProps = {
  color: 'white',
  variant: 'contained',
  size: 'medium',
  circular: false,
  iconOnly: false,
};

// Typechecking props for the MDButton
MDButton.propTypes = {
  color: PropTypes.oneOf([
    'white',
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'error',
    'light',
    'dark',
    'orange',
  ]),
  variant: PropTypes.oneOf(['text', 'contained', 'outlined', 'gradient']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  children: PropTypes.node.isRequired,
} as any; // Using 'as any' to avoid PropTypes type issues

export default MDButton;
