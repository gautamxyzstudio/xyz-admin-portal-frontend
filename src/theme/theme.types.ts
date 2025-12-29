import { Theme as MuiTheme } from '@mui/material/styles';

interface CustomPalette {
  white: {
    main: string;
  };
  dark: {
    main: string;
  };
  gradients: {
    [key: string]: {
      main: string;
      state: string;
    };
  };
  badgeColors: {
    [key: string]: {
      background: string;
      text: string;
    };
  };
}

interface CustomTypography {
  size: {
    xxs: string;
    xs: string;
  };
  fontWeightBold: number;
}

interface CustomBorders {
  borderRadius: {
    section: string;
    md: string;
  };
  borderWidth: string[];
}

interface CustomFunctions {
  pxToRem: (value: number) => string;
  linearGradient: (color1: string, color2: string) => string;
}

export interface CustomTheme extends MuiTheme {
  palette: MuiTheme['palette'] & CustomPalette;
  typography: MuiTheme['typography'] & CustomTypography;
  borders: CustomBorders;
  functions: CustomFunctions;
}
