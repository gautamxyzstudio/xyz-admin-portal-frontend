import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

interface MDBoxProps {
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: number | string;
  boxShadow?: string;
  gradient?: boolean;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

const MDBox = ({
  bgColor = 'transparent',
  color = 'inherit',
  opacity = 1,
  borderRadius = 0,
  boxShadow = 'none',
  gradient = false,
  sx,
  children,
  ...rest
}: MDBoxProps & React.ComponentProps<typeof Box>) => {
  return (
    <Box
      {...rest}
      sx={{
        opacity,
        color,
        background: gradient
          ? 'linear-gradient(195deg, #EC407A, #D81B60)'
          : bgColor,
        borderRadius,
        boxShadow,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default MDBox;
