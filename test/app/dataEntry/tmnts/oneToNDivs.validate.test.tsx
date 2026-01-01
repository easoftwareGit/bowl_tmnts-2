import { validateDivs } from "@/app/dataEntry/tmntForm/oneToNDivs";
import { divType, AcdnErrType } from "@/lib/types/types";
import { divId1, divId2, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { maxHdcpPer, maxHdcpFrom } from "@/lib/validation";

const baseMockDiv: divType = {
  ...mockTmntFullData.divs[0],
}

// used to create a brand-new div object for each test
const makeDiv = (overrides: Partial<divType> = {}): divType => ({
  ...baseMockDiv,
  ...overrides,
});

describe("validate Divisions", () => { 

  it("returns true and clears Acdn error when all divs are valid", () => {
    // create valid div array with one div
    const divs: divType[] = [makeDiv()];
    // create new clean mock functions
    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(true);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // All field errors should still be blank
    expect(div.div_name_err).toBe("");
    expect(div.hdcp_per_err).toBe("");
    expect(div.hdcp_from_err).toBe("");
    expect(div.errClassName).toBe("");

    // Acdn error cleared
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("sets required Div Name error and AcdnErr when div_name is blank", () => {
    // create invalid divs array with one div
    const divs: divType[] = [
      makeDiv({
        div_name: " ", // invalid
        tab_title: "",
      }),
    ];
    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(false);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    expect(div.div_name_err).toBe("Div Name is required");
    expect(div.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("Div Name is required"),
    });
  });  
  it("sets duplicate name error when two divs share the same name", () => {
    const baseName = "Doubles";
    // create invalid divs array with two divs with the same div name
    const d1 = makeDiv({ id: divId1, div_name: baseName });
    const d2 = makeDiv({ id: divId2, div_name: baseName, sort_order: d1.sort_order + 1 });

    const divs: divType[] = [d1, d2];
    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(false);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const dupDiv = updatedDivs.find((d) => d.id === divId2)!;

    expect(dupDiv.div_name_err).toMatch(/already been used/i);
    expect(dupDiv.errClassName).toBe(objErrClassName);

    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining(baseName),
    });
  });
  it("clears div_name_err, errClassName and AcdnErr when a previously blank name is now valid", () => {
    // simulate an div that *used* to be invalid but now has a valid name
    const divs: divType[] = [
      makeDiv({
        div_name: "Singles",                    // now valid
        tab_title: "Singles",
        div_name_err: "Div Name is required",   // stale error from previous run
        errClassName: objErrClassName,          // stale red highlight
      }),
    ];

    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(true);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // error & highlight cleared
    expect(div.div_name_err).toBe("");
    expect(div.errClassName).toBe("");

    // and since there are no errors at all, AcdnErr is cleared
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });  
  it("sets number field errors when all number values are less than the minimum", () => {
    // create invalid divs array with all number fields < 1    
    const divs: divType[] = [
      makeDiv({
        hdcp_per: -1,
        hdcp_from: -1,
      }),
    ];

    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(false);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // every number field should show a "< min value" error
    expect(div.hdcp_per_err).toMatch(/cannot be less than/i);
    expect(div.hdcp_from_err).toMatch(/cannot be less than/i);

    // and since there are errors, AcdnErr is set
    expect(setAcdnErr).toHaveBeenCalledWith({
      errClassName: acdnErrClassName,
      message: expect.stringContaining("cannot be less than"), 
    });    
  });    
  it("sets number field errors when all number values are greater than the maximum", () => {
    // every number value is too large    
    const divs: divType[] = [
      makeDiv({
        hdcp_per: maxHdcpPer + 1,
        hdcp_from: maxHdcpFrom + 1,
      }),
    ];

    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(false);
    expect(setDivs).toHaveBeenCalledTimes(1);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // every money field should show a "> max value" error
    expect(div.hdcp_per_err).toMatch(/cannot be more than/i);
    expect(div.hdcp_from_err).toMatch(/cannot be more than/i);
  });  
  it("clears text field errors and errClassName when text values are valid", () => {
    // use valid text values, but keep old errors + highlight to simulate “after user fixes it”
    const divs: divType[] = [
      makeDiv({
        div_name: "Valid Div",  // valid        

        // stale errors from previous invalid state:
        div_name_err: "Div Name cannot be blank",        
        errClassName: objErrClassName,
      }),
    ];

    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(true);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // all text field errors should now be cleared
    expect(div.div_name_err).toBe("");    

    // and the “red highlight” flag is cleared
    expect(div.errClassName).toBe("");

    // no accordion error because everything is valid
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });
  it("clears number field errors and errClassName when amounts are corrected into valid range", () => {
    // use valid amounts, but keep old errors + highlight to simulate “after user fixes it”
    const divs: divType[] = [
      makeDiv({
        hdcp_per: 0,      // valid
        hdcp_from: 230,   // valid

        // stale errors from previous invalid state:
        hdcp_per_err: "Hdcp Per cannot be less than 0",
        hdcp_from_err: "Hdcp From cannot be more than 300",
        errClassName: objErrClassName,
      }),
    ];

    const setDivs = jest.fn() as jest.Mock<void, [divType[]]>;
    const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

    const result = validateDivs(divs, setDivs, setAcdnErr);

    expect(result).toBe(true);

    const updatedDivs = setDivs.mock.calls[0][0] as divType[];
    const div = updatedDivs[0];

    // all number field errors should now be cleared
    expect(div.hdcp_per_err).toBe("");
    expect(div.hdcp_from_err).toBe("");

    // and the “red highlight” flag is cleared
    expect(div.errClassName).toBe("");

    // no accordion error because everything is valid
    expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
  });

})