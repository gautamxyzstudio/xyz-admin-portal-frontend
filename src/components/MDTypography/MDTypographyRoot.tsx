import Typography, { type TypographyProps } from '@mui/material/Typography';

interface MDTypographyProps extends TypographyProps {
  textGradient?: boolean;
  opacity?: number;
}

const MDTypography = ({
  textGradient = false,
  opacity = 1,
  sx,
  children,
  ...rest
}: MDTypographyProps) => {
  return (
    <Typography
      {...rest}
      sx={{
        opacity,
        ...(textGradient && {
          background: 'linear-gradient(195deg, #EC407A, #D81B60)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default MDTypography;
