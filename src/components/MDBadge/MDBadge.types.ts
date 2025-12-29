import { ReactNode } from 'react';

export type MDBadgeColor =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'dark';

export type MDBadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type MDBadgeVariant = 'gradient' | 'contained';

export interface MDBadgeProps {
  color?: MDBadgeColor;
  variant?: MDBadgeVariant;
  size?: MDBadgeSize;
  circular?: boolean;
  indicator?: boolean;
  border?: boolean;
  container?: boolean;
  children?: ReactNode;
}

export interface MDBadgeOwnerState extends MDBadgeProps {
  color: MDBadgeColor;
}
