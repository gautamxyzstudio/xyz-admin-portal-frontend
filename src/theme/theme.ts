import { outlinedInputClasses } from '@mui/material';
import { createTheme } from '@mui/material/styles';
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7312',
    },
    secondary: {
      main: '#CCD4F2',
      dark: '#868686',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '--TextField-brandBorderColor': '#E0E3E7',
          '--TextField-brandBorderHoverColor': '#B2BAC2',
          '--TextField-brandBorderFocusedColor': '#6F7E8C',
          '& label.Mui-focused': {
            color: 'var(--TextField-brandBorderFocusedColor)',
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#EBEBEB',
        },
        root: {
          '--mui-palette-common-onBackgroundChannel': '#B2BAC2',
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: 'var(--mui-palette-common-onBackgroundChannel)',
          },
          [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: 'var(--mui-palette-common-onBackgroundChannel)',
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&::before': {
            borderBottom: '2px solid var(--TextField-brandBorderColor)',
          },
          '&:hover:not(.Mui-disabled, .Mui-error):before': {
            borderBottom: '2px solid var(--TextField-brandBorderHoverColor)',
          },
          '&.Mui-focused:after': {
            borderBottom: '2px solid var(--TextField-brandBorderFocusedColor)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {},
    },
    MuiDialog: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;
