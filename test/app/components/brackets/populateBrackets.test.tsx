import { populateBrackets } from "@/components/brackets/populateBrakets";
import {
  brktId1,
  mockTmntFullData,
  oneBrktId1,
  oneBrktId2,
  oneBrktId8,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("populateBrackets", () => {

  const brkt = mockTmntFullData.brkts.find(
    (brkt) => brkt.id === brktId1,
  )!;

  const oneBrkts = mockTmntFullData.oneBrkts.filter(
    (oneBrkt) => oneBrkt.brkt_id === brktId1,
  );

  const seeds = mockTmntFullData.brktSeeds.filter((seed) =>
    oneBrkts.some((oneBrkt) => oneBrkt.id === seed.one_brkt_id),
  );

  it("should populate all brackets", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    expect(brackets).toHaveLength(oneBrkts.length);
    expect(brackets).toHaveLength(8);
  });

  it("should create brackets with correct ids", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    expect(brackets.map((bracket) => bracket.id)).toEqual(
      oneBrkts.map((oneBrkt) => oneBrkt.id),
    );
  });

  it("should create brackets with correct games and players per match", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    brackets.forEach((bracket) => {
      expect(bracket.games).toBe(3);
      expect(bracket.playersPerMatch).toBe(2);
      expect(bracket.playersPerBracket).toBe(8);
    });
  });

  it("should populate first bracket with correct players", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    const bracket = brackets.find(
      (bracket) => bracket.id === oneBrktId1,
    );

    expect(bracket).toBeDefined();
    expect(bracket?.players).toEqual([
      playerId1,
      playerId2,
      playerId3,
      playerId4,
      playerId5,
      playerId6,
      playerId7,
      playerId8,
    ]);
  });

  it("should populate brackets with players for their one_brkt_id", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    const bracket = brackets.find(
      (bracket) => bracket.id === oneBrktId2,
    );

    expect(bracket).toBeDefined();
    expect(bracket?.players).toEqual([
      playerId4,
      playerId7,
      playerId1,
      playerId6,
      playerId3,
      playerId8,
      playerId2,
      playerId5,
    ]);
  });

  it("should populate the last bracket with correct players", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      seeds,
    );

    const bracket = brackets.find(
      (bracket) => bracket.id === oneBrktId8,
    );

    expect(bracket).toBeDefined();
    expect(bracket?.players).toEqual([
      playerId5,
      playerId1,
      playerId6,
      playerId4,
      playerId2,
      playerId7,
      playerId8,
      playerId3,
    ]);
  });

  it("should return empty array when brkt is null", () => {
    const brackets = populateBrackets(
      null as any,
      oneBrkts,
      seeds,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when one_brkts is null", () => {
    const brackets = populateBrackets(
      brkt,
      null as any,
      seeds,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when seeds is null", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      null as any,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when one_brkts is not an array", () => {
    const brackets = populateBrackets(
      brkt,
      {} as any,
      seeds,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when seeds is not an array", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      {} as any,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when one_brkts is empty", () => {
    const brackets = populateBrackets(
      brkt,
      [],
      seeds,
    );

    expect(brackets).toEqual([]);
  });

  it("should return empty array when seeds is empty", () => {
    const brackets = populateBrackets(
      brkt,
      oneBrkts,
      [],
    );

    expect(brackets).toEqual([]);
  });
});