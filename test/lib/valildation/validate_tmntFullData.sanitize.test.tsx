import { sanitizeFullTmnt } from "@/lib/validation/tmnts/full/validate";
import { mockTmntFullData } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools";
import { sanitizeTmnt } from "@/lib/validation/tmnts/valildate";
import { sanitizeEvent } from "@/lib/validation/events/validate";
import { sanitizeDiv } from "@/lib/validation/divs/validate";
import { sanitizeSquad } from "@/lib/validation/squads/validate";
import { sanitizeFullStage } from "@/lib/validation/stages/validate";
import { sanitizeLane } from "@/lib/validation/lanes/validate";
import { sanitizePot } from "@/lib/validation/pots/validate";
import { sanitizeBrkt } from "@/lib/validation/brkts/validate";
import { sanitizeElim } from "@/lib/validation/elims/validate";
import { sanitizePlayer } from "@/lib/validation/players/validate";
import { sanitizeDivEntry } from "@/lib/validation/divEntries/validate";
import { sanitizePotEntry } from "@/lib/validation/potEntries/validate";
import { sanitizeBrktEntry } from "@/lib/validation/brktEntries/validate";
import { sanitizeOneBrkt } from "@/lib/validation/oneBrkts/valildate";
import { sanitizeBrktSeed } from "@/lib/validation/brktSeeds/validate";
import { sanitizeElimEntry } from "@/lib/validation/elimEntries/validate";
import type {
  tmntFullType,
  tmntType,
  eventType,
  divType,
  squadType,
  fullStageType,
  laneType,
  potType,
  brktType,
  elimType,
  playerType,
  divEntryType,
  potEntryType,
  brktEntryType,
  oneBrktType,
  brktSeedType,
  elimEntryType,
} from "@/lib/types/types";
import { cloneDeep } from "lodash";

// Mocks

// We want to test *composition*, not each sanitizer’s internal logic.
// So each sanitizer returns a tagged object we can assert on.
// Mocks must match the REAL import paths used by src/lib/validation/tmnts/full/validate.ts
jest.mock("@/app/dataEntry/tmntForm/tmntTools", () => ({
  getBlankTmntFullData: jest.fn(),
}));

jest.mock("@/lib/validation/tmnts/valildate", () => ({
  sanitizeTmnt: jest.fn(),
  validateTmnt: jest.fn(),
}));

jest.mock("@/lib/validation/events/validate", () => ({
  sanitizeEvent: jest.fn(),
  validateEvents: jest.fn(),
}));

jest.mock("@/lib/validation/lanes/validate", () => ({
  sanitizeLane: jest.fn(),
  validateLanes: jest.fn(),
}));

jest.mock("@/lib/validation/oneBrkts/valildate", () => ({
  sanitizeOneBrkt: jest.fn(),
  validateOneBrkts: jest.fn(),
}));

jest.mock("@/lib/validation/players/validate", () => ({
  sanitizePlayer: jest.fn(),
  validatePlayers: jest.fn(),
}));

jest.mock("@/lib/validation/pots/validate", () => ({
  sanitizePot: jest.fn(),
  validatePots: jest.fn(),
}));

jest.mock("@/lib/validation/potEntries/validate", () => ({
  sanitizePotEntry: jest.fn(),
  validatePotEntries: jest.fn(),
}));

jest.mock("@/lib/validation/squads/validate", () => ({
  sanitizeSquad: jest.fn(),
  validateSquads: jest.fn(),
}));

jest.mock("@/lib/validation/brkts/validate", () => ({
  sanitizeBrkt: jest.fn(),
  validateBrkts: jest.fn(),
}));

jest.mock("@/lib/validation/brktEntries/validate", () => ({
  sanitizeBrktEntry: jest.fn(),
  validateBrktEntries: jest.fn(),
}));

jest.mock("@/lib/validation/brktSeeds/validate", () => ({
  sanitizeBrktSeed: jest.fn(),
  validateBrktSeeds: jest.fn(),
}));

jest.mock("@/lib/validation/divs/validate", () => ({
  sanitizeDiv: jest.fn(),
  validateDivs: jest.fn(),
}));

jest.mock("@/lib/validation/divEntries/validate", () => ({
  sanitizeDivEntry: jest.fn(),
  validateDivEntries: jest.fn(),
}));

jest.mock("@/lib/validation/elims/validate", () => ({
  sanitizeElim: jest.fn(),
  validateElims: jest.fn(),
}));

jest.mock("@/lib/validation/elimEntries/validate", () => ({
  sanitizeElimEntry: jest.fn(),
  validateElimEntries: jest.fn(),
}));

jest.mock("@/lib/validation/stages/validate", () => ({
  sanitizeFullStage: jest.fn(),
  validateFullStage: jest.fn(),
}));

describe("sanitizeFullTmnt", () => {
  // typed sentinels
  let tmntSentinel: tmntType;
  let stageSentinel: fullStageType;

  beforeEach(() => {
    jest.clearAllMocks();

    // minimal blank template for sanitizeFullTmnt to populate
    (getBlankTmntFullData as jest.Mock).mockReturnValue({
      tmnt: {} as tmntType,
      events: [],
      divs: [],
      squads: [],
      stage: {} as fullStageType,
      lanes: [],
      pots: [],
      brkts: [],
      elims: [],
      players: [],
      divEntries: [],
      potEntries: [],
      brktEntries: [],
      oneBrkts: [],
      brktSeeds: [],
      elimEntries: [],
    } satisfies tmntFullType);

    // Build sentinels with correct shape (use input as base so required fields exist)
    tmntSentinel = { ...mockTmntFullData.tmnt, tmnt_name: "SANITIZED_TMNT" };
    stageSentinel = { ...mockTmntFullData.stage, stage_override_reason: "SANITIZED_STAGE" };

    // Return typed objects (no extra props)
    (sanitizeTmnt as jest.Mock).mockReturnValue(tmntSentinel);
    (sanitizeFullStage as jest.Mock).mockReturnValue(stageSentinel);

    // For arrays, return shallow clones so we can assert mapping happened
    (sanitizeEvent as jest.Mock).mockImplementation((x: eventType) => ({ ...x }));
    (sanitizeDiv as jest.Mock).mockImplementation((x: divType) => ({ ...x }));
    (sanitizeSquad as jest.Mock).mockImplementation((x: squadType) => ({ ...x }));
    (sanitizeLane as jest.Mock).mockImplementation((x: laneType) => ({ ...x }));
    (sanitizePot as jest.Mock).mockImplementation((x: potType) => ({ ...x }));
    (sanitizeBrkt as jest.Mock).mockImplementation((x: brktType) => ({ ...x }));
    (sanitizeElim as jest.Mock).mockImplementation((x: elimType) => ({ ...x }));
    (sanitizePlayer as jest.Mock).mockImplementation((x: playerType) => ({ ...x }));
    (sanitizeDivEntry as jest.Mock).mockImplementation((x: divEntryType) => ({ ...x }));
    (sanitizePotEntry as jest.Mock).mockImplementation((x: potEntryType) => ({ ...x }));
    (sanitizeBrktEntry as jest.Mock).mockImplementation((x: brktEntryType) => ({ ...x }));
    (sanitizeOneBrkt as jest.Mock).mockImplementation((x: oneBrktType) => ({ ...x }));
    (sanitizeBrktSeed as jest.Mock).mockImplementation((x: brktSeedType) => ({ ...x }));
    (sanitizeElimEntry as jest.Mock).mockImplementation((x: elimEntryType) => ({ ...x }));
  });

  it("builds a sanitized full tournament using the blank template + child sanitizers", () => {
    const result = sanitizeFullTmnt(mockTmntFullData);

    // template builder called
    expect(getBlankTmntFullData).toHaveBeenCalledTimes(1);
    expect(getBlankTmntFullData).toHaveBeenCalledWith(false);

    // non-array sanitizers: set directly
    expect(sanitizeTmnt).toHaveBeenCalledTimes(1);
    expect(sanitizeTmnt).toHaveBeenCalledWith(mockTmntFullData.tmnt);
    expect(result.tmnt).toBe(tmntSentinel);

    expect(sanitizeFullStage).toHaveBeenCalledTimes(1);
    expect(sanitizeFullStage).toHaveBeenCalledWith(mockTmntFullData.stage);
    expect(result.stage).toBe(stageSentinel);

    // map() sections: called once per item
    expect(sanitizeEvent).toHaveBeenCalledTimes(mockTmntFullData.events.length);
    expect(sanitizeDiv).toHaveBeenCalledTimes(mockTmntFullData.divs.length);
    expect(sanitizeSquad).toHaveBeenCalledTimes(mockTmntFullData.squads.length);
    expect(sanitizeLane).toHaveBeenCalledTimes(mockTmntFullData.lanes.length);
    expect(sanitizePot).toHaveBeenCalledTimes(mockTmntFullData.pots.length);
    expect(sanitizeBrkt).toHaveBeenCalledTimes(mockTmntFullData.brkts.length);
    expect(sanitizeElim).toHaveBeenCalledTimes(mockTmntFullData.elims.length);
    expect(sanitizePlayer).toHaveBeenCalledTimes(mockTmntFullData.players.length);
    expect(sanitizeDivEntry).toHaveBeenCalledTimes(mockTmntFullData.divEntries.length);
    expect(sanitizePotEntry).toHaveBeenCalledTimes(mockTmntFullData.potEntries.length);
    expect(sanitizeBrktEntry).toHaveBeenCalledTimes(mockTmntFullData.brktEntries.length);
    expect(sanitizeOneBrkt).toHaveBeenCalledTimes(mockTmntFullData.oneBrkts.length);
    expect(sanitizeBrktSeed).toHaveBeenCalledTimes(mockTmntFullData.brktSeeds.length);
    expect(sanitizeElimEntry).toHaveBeenCalledTimes(mockTmntFullData.elimEntries.length);

    // sizes preserved
    expect(result.events).toHaveLength(mockTmntFullData.events.length);
    expect(result.players).toHaveLength(mockTmntFullData.players.length);
    expect(result.brktEntries).toHaveLength(mockTmntFullData.brktEntries.length);
  });

  it("does not mutate the input object", () => {
    const before = cloneDeep(mockTmntFullData);

    sanitizeFullTmnt(mockTmntFullData);

    expect(mockTmntFullData).toEqual(before);
  });

  it("returns new array references (not the same arrays from the input)", () => {
    const result = sanitizeFullTmnt(mockTmntFullData);

    expect(result).not.toBe(mockTmntFullData);

    expect(result.events).not.toBe(mockTmntFullData.events);
    expect(result.divs).not.toBe(mockTmntFullData.divs);
    expect(result.squads).not.toBe(mockTmntFullData.squads);
    expect(result.lanes).not.toBe(mockTmntFullData.lanes);
    expect(result.pots).not.toBe(mockTmntFullData.pots);
    expect(result.brkts).not.toBe(mockTmntFullData.brkts);
    expect(result.elims).not.toBe(mockTmntFullData.elims);
    expect(result.players).not.toBe(mockTmntFullData.players);
    expect(result.divEntries).not.toBe(mockTmntFullData.divEntries);
    expect(result.potEntries).not.toBe(mockTmntFullData.potEntries);
    expect(result.brktEntries).not.toBe(mockTmntFullData.brktEntries);
    expect(result.oneBrkts).not.toBe(mockTmntFullData.oneBrkts);
    expect(result.brktSeeds).not.toBe(mockTmntFullData.brktSeeds);
    expect(result.elimEntries).not.toBe(mockTmntFullData.elimEntries);
  });

  it("passes the exact list items into each sanitizer (spot checks)", () => {
    sanitizeFullTmnt(mockTmntFullData);

    expect((sanitizeEvent as jest.Mock).mock.calls[0][0]).toBe(mockTmntFullData.events[0]);
    expect((sanitizeDiv as jest.Mock).mock.calls[0][0]).toBe(mockTmntFullData.divs[0]);
    expect((sanitizeSquad as jest.Mock).mock.calls[0][0]).toBe(mockTmntFullData.squads[0]);
    expect((sanitizePlayer as jest.Mock).mock.calls[0][0]).toBe(mockTmntFullData.players[0]);
    expect((sanitizeBrktEntry as jest.Mock).mock.calls[0][0]).toBe(mockTmntFullData.brktEntries[0]);
  });
});