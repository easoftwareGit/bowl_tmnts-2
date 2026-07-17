import {
  clickEdit,
  mockEditCell,
  mockSelectCell,
  setup,
  makeRows,
  standardBeforeEach,
} from "./prizeFundGrid.testSetup";

describe("PrizeFundGrid record selection", () => {
  beforeEach(standardBeforeEach);

  describe("recordClick", () => {
    it("starts editing the clicked row when Edit is selected", async () => {
      const {
        user,
        gridHandleRef,
        triggerRecordClick,
      } = setup();

      expect(gridHandleRef.current).not.toBeNull();
      expect(gridHandleRef.current?.getCurrentRows).toEqual(
        expect.any(Function),
      );

      triggerRecordClick(2);

      await clickEdit(user);

      expect(mockSelectCell).toHaveBeenCalledWith({
        rowIndex: 2,
        cellIndex: 2,
      });

      expect(mockEditCell).toHaveBeenCalledWith(
        2,
        "amount",
      );

      expect(gridHandleRef.current?.getCurrentRows()).toEqual(
        makeRows(),
      );      
    });    
  });

  describe("recordDoubleClick", () => {
    it("starts editing the double-clicked row when Edit is selected", async () => {
      const {
        user,
        gridHandleRef,
        triggerRecordDoubleClick,
      } = setup();

      expect(gridHandleRef.current).not.toBeNull();
      expect(gridHandleRef.current?.getCurrentRows).toEqual(
        expect.any(Function),
      );

      triggerRecordDoubleClick(1);

      await clickEdit(user);

      expect(mockSelectCell).toHaveBeenCalledWith({
        rowIndex: 1,
        cellIndex: 2,
      });

      expect(mockEditCell).toHaveBeenCalledWith(
        1,
        "amount",
      );

      expect(gridHandleRef.current?.getCurrentRows()).toEqual(
        makeRows(),
      );      
    });
  });
});