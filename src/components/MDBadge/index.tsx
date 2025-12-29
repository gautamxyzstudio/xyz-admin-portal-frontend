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
import { useTheme } from '@mui/material/styles';
import type { MDBadgeProps } from './MDBadge.types';
import MDBadgeRoot from './MDBadgeRoot';
import type { CustomTheme } from '../../theme/theme.types';

const MDBadge = forwardRef<HTMLDivElement, MDBadgeProps>(
  (
    {
      color = 'info',
      variant = 'contained',
      size = 'sm',
      circular = false,
      indicator = false,
      border = false,
      container = false,
      children,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme() as CustomTheme;

    return (
      <MDBadgeRoot
        {...rest}
        ownerState={{
          color,
          variant,
          size,
          circular,
          indicator,
          border,
          container,
          children,
        }}
        ref={ref}
        theme={theme}
      >
        {children}
      </MDBadgeRoot>
    );
  }
);

MDBadge.displayName = 'MDBadge';

export default MDBadge;
