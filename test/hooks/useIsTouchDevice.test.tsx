import React from "react";
import { render, screen } from "@testing-library/react";
import { useIsTouchDevice } from "../../src/hooks/useIsTouchDevice";

jest.mock("../../src/lib/mobileDevices/mobileDevices", () => ({
  isTouchDevice: jest.fn(),
}));

import { isTouchDevice } from "../../src/lib/mobileDevices/mobileDevices";

const TestComponent = () => {
  const isTouch = useIsTouchDevice();

  return <div>{isTouch ? "touch" : "not-touch"}</div>;
};

describe("useIsTouchDevice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates to true when isTouchDevice returns true", async () => {
    (isTouchDevice as jest.Mock).mockReturnValue(true);

    render(<TestComponent />);

    expect(await screen.findByText("touch")).toBeInTheDocument();
  });

  it("stays false when isTouchDevice returns false", async () => {
    (isTouchDevice as jest.Mock).mockReturnValue(false);

    render(<TestComponent />);

    expect(await screen.findByText("not-touch")).toBeInTheDocument();
  });

  it("calls isTouchDevice exactly once", async () => {
    (isTouchDevice as jest.Mock).mockReturnValue(true);

    render(<TestComponent />);

    await screen.findByText("touch");

    expect(isTouchDevice).toHaveBeenCalledTimes(1);
  });

  it("does not re-run effect on re-render", async () => {
    (isTouchDevice as jest.Mock).mockReturnValue(true);

    const { rerender } = render(<TestComponent />);

    await screen.findByText("touch");

    rerender(<TestComponent />);

    expect(isTouchDevice).toHaveBeenCalledTimes(1);
  });
});