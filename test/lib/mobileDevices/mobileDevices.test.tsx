import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";

describe('isTouchDevice', () => {
  let originalNavigator: any;

  beforeAll(() => {
    // Save original navigator so we can restore it
    originalNavigator = { ...navigator };
  });

  afterEach(() => {
    // Restore original values after each test
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalNavigator.maxTouchPoints || 0,
      configurable: true,
    });
  });

  test('returns true when ontouchstart is in window', () => {
    (window as any).ontouchstart = () => {};
    expect(isTouchDevice()).toBe(true);
  });

  test('returns true when navigator.maxTouchPoints > 0', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });
    expect(isTouchDevice()).toBe(true);
  });

  test('returns false when no touch capabilities are detected', () => {
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
    expect(isTouchDevice()).toBe(false);
  });
});
