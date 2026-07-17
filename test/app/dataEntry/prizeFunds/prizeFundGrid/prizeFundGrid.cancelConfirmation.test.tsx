import { screen } from "@testing-library/react";
import {
  getLatestConfirmModalProps,
  mockBatchCancel,
  mockClearSelection,
  openCancelConfirmation,
  setup,
  makeRows,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid cancel confirmation", () => {
  beforeEach(standardBeforeEach);

  describe("Yes", () => {
    it("cancels the batch edit, clears the selection, resets the grid, and closes the dialog", async () => {
      const {
        user,
        gridHandleRef,
        onGridDataReset,
      } = setup();

      expect(gridHandleRef.current).not.toBeNull();
      expect(gridHandleRef.current?.getCurrentRows).toEqual(
        expect.any(Function),
      );      

      await openCancelConfirmation(user);

      expect(getLatestConfirmModalProps()?.show).toBe(true);

      await user.click(
        screen.getByRole("button", {
          name: "Yes",
        }),
      );

      expect(mockBatchCancel).toHaveBeenCalledTimes(1);
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
      expect(onGridDataReset).toHaveBeenCalledTimes(1);

      expect(
        screen.queryByRole("dialog"),
      ).not.toBeInTheDocument();

      expect(getLatestConfirmModalProps()?.show).toBe(false);

      expect(
        gridHandleRef.current?.getCurrentRows(),
      ).toEqual(makeRows());
    });
  });

  describe("No", () => {
    it("closes the dialog without cancelling the edit", async () => {
      const {
        user,
        gridHandleRef,
        onGridDataReset,
      } = setup();

      expect(gridHandleRef.current).not.toBeNull();
      expect(gridHandleRef.current?.getCurrentRows).toEqual(
        expect.any(Function),
      );

      await openCancelConfirmation(user);

      expect(getLatestConfirmModalProps()?.show).toBe(true);

      await user.click(
        screen.getByRole("button", {
          name: "No",
        }),
      );      

      expect(mockBatchCancel).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
      expect(onGridDataReset).not.toHaveBeenCalled();

      expect(
        screen.queryByRole("dialog"),
      ).not.toBeInTheDocument();

      expect(getLatestConfirmModalProps()?.show).toBe(false);
      
      expect(mockClearSelection).not.toHaveBeenCalled();
    });
  });
});