import { validatePots } from "@/app/dataEntry/tmntForm/zeroToNPots";
import type { potType, AcdnErrType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { maxMoney, minFee } from "@/lib/validation/validation";

const baseMockPot: potType = {
  ...mockTmntFullData.pots[0],  // assumes you have at least 1 mock pot
};
const div1Name = mockTmntFullData.divs[0].div_name;

// helper like your other files
const makePot = (overrides: Partial<potType> = {}): potType => ({
  ...baseMockPot,
  ...overrides,
});

describe("zeroToNPots - validate", () => { 

  describe("validatePots", () => {
    it("returns true and clears Acdn error when all pots are valid", () => {
      const pots: potType[] = [
        makePot({
          fee: minFee.toString(), // valid lower bound
          fee_err: "stale error",
          errClassName: objErrClassName,
        }),
      ];

      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      expect(result).toBe(true);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      const pot = updatedPots[0];

      expect(pot.fee_err).toBe("");
      expect(pot.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });
    it("sets fee error when fee is less than the minimum", () => {
      const underMin = (minFee - 0.01).toString();

      const pots: potType[] = [
        makePot({
          fee: underMin,
        }),
      ];

      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      expect(result).toBe(false);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      const pot = updatedPots[0];

      expect(pot.fee_err).toMatch(/cannot be less than/i);
      expect(pot.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Fee cannot be less than"),
      });
    });
    it("sets fee error when fee is greater than the maximum", () => {
      const overMax = (maxMoney + 1).toString();

      const pots: potType[] = [
        makePot({
          fee: overMax,
        }),
      ];

      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      expect(result).toBe(false);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      const pot = updatedPots[0];

      expect(pot.fee_err).toMatch(/cannot be more than/i);
      expect(pot.errClassName).toBe(objErrClassName);

      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining("Fee cannot be more than"),
      });
    });
    it("sets fee error when fee is not a number", () => {
      const pots = [makePot({ fee: "abc" as any })];
      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      expect(result).toBe(false);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      const pot = updatedPots[0];
      expect(pot.fee_err).toBe("Invalid Fee");
    });    
    it('clears fee error when fee is valid', () => { 
      const pots: potType[] = [
        makePot({
          fee: minFee.toString(), // valid lower bound
          fee_err: "stale error",
          errClassName: objErrClassName,
        }),
      ];

      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      expect(result).toBe(true);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      const pot = updatedPots[0];

      expect(pot.fee_err).toBe("");
      expect(pot.errClassName).toBe("");

      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    })
    it("marks only the invalid pot and uses its name in accordion error", () => {
      const pots = [
        makePot({
          fee: minFee.toString(),
          pot_type: 'Game',
        }),
        makePot({
          fee: (minFee - 0.01).toString(),
          pot_type: 'Series',
        })
      ];
      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      expect(updatedPots[0].fee_err).toBe("");
      expect(updatedPots[1].fee_err).toMatch(/cannot be less than/i);
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(updatedPots[1].pot_type),
      });
    });   
    it('only calls setAcdnErr on the first pot with error when multiple pots have errors', () => {
      const pots = [
        makePot({
          fee: (minFee - 0.01).toString(), 
          pot_type: 'Game',
        }),
        makePot({
          fee: (minFee - 0.02).toString(),
          pot_type: 'Series',
        })
      ];
      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      expect(updatedPots[0].fee_err).toMatch(/cannot be less than/i);
      expect(updatedPots[1].fee_err).toMatch(/cannot be less than/i);
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(updatedPots[0].pot_type),
      });  
      expect(setAcdnErr).not.toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(updatedPots[1].pot_type),
      });  
    })
    it('only calls setAcdnErr on the second pot when first pot has no errors and second has errors', () => {
      const pots = [
        makePot({
          fee: (minFee).toString(), // no errors
          pot_type: 'Game',
        }),
        makePot({
          fee: (minFee - 0.02).toString(),
          pot_type: 'Series',
        })
      ];
      const setPots = jest.fn() as jest.Mock<void, [potType[]]>;
      const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

      const result = validatePots(pots, setPots, mockTmntFullData.divs, setAcdnErr);

      const updatedPots = setPots.mock.calls[0][0] as potType[];
      expect(updatedPots[0].fee_err).toBe("");
      expect(updatedPots[1].fee_err).toMatch(/cannot be less than/i);
      expect(setAcdnErr).not.toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(updatedPots[0].pot_type),
      });  
      expect(setAcdnErr).toHaveBeenCalledWith({
        errClassName: acdnErrClassName,
        message: expect.stringContaining(updatedPots[1].pot_type),
      });  
    })

  });

})

