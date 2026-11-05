import React from "react";
import { render, screen, within } from "@testing-library/react";
import TmntHomeHeader, {
  tmntPageBtnType,
} from "@/app/results/tmntHeader/tmntHomeHeader";
import { getMonthDayYear } from "@/lib/dateTools";
import { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  tmntId,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

type sectionFlags = { brkts: boolean; pots: boolean; elims: boolean };

// Builds data with each optional section either kept from the mock or emptied
const dataWith = ({ brkts, pots, elims }: sectionFlags): tmntFullType => ({
  ...mockTmntFullData,
  brkts: brkts ? mockTmntFullData.brkts : [],
  pots: pots ? mockTmntFullData.pots : [],
  elims: elims ? mockTmntFullData.elims : [],
});

const dataAll = (): tmntFullType =>
  dataWith({ brkts: true, pots: true, elims: true });
const dataNone = (): tmntFullType =>
  dataWith({ brkts: false, pots: false, elims: false });

const withTmnt = (
  tmntOverrides: Partial<tmntFullType["tmnt"]>,
  base: tmntFullType = dataAll()
): tmntFullType => ({
  ...base,
  tmnt: { ...base.tmnt, ...tmntOverrides },
});

const renderHeader = (
  data: tmntFullType,
  selected: tmntPageBtnType = "Home"
) =>
  render(<TmntHomeHeader tmntFullData={data} selectedTmntPageBtn={selected} />);

const getLinkLabels = () =>
  within(screen.getByRole("navigation", { name: "Tournament navigation" }))
    .getAllByRole("link")
    .map((link) => link.textContent);

const mockName = mockTmntFullData.tmnt.tmnt_name;
const mockStart = mockTmntFullData.tmnt.start_date_str;
const otherDate = "2025-09-03";

describe("TmntHomeHeader", () => {
  describe("mock data (fixture sanity check)", () => {
    it("has brackets, pots and elims, and a one-day tournament", () => {
      expect(mockTmntFullData.brkts.length).toBeGreaterThan(0);
      expect(mockTmntFullData.pots.length).toBeGreaterThan(0);
      expect(mockTmntFullData.elims.length).toBeGreaterThan(0);
      expect(mockTmntFullData.tmnt.start_date_str).toBe(
        mockTmntFullData.tmnt.end_date_str
      );
      expect(mockName).not.toBe("");
    });
  });

  describe("title (name and date)", () => {
    // `name` on getByRole is an exact match of the whole heading text,
    // so these also prove nothing extra (like " - " or ": ") is in it.
    it("renders the name and a single date when start and end dates match", () => {
      renderHeader(dataAll());
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: `${mockName}: ${getMonthDayYear(mockStart)}`,
        })
      ).toBeInTheDocument();
    });

    it("renders a date range when start and end dates differ", () => {
      renderHeader(withTmnt({ end_date_str: otherDate }));
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: `${mockName}: ${getMonthDayYear(mockStart)} - ${getMonthDayYear(otherDate)}`,
        })
      ).toBeInTheDocument();
    });

    it("omits the separator when the tournament name is empty", () => {
      renderHeader(withTmnt({ tmnt_name: "" }));
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: getMonthDayYear(mockStart),
        })
      ).toBeInTheDocument();
    });

    it("omits the separator and shows only the range when the name is empty and dates differ", () => {
      renderHeader(withTmnt({ tmnt_name: "", end_date_str: otherDate }));
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: `${getMonthDayYear(mockStart)} - ${getMonthDayYear(otherDate)}`,
        })
      ).toBeInTheDocument();
    });

    it("renders exactly one heading", () => {
      renderHeader(dataAll());
      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });
  });

  describe("navigation structure", () => {
    it("renders a labelled navigation landmark", () => {
      renderHeader(dataAll());
      expect(
        screen.getByRole("navigation", { name: "Tournament navigation" })
      ).toBeInTheDocument();
    });

    it("puts every link inside the labelled button group", () => {
      renderHeader(dataAll());
      const group = screen.getByRole("group", { name: "Select tournament page" });
      expect(within(group).getAllByRole("link")).toHaveLength(6);
      expect(screen.getAllByRole("link")).toHaveLength(6);
    });
  });

  describe("always-visible links", () => {
    it.each([
      ["Home", "home"],
      ["Players", "players"],
      ["Standings", "standings"],
    ])(
      "renders the %s link with the correct href even with no brackets, pots or elims",
      (label, path) => {
        renderHeader(dataNone(), "None");
        expect(screen.getByRole("link", { name: label })).toHaveAttribute(
          "href",
          `/results/tmnt/${tmntId}/${path}`
        );
      }
    );

    it("builds hrefs from the tournament id in the data", () => {
      const otherId = "tmt_ffffffffffffffffffffffffffffffff";
      renderHeader(withTmnt({ id: otherId }));
      screen.getAllByRole("link").forEach((link) => {
        expect(link).toHaveAttribute(
          "href",
          expect.stringMatching(new RegExp(`^/results/tmnt/${otherId}/`))
        );
      });
    });
  });

  describe("conditional links", () => {
    it("shows Brackets, Pots and Elims links with correct hrefs when all data exists", () => {
      renderHeader(dataAll());
      expect(screen.getByRole("link", { name: "Brackets" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets`
      );
      expect(screen.getByRole("link", { name: "Pots" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/pots`
      );
      expect(screen.getByRole("link", { name: "Elims" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/elims`
      );
    });

    // Every combination of brackets / pots / elims, checked against the
    // full ordered list of links so nothing extra or missing slips through.
    it.each<[string, sectionFlags, string[]]>([
      ["none", { brkts: false, pots: false, elims: false }, []],
      ["brackets only", { brkts: true, pots: false, elims: false }, ["Brackets"]],
      ["pots only", { brkts: false, pots: true, elims: false }, ["Pots"]],
      ["elims only", { brkts: false, pots: false, elims: true }, ["Elims"]],
      ["brackets and pots", { brkts: true, pots: true, elims: false }, ["Brackets", "Pots"]],
      ["brackets and elims", { brkts: true, pots: false, elims: true }, ["Brackets", "Elims"]],
      ["pots and elims", { brkts: false, pots: true, elims: true }, ["Pots", "Elims"]],
      ["all three", { brkts: true, pots: true, elims: true }, ["Brackets", "Pots", "Elims"]],
    ])("with %s, renders the matching links in order", (_desc, flags, extra) => {
      renderHeader(dataWith(flags));
      expect(getLinkLabels()).toEqual(["Home", "Players", "Standings", ...extra]);
    });
  });

  describe("selected page state (active class and aria-current)", () => {
    const allButtons: Exclude<tmntPageBtnType, "None">[] = [
      "Home",
      "Players",
      "Standings",
      "Brackets",
      "Pots",
      "Elims",
    ];

    it.each(allButtons)("marks only the %s link as active when selected", (selected) => {
      renderHeader(dataAll(), selected);

      expect(screen.getByRole("link", { name: selected })).toHaveClass("active");
      allButtons
        .filter((label) => label !== selected)
        .forEach((label) => {
          expect(screen.getByRole("link", { name: label })).not.toHaveClass("active");
        });
    });

    it.each(allButtons)("sets aria-current=\"page\" only on the %s link when selected", (selected) => {
      renderHeader(dataAll(), selected);

      // getByRole throws if more than one link has aria-current="page"
      const current = screen.getByRole("link", { current: "page" });
      expect(current).toHaveAccessibleName(selected);
      expect(current).toHaveAttribute("aria-current", "page");
      allButtons
        .filter((label) => label !== selected)
        .forEach((label) => {
          expect(screen.getByRole("link", { name: label })).not.toHaveAttribute("aria-current");
        });
    });

    it("marks no link as active when selectedTmntPageBtn is None", () => {
      renderHeader(dataAll(), "None");
      screen.getAllByRole("link").forEach((link) => {
        expect(link).not.toHaveClass("active");
        expect(link).not.toHaveAttribute("aria-current");
      });
      expect(screen.queryByRole("link", { current: "page" })).not.toBeInTheDocument();
    });

    it("keeps the btn and btn-outline-primary classes on every link", () => {
      renderHeader(dataAll(), "Players");
      screen.getAllByRole("link").forEach((link) => {
        expect(link).toHaveClass("btn", "btn-outline-primary");
      });
    });

    it.each<[Exclude<tmntPageBtnType, "None" | "Home" | "Players" | "Standings">, sectionFlags]>([
      ["Brackets", { brkts: false, pots: true, elims: true }],
      ["Pots", { brkts: true, pots: false, elims: true }],
      ["Elims", { brkts: true, pots: true, elims: false }],
    ])("renders no active or current link when %s is selected but has no data", (selected, flags) => {
      renderHeader(dataWith(flags), selected);
      expect(screen.queryByRole("link", { name: selected })).not.toBeInTheDocument();
      screen.getAllByRole("link").forEach((link) => {
        expect(link).not.toHaveClass("active");
        expect(link).not.toHaveAttribute("aria-current");
      });
      expect(screen.queryByRole("link", { current: "page" })).not.toBeInTheDocument();
    });
  });
});

