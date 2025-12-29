'use client';

import { useContext } from 'react';
import { SnackBarContext } from './SnackbarProvider';


export const useSnackBarContext = () => {
  const context = useContext(SnackBarContext);

  if (!context) {
    throw new Error(
      'useSnackBarContext must be used within a SnackBarProvider'
    );
  }

  return context;
};
