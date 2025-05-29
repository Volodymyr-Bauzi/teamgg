import * as React from 'react';
import {toast as sonnerToast, Toaster as SonnerToaster} from 'sonner';

type ToasterProps = Parameters<typeof sonnerToast>[0];

export function useToast() {
  const toast = React.useCallback((props: ToasterProps) => {
    sonnerToast(props);
  }, []);

  return {
    toast,
  };
}
