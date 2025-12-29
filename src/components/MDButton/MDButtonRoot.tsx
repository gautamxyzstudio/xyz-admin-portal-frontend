import Button, { type ButtonProps } from '@mui/material/Button';

interface MDButtonProps extends ButtonProps {
  gradient?: boolean;
  circular?: boolean;
  iconOnly?: boolean;
}

const MDButton = ({
  gradient = false,
  circular = false,
  iconOnly = false,
  sx,
  children,
  ...rest
}: MDButtonProps) => {
  return (
    <Button
      {...rest}
      sx={{
        ...(gradient && {
          background: 'linear-gradient(195deg, #EC407A, #D81B60)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(195deg, #D81B60, #C2185B)',
          },
        }),

        ...(circular && {
          borderRadius: '999px',
        }),

        ...(iconOnly && {
          minWidth: 40,
          width: 40,
          height: 40,
          padding: 0,
        }),

        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

export default MDButton;
