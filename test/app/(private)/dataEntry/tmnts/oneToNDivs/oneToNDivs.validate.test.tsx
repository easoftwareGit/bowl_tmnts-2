// test/app/(private)/dataEntry/tmnts/oneToNDivs/oneToNDivs.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNDivs.tsx validateDivs()
import { validateDivs } from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
import type { divType, AcdnErrType } from "@/lib/types/types";
import {
  divId1,
  divId2,
  mockTmntFullData,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import {
  maxHdcpPer,
  maxHdcpFrom,
  minHdcpPer,
  minHdcpFrom,
} from "@/lib/validation/constants";
import { formatValuePercent2Dec } from "@/lib/currency/formatValue";
import { cloneDeep } from "lodash";

// ---------------------------------------------------------------------------
// expected messages, built the same way validateDivs builds them
// ---------------------------------------------------------------------------
const nameRequiredMsg = "Div Name is required";
const nameUsedMsg = (name: string) => `"${name}" has already been used.`;
const hdcpPerLowMsg =
  "Hdcp % cannot be less than " + formatValuePercent2Dec(minHdcpPer);
const hdcpPerHighMsg =
  "Hdcp % cannot be more than " + formatValuePercent2Dec(maxHdcpPer);
const hdcpFromLowMsg = "Hdcp From cannot be less than " + minHdcpFrom;
const hdcpFromHighMsg = "Hdcp From cannot be more than " + maxHdcpFrom;

const acdnErr = (objName: string, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

const midHdcpPer = (minHdcpPer + maxHdcpPer) / 2;
const midHdcpFrom = Math.floor((minHdcpFrom + maxHdcpFrom) / 2);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid div with no errors; override any field */
const makeDiv = (overrides: Partial<divType> = {}): divType => ({
  ...mockTmntFullData.divs[0],
  hdcp_per: midHdcpPer,
  hdcp_from: midHdcpFrom,
  div_name_err: "",
  hdcp_per_err: "",
  hdcp_from_err: "",
  errClassName: "",
  ...overrides,
});

/** two valid divs with different ids, names and sort orders */
const makeTwoDivs = (
  first: Partial<divType> = {},
  second: Partial<divType> = {},
): [divType, divType] => [
  makeDiv({ id: divId1, div_name: "Scratch", sort_order: 1, ...first }),
  makeDiv({ id: divId2, div_name: "Hdcp", sort_order: 2, ...second }),
];

/** runs validateDivs and returns what it passed to its setters */
const runValidate = (divs: divType[]) => {
  const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result = validateDivs(divs, setDivs, setAcdnErr);

  expect(setDivs).toHaveBeenCalledTimes(1);
  const updated = setDivs.mock.calls[0][0];
  return { result, updated, setAcdnErr };
};

// ---------------------------------------------------------------------------

describe("OneToNDivs - validateDivs", () => {
  describe("all valid", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setAcdnErr } = runValidate(makeTwoDivs());

      expect(result).toBe(true);
      updated.forEach((div) => {
        expect(div.div_name_err).toBe("");
        expect(div.hdcp_per_err).toBe("");
        expect(div.hdcp_from_err).toBe("");
        expect(div.errClassName).toBe("");
      });
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("returns true for an empty array", () => {
      const { result, updated, setAcdnErr } = runValidate([]);

      expect(result).toBe(true);
      expect(updated).toEqual([]);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("clears stale errors and the red highlight from a div that is now valid", () => {
      const divs = [
        makeDiv({
          div_name_err: nameRequiredMsg,
          hdcp_per_err: hdcpPerLowMsg,
          hdcp_from_err: hdcpFromHighMsg,
          errClassName: objErrClassName,
        }),
      ];

      const { result, updated, setAcdnErr } = runValidate(divs);

      expect(result).toBe(true);
      expect(updated[0].div_name_err).toBe("");
      expect(updated[0].hdcp_per_err).toBe("");
      expect(updated[0].hdcp_from_err).toBe("");
      expect(updated[0].errClassName).toBe("");
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("accepts a div name with spaces around it", () => {
      const { result, updated } = runValidate([
        makeDiv({ div_name: "  Scratch  " }),
      ]);

      expect(result).toBe(true);
      expect(updated[0].div_name_err).toBe("");
    });

    it.each([
      ["minimum", minHdcpPer, minHdcpFrom],
      ["maximum", maxHdcpPer, maxHdcpFrom],
    ])(
      "accepts hdcp_per and hdcp_from exactly at the %s",
      (_label, hdcpPer, hdcpFrom) => {
        const { result, updated } = runValidate([
          makeDiv({ hdcp_per: hdcpPer, hdcp_from: hdcpFrom }),
        ]);

        expect(result).toBe(true);
        expect(updated[0].hdcp_per_err).toBe("");
        expect(updated[0].hdcp_from_err).toBe("");
        expect(updated[0].errClassName).toBe("");
      },
    );
  });

  describe("div name", () => {
    it.each([
      ["empty", ""],
      ["only spaces", "   "],
    ])("sets the required error when the name is %s", (_label, name) => {
      const { result, updated, setAcdnErr } = runValidate([
        makeDiv({ div_name: name }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].div_name_err).toBe(nameRequiredMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      // a blank name has nothing to show, so the accordion says "Divisions"
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Divisions", nameRequiredMsg),
      );
    });

    it("sets the duplicate error on the later div only", () => {
      const divs = makeTwoDivs(
        { div_name: "Doubles" },
        { div_name: "Doubles" },
      );

      const { result, updated, setAcdnErr } = runValidate(divs);

      expect(result).toBe(false);
      expect(updated[0].div_name_err).toBe("");
      expect(updated[0].errClassName).toBe("");
      expect(updated[1].div_name_err).toBe(nameUsedMsg("Doubles"));
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Doubles", nameUsedMsg("Doubles")),
      );
    });

    it("finds duplicates regardless of case and extra spaces", () => {
      const divs = makeTwoDivs(
        { div_name: "Senior Scratch" },
        { div_name: "  senior   SCRATCH " },
      );

      const { updated } = runValidate(divs);

      expect(updated[1].div_name_err).toBe(
        nameUsedMsg("  senior   SCRATCH "),
      );
    });
  });

  describe("hdcp % and hdcp from", () => {
    it("sets both 'less than' errors when both values are below the minimum", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeDiv({
          div_name: "Low",
          hdcp_per: minHdcpPer - 0.01,
          hdcp_from: minHdcpFrom - 1,
        }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].hdcp_per_err).toBe(hdcpPerLowMsg);
      expect(updated[0].hdcp_from_err).toBe(hdcpFromLowMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      // the accordion shows the first error found
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Low", hdcpPerLowMsg));
    });

    it("sets both 'more than' errors when both values are above the maximum", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeDiv({
          div_name: "High",
          hdcp_per: maxHdcpPer + 0.01,
          hdcp_from: maxHdcpFrom + 1,
        }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].hdcp_per_err).toBe(hdcpPerHighMsg);
      expect(updated[0].hdcp_from_err).toBe(hdcpFromHighMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("High", hdcpPerHighMsg));
    });

    it("checks hdcp from on its own when hdcp % is valid", () => {
      const { updated, setAcdnErr } = runValidate([
        makeDiv({ div_name: "From", hdcp_from: maxHdcpFrom + 1 }),
      ]);

      expect(updated[0].hdcp_per_err).toBe("");
      expect(updated[0].hdcp_from_err).toBe(hdcpFromHighMsg);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("From", hdcpFromHighMsg));
    });
  });

  describe("several errors", () => {
    it("sets every error on a div, and the accordion shows the name error first", () => {
      const { updated, setAcdnErr } = runValidate([
        makeDiv({
          div_name: "",
          hdcp_per: maxHdcpPer + 0.01,
          hdcp_from: minHdcpFrom - 1,
        }),
      ]);

      expect(updated[0].div_name_err).toBe(nameRequiredMsg);
      expect(updated[0].hdcp_per_err).toBe(hdcpPerHighMsg);
      expect(updated[0].hdcp_from_err).toBe(hdcpFromLowMsg);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Divisions", nameRequiredMsg),
      );
    });

    it("sets errors on every invalid div, and the accordion shows the first div's error", () => {
      const divs = makeTwoDivs(
        { div_name: "" },
        { div_name: "Hdcp Too Big", hdcp_per: maxHdcpPer + 0.01 },
      );

      const { result, updated, setAcdnErr } = runValidate(divs);

      expect(result).toBe(false);
      expect(updated[0].div_name_err).toBe(nameRequiredMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].hdcp_per_err).toBe(hdcpPerHighMsg);
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Divisions", nameRequiredMsg),
      );
    });

    it("clears a fixed div's stale errors while reporting another div's error", () => {
      const divs = makeTwoDivs(
        { div_name_err: nameRequiredMsg, errClassName: objErrClassName },
        { div_name: "Still Invalid", hdcp_per: maxHdcpPer + 0.01 },
      );

      const { result, updated, setAcdnErr } = runValidate(divs);

      expect(result).toBe(false);
      expect(updated[0].div_name_err).toBe("");
      expect(updated[0].errClassName).toBe("");
      expect(updated[1].hdcp_per_err).toBe(hdcpPerHighMsg);
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Still Invalid", hdcpPerHighMsg),
      );
    });

    it("only highlights the divs that have errors", () => {
      const divs = makeTwoDivs({ hdcp_per: maxHdcpPer + 0.01 }, {});

      const { updated } = runValidate(divs);

      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe("");
    });
  });

  describe("what it passes to setDivs", () => {
    it("keeps every div, in order, with its other fields unchanged", () => {
      const divs = makeTwoDivs({ hdcp_per: maxHdcpPer + 0.01 }, {});

      const { updated } = runValidate(divs);

      expect(updated.map((d) => d.id)).toEqual([divId1, divId2]);
      // only the 4 error fields may differ
      updated.forEach((div, i) =>
        expect(div).toEqual({
          ...divs[i],
          div_name_err: expect.any(String),
          hdcp_per_err: expect.any(String),
          hdcp_from_err: expect.any(String),
          errClassName: expect.any(String),
        }),
      );
    });

    it("does not change the divs passed in", () => {
      const divs = makeTwoDivs({ div_name: "" }, {});
      const before = cloneDeep(divs);

      const { updated } = runValidate(divs);

      expect(divs).toEqual(before);
      expect(updated[0]).not.toBe(divs[0]);
    });
  });
});


// // test/app/(private)/dataEntry/tmnts/oneToNDivs/oneToNDivs.validate.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/oneToNDivs.tsx validateDivs()
// import { validateDivs } from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
// import type { divType, AcdnErrType } from "@/lib/types/types";
// import { divId1, divId2, mockTmntFullData } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/(private)/dataEntry/tmntForm/errors";
// import { maxHdcpPer, maxHdcpFrom, minHdcpPer, minHdcpFrom } from "@/lib/validation/constants";

// const baseMockDiv: divType = {
//   ...mockTmntFullData.divs[0],
// }

// // used to create a brand-new div object for each test
// const makeDiv = (overrides: Partial<divType> = {}): divType => ({
//   ...baseMockDiv,
//   ...overrides,
// });

// describe("OneToNDivs - validate", () => { 

//   it("returns true and clears Acdn error when all divs are valid", () => {
//     // create valid div array with one div
//     const divs: divType[] = [makeDiv()];
//     // create new clean mock functions
//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // All field errors should still be blank
//     expect(div.div_name_err).toBe("");
//     expect(div.hdcp_per_err).toBe("");
//     expect(div.hdcp_from_err).toBe("");
//     expect(div.errClassName).toBe("");

//     // Acdn error cleared
//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });
//   it("sets required Div Name error and AcdnErr when div_name is blank", () => {
//     // create invalid divs array with one div
//     const divs: divType[] = [
//       makeDiv({
//         div_name: " ", // invalid
//         tab_title: "",
//       }),
//     ];
//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     expect(div.div_name_err).toBe("Div Name is required");
//     expect(div.errClassName).toBe(objErrClassName);

//     expect(setAcdnErr).toHaveBeenCalledWith({
//       errClassName: acdnErrClassName,
//       message: expect.stringContaining("Div Name is required"),
//     });
//   });  
//   it("sets duplicate name error when two divs share the same name", () => {
//     const baseName = "Doubles";
//     // create invalid divs array with two divs with the same div name
//     const d1 = makeDiv({ id: divId1, div_name: baseName });
//     const d2 = makeDiv({ id: divId2, div_name: baseName, sort_order: d1.sort_order + 1 });

//     const divs: divType[] = [d1, d2];
//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const dupDiv = updatedDivs.find((d) => d.id === divId2)!;

//     expect(dupDiv.div_name_err).toMatch(/already been used/i);
//     expect(dupDiv.errClassName).toBe(objErrClassName);

//     expect(setAcdnErr).toHaveBeenCalledWith({
//       errClassName: acdnErrClassName,
//       message: expect.stringContaining(baseName),
//     });
//   });
//   it("clears div_name_err, errClassName and AcdnErr when a previously blank name is now valid", () => {
//     // simulate an div that *used* to be invalid but now has a valid name
//     const divs: divType[] = [
//       makeDiv({
//         div_name: "Singles",                    // now valid
//         tab_title: "Singles",
//         div_name_err: "Div Name is required",   // stale error from previous run
//         errClassName: objErrClassName,          // stale red highlight
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // error & highlight cleared
//     expect(div.div_name_err).toBe("");
//     expect(div.errClassName).toBe("");

//     // and since there are no errors at all, AcdnErr is cleared
//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });  
//   it("sets number field errors when all number values are less than the minimum", () => {
//     // create invalid divs array with all number fields < 1    
//     const divs: divType[] = [
//       makeDiv({
//         hdcp_per: -1,
//         hdcp_from: -1,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // every number field should show a "< min value" error
//     expect(div.hdcp_per_err).toMatch(/cannot be less than/i);
//     expect(div.hdcp_from_err).toMatch(/cannot be less than/i);

//     // and since there are errors, AcdnErr is set
//     expect(setAcdnErr).toHaveBeenCalledWith({
//       errClassName: acdnErrClassName,
//       message: expect.stringContaining("cannot be less than"), 
//     });    
//   });    
//   it("sets number field errors when all number values are greater than the maximum", () => {
//     // every number value is too large    
//     const divs: divType[] = [
//       makeDiv({
//         hdcp_per: maxHdcpPer + 1,
//         hdcp_from: maxHdcpFrom + 1,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // every money field should show a "> max value" error
//     expect(div.hdcp_per_err).toMatch(/cannot be more than/i);
//     expect(div.hdcp_from_err).toMatch(/cannot be more than/i);
//   });  
//   it("clears text field errors and errClassName when text values are valid", () => {
//     // use valid text values, but keep old errors + highlight to simulate “after user fixes it”
//     const divs: divType[] = [
//       makeDiv({
//         div_name: "Valid Div",  // valid        

//         // stale errors from previous invalid state:
//         div_name_err: "Div Name cannot be blank",        
//         errClassName: objErrClassName,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // all text field errors should now be cleared
//     expect(div.div_name_err).toBe("");    

//     // and the “red highlight” flag is cleared
//     expect(div.errClassName).toBe("");

//     // no accordion error because everything is valid
//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });
//   it("clears number field errors and errClassName when amounts are corrected into valid range", () => {
//     // use valid amounts, but keep old errors + highlight to simulate “after user fixes it”
//     const divs: divType[] = [
//       makeDiv({
//         hdcp_per: 0,      // valid
//         hdcp_from: 230,   // valid

//         // stale errors from previous invalid state:
//         hdcp_per_err: "Hdcp Per cannot be less than 0",
//         hdcp_from_err: "Hdcp From cannot be more than 300",
//         errClassName: objErrClassName,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // all number field errors should now be cleared
//     expect(div.hdcp_per_err).toBe("");
//     expect(div.hdcp_from_err).toBe("");

//     // and the “red highlight” flag is cleared
//     expect(div.errClassName).toBe("");

//     // no accordion error because everything is valid
//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });

//   it("when multiple divs are invalid, AcdnErr is based on the first failing div but errors are set on all invalid divs", () => {
//     // First div: blank name (required error)
//     const firstDiv = makeDiv({
//       id: divId1,
//       div_name: " ", // invalid – triggers "Div Name is required"
//       tab_title: "",
//     });

//     // Second div: valid name, but Hdcp % too large
//     const secondDiv = makeDiv({
//       id: divId2,
//       div_name: "Hdcp Too Big",
//       tab_title: "Hdcp Too Big",
//       hdcp_per: maxHdcpPer + 1,
//     });

//     const divs: divType[] = [firstDiv, secondDiv];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const updatedFirst = updatedDivs.find((d) => d.id === divId1)!;
//     const updatedSecond = updatedDivs.find((d) => d.id === divId2)!;

//     // First div: required-name error + highlight
//     expect(updatedFirst.div_name_err).toBe("Div Name is required");
//     expect(updatedFirst.errClassName).toBe(objErrClassName);

//     // Second div: Hdcp % too large + highlight
//     expect(updatedSecond.hdcp_per_err).toMatch(/cannot be more than/i);
//     expect(updatedSecond.errClassName).toBe(objErrClassName);

//     // AcdnErr should only reflect the *first* error encountered
//     expect(setAcdnErr).toHaveBeenCalledTimes(1);
//     expect(setAcdnErr).toHaveBeenCalledWith({
//       errClassName: acdnErrClassName,
//       message: expect.stringContaining("Div Name is required"),
//     });
//   });

//   it("accepts hdcp_per and hdcp_from exactly at the minimum values", () => {
//     const divs: divType[] = [
//       makeDiv({
//         hdcp_per: minHdcpPer,
//         hdcp_from: minHdcpFrom,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // No errors at exact mins
//     expect(div.hdcp_per_err).toBe("");
//     expect(div.hdcp_from_err).toBe("");
//     expect(div.errClassName).toBe("");

//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });

//   it("accepts hdcp_per and hdcp_from exactly at the maximum values", () => {
//     const divs: divType[] = [
//       makeDiv({
//         hdcp_per: maxHdcpPer,
//         hdcp_from: maxHdcpFrom,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // No errors at exact maxes
//     expect(div.hdcp_per_err).toBe("");
//     expect(div.hdcp_from_err).toBe("");
//     expect(div.errClassName).toBe("");

//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });

//   it("treats div_name with surrounding whitespace as valid (trim only used to detect empty)", () => {
//     const spacedName = `  ${baseMockDiv.div_name}  `;

//     const divs: divType[] = [
//       makeDiv({
//         div_name: spacedName,
//         tab_title: spacedName,
//       }),
//     ];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(true);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const div = updatedDivs[0];

//     // No name error or highlight – whitespace is allowed as long as it's not "all spaces"
//     expect(div.div_name_err).toBe("");
//     expect(div.errClassName).toBe("");

//     expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
//   });

//   it("clears stale errors on one div while still reporting errors for another invalid div", () => {
//     // Div 1: used to be invalid (stale name error), now valid
//     const d1 = makeDiv({
//       id: divId1,
//       div_name: "Now Valid",
//       tab_title: "Now Valid",
//       div_name_err: "Div Name is required", // stale
//       errClassName: objErrClassName,        // stale
//     });

//     // Div 2: still invalid (Hdcp % too large)
//     const d2 = makeDiv({
//       id: divId2,
//       div_name: "Still Invalid",
//       tab_title: "Still Invalid",
//       hdcp_per: maxHdcpPer + 1,
//       // hdcp_from left as baseMockDiv value (valid)
//     });

//     const divs: divType[] = [d1, d2];

//     const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
//     const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

//     const result = validateDivs(divs, setDivs, setAcdnErr);

//     expect(result).toBe(false);
//     expect(setDivs).toHaveBeenCalledTimes(1);

//     const updatedDivs = setDivs.mock.calls[0][0] as divType[];
//     const updated1 = updatedDivs.find((d) => d.id === divId1)!;
//     const updated2 = updatedDivs.find((d) => d.id === divId2)!;

//     // Div 1: stale errors cleared because it's now valid
//     expect(updated1.div_name_err).toBe("");
//     expect(updated1.errClassName).toBe("");

//     // Div 2: still invalid
//     expect(updated2.hdcp_per_err).toMatch(/cannot be more than/i);
//     expect(updated2.errClassName).toBe(objErrClassName);

//     // AcdnErr should reflect the remaining error, not be cleared
//     expect(setAcdnErr).toHaveBeenCalledTimes(1);
//     expect(setAcdnErr).toHaveBeenCalledWith({
//       errClassName: acdnErrClassName,
//       message: expect.stringMatching(/cannot be more than/i),
//     });
//   });

// })

