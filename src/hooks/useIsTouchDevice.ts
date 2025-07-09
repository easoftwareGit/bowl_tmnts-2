import { useEffect, useState } from 'react';
import { isTouchDevice } from '@/lib/mobileDevices/mobileDevices';

// Public React hook
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
};
