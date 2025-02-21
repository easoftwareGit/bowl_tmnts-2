import { useEffect } from 'react';

const usePreventUnload = (shouldWarn: () => boolean) => {

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldWarn()) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.preventDefault();        
        return message; // For modern browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldWarn]);
};

export default usePreventUnload;
