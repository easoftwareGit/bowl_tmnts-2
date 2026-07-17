import {
  performSave,
  setup,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid ActionComplete edge cases", () => {
  beforeEach(standardBeforeEach);

  describe("non-batchsave request", () => {
    it("ignores ActionComplete events that are not batchsave", async () => {
      const {
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup();

      await triggerActionComplete("refresh");

      expect(onSave).not.toHaveBeenCalled();
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
    });
  });

  describe("save not requested", () => {
    it("ignores batchsave events when a save was not requested", async () => {
      const {
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup();

      await triggerActionComplete("batchsave");

      expect(onSave).not.toHaveBeenCalled();
      expect(onSaveComplete).not.toHaveBeenCalled();
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
      expect(setRows).not.toHaveBeenCalled();
    });
  });

  describe("empty rows", () => {
    it("does not call onSave when there are no rows", async () => {
      const {
        user,
        onSave,
        onSaveComplete,
        onNavigateAfterSave,
        setRows,
        triggerActionComplete,
      } = setup({
        rows: [],
        currentRows: [],
        totalPrizeFund: 0,
      });

      await performSave(
        user,
        triggerActionComplete,
      );

      expect(onSave).not.toHaveBeenCalled();

      expect(onSaveComplete).toHaveBeenCalledTimes(1);
      expect(onSaveComplete).toHaveBeenCalledWith([]);

      expect(setRows).toHaveBeenCalledTimes(1);
      expect(setRows).toHaveBeenCalledWith([]);
      
      expect(onNavigateAfterSave).not.toHaveBeenCalled();
    });
  });

  describe("public grid handle", () => {
    it("returns an empty array when the grid contains no rows", () => {
      const {
        gridHandleRef,
      } = setup({
        rows: [],
        currentRows: [],
        totalPrizeFund: 0,
      });

      expect(gridHandleRef.current).not.toBeNull();

      expect(
        gridHandleRef.current?.getCurrentRows(),
      ).toEqual([]);
    });
  });  
});