import { screen } from "@testing-library/react";
import {
  clickToolbarButton,
  getLatestConfirmModalProps,
  mockBatchCancel,
  mockClearSelection,
  mockEditCell,
  mockSelectCell,
  setup,
  standardBeforeEach,
  mockBatchSave,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid toolbar", () => {
  beforeEach(standardBeforeEach);

  describe("Edit", () => {
    it("starts editing the first row when no row has been selected", async () => {
      const { user } = setup();

      await clickToolbarButton(user, "Edit");

      expect(mockSelectCell).toHaveBeenCalledWith({
        rowIndex: 0,
        cellIndex: 2,
      });

      expect(mockEditCell).toHaveBeenCalledWith(
        0,
        "amount",
      );
    });

    it("starts editing the previously selected row", async () => {
      const {
        user,
        triggerRecordClick,
      } = setup();

      triggerRecordClick(2);

      await clickToolbarButton(user, "Edit");

      expect(mockSelectCell).toHaveBeenCalledWith({
        rowIndex: 2,
        cellIndex: 2,
      });

      expect(mockEditCell).toHaveBeenCalledWith(
        2,
        "amount",
      );
    });
  });

  describe("Back", () => {
    it("calls onBack", async () => {
      const {
        user,
        onBack,
      } = setup();

      await clickToolbarButton(user, "Back");

      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cancel", () => {
    it("opens the confirmation dialog", async () => {
      const {
        user,
      } = setup();

      await clickToolbarButton(user, "Cancel");

      expect(
        screen.getByRole("dialog"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Do you want to cancel edits?"),
      ).toBeInTheDocument();

      expect(
        getLatestConfirmModalProps()?.show,
      ).toBe(true);
    });

    it("clicking No closes the dialog", async () => {
      const {
        user,
      } = setup();

      await clickToolbarButton(user, "Cancel");

      await user.click(
        screen.getByRole("button", {
          name: "No",
        }),
      );

      expect(
        screen.queryByRole("dialog"),
      ).not.toBeInTheDocument();

      expect(mockBatchCancel).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it("clicking Yes cancels the batch edit", async () => {
      const {
        user,
      } = setup();

      await clickToolbarButton(user, "Cancel");

      await user.click(
        screen.getByRole("button", {
          name: "Yes",
        }),
      );

      expect(mockBatchCancel).toHaveBeenCalledTimes(1);
    });

    it("clicking Yes clears the grid selection and resets the grid state", async () => {
      const {
        user,
        onGridDataReset,
      } = setup();

      await clickToolbarButton(user, "Cancel");

      await user.click(
        screen.getByRole("button", {
          name: "Yes",
        }),
      );

      expect(mockClearSelection).toHaveBeenCalledTimes(1);

      expect(onGridDataReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Save", () => {
    it("clicking Save starts a batch save", async () => {
      const {
        user,
      } = setup();

      await clickToolbarButton(user, "Save");

      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });

    it("clicking Save and Close starts a batch save", async () => {
      const {
        user,
      } = setup();

      await clickToolbarButton(user, "Save and Close");

      expect(mockBatchSave).toHaveBeenCalledTimes(1);
    });    
  });

});