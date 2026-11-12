import { outlinedInputClasses } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

/*
 * Dropdown / calendar popups below share the look and motion of the themed
 * components (src/components/Themed*.tsx). Keyframes (tdd-in, tdd-option-in,
 * tdd-line, tdd-pop) and colours (--primary*) come from index.css.
 */
const PRIMARY = '#F17C04'; // same as --primary in index.css

const panel = {
  borderRadius: 12,
  border: '1px solid color-mix(in srgb, var(--primary) 22%, #fff)',
  boxShadow:
    '0 12px 28px -8px color-mix(in srgb, var(--primary) 28%, transparent), 0 4px 10px -4px rgba(0,0,0,0.08)',
  animation: 'tdd-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
  // thin theme line along the top
  backgroundImage:
    'linear-gradient(90deg, var(--primary-50), var(--primary), var(--primary-50))',
  backgroundSize: '100% 2px',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#fff',
} as const;

const item = {
  position: 'relative',
  margin: '0 4px',
  borderRadius: 8,
  fontSize: '0.8125rem',
  transition: 'background-color .15s ease, color .15s ease, padding-left .18s ease',
  animation: 'tdd-option-in 0.22s ease-out both',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 4,
    top: '50%',
    width: 3,
    height: 0,
    borderRadius: 3,
    background: 'var(--primary)',
    transform: 'translateY(-50%)',
    transition: 'height .18s ease',
  },
} as const;

const itemActive = {
  backgroundColor: 'color-mix(in srgb, var(--primary-20) 70%, #fff)',
  color: 'var(--primary)',
  '&::before': { height: '55%' },
} as const;

const itemSelected = {
  backgroundColor: 'color-mix(in srgb, var(--primary-20) 45%, #fff)',
  color: 'var(--primary)',
  fontWeight: 600,
} as const;

const dayBtn = {
  fontSize: '0.75rem',
  transition:
    'background-color .15s ease, color .15s ease, transform .18s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    backgroundColor: 'var(--primary-20)',
    color: 'var(--primary)',
    transform: 'scale(1.08)',
  },
  '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: 600,
    boxShadow: '0 4px 10px -3px color-mix(in srgb, var(--primary) 60%, transparent)',
    animation: 'tdd-pop .25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
} as const;

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY,
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

    /* ---------- dropdowns: Autocomplete, Select, Menu ---------- */
    MuiAutocomplete: {
      styleOverrides: {
        paper: { ...panel, marginTop: 6 },
        listbox: {
          padding: '6px 0',
          '& .MuiAutocomplete-option': {
            ...item,
            minHeight: 34,
            '&.Mui-focused': { ...itemActive, paddingLeft: 22 },
            '&[aria-selected="true"]': itemSelected,
            '&[aria-selected="true"].Mui-focused': { ...itemActive, fontWeight: 600 },
          },
        },
        noOptions: { fontSize: '0.75rem', color: '#9ca3af' },
        loading: { fontSize: '0.75rem', color: '#9ca3af' },
        popupIndicator: {
          transition: 'transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), color .2s ease',
        },
        popupIndicatorOpen: { color: 'var(--primary)' },
        tag: {
          backgroundColor: 'var(--primary-20)',
          color: 'var(--primary)',
          fontWeight: 500,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { ...panel, marginTop: 4 },
        list: { padding: '6px 0' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...item,
          minHeight: 34,
          '&:hover, &.Mui-focusVisible': { ...itemActive, paddingLeft: 22 },
          '&.Mui-selected': itemSelected,
          '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': { ...itemActive, fontWeight: 600 },
        },
      },
    },

    /* ---------- date & time pickers ---------- */
    MuiPickerPopper: {
      styleOverrides: {
        root: { zIndex: 1600 },
        paper: { ...panel, marginTop: 6 },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        label: { fontSize: '0.8125rem', fontWeight: 600, color: '#333' },
        switchViewButton: {
          '&:hover': { backgroundColor: 'var(--primary-20)', color: 'var(--primary)' },
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          transition: 'background-color .15s ease, color .15s ease, transform .15s ease',
          '&:hover': { backgroundColor: 'var(--primary-20)', color: 'var(--primary)' },
          '&:active': { transform: 'scale(0.9)' },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: { fontSize: '0.6875rem', fontWeight: 600, color: '#9a9a9a' },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: dayBtn,
        today: {
          '&:not(.Mui-selected)': {
            border: '1px solid var(--primary-50)',
            fontWeight: 600,
          },
        },
      },
    },
    MuiYearCalendar: {
      styleOverrides: {
        button: dayBtn,
      },
    },
    MuiMonthCalendar: {
      styleOverrides: {
        button: dayBtn,
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        actionBar: {
          '& .MuiButton-root': {
            borderRadius: 999,
            fontSize: '0.75rem',
            textTransform: 'none',
            fontWeight: 500,
            color: 'var(--primary)',
            backgroundColor: 'color-mix(in srgb, var(--primary-20) 60%, #fff)',
            padding: '4px 14px',
            '&:hover': { backgroundColor: 'var(--primary)', color: '#fff' },
          },
        },
      },
    },
    MuiPickersToolbar: {
      styleOverrides: {
        root: {
          '& .MuiPickersToolbarText-root.Mui-selected': { color: 'var(--primary)' },
        },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: { backgroundColor: 'var(--primary)' },
        thumb: { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' },
      },
    },
    MuiClock: {
      styleOverrides: {
        pin: { backgroundColor: 'var(--primary)' },
        clock: { backgroundColor: 'color-mix(in srgb, var(--primary-20) 45%, #fff)' },
      },
    },
  },
});

export default theme;
