import { renderHook } from '@testing-library/react';
import usePreventUnload from '@/components/preventUnload/preventUnload';

// Mock the addEventListener and removeEventListener
const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

describe('usePreventUnload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add beforeunload event listener on mount', () => {
    const shouldWarn = jest.fn(() => false);
    renderHook(() => usePreventUnload(shouldWarn));

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should remove beforeunload event listener on unmount', () => {
    const shouldWarn = jest.fn(() => false);
    const { unmount } = renderHook(() => usePreventUnload(shouldWarn));

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should prevent unload if shouldWarn returns true', () => {
    const shouldWarn = jest.fn(() => true);
    renderHook(() => usePreventUnload(shouldWarn));

    const event = new Event('beforeunload');
    Object.defineProperty(event, 'returnValue', { writable: true, value: '' });

    window.dispatchEvent(event);

    expect(shouldWarn).toHaveBeenCalled();    
  });

  it('should not prevent unload if shouldWarn returns false', () => {
    const shouldWarn = jest.fn(() => false);
    renderHook(() => usePreventUnload(shouldWarn));

    const event = new Event('beforeunload');
    Object.defineProperty(event, 'returnValue', { writable: true, value: '' });

    window.dispatchEvent(event);

    expect(shouldWarn).toHaveBeenCalled();    
  });
});
