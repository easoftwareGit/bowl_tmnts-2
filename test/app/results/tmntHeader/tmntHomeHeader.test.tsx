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

// All sections present: this is the mock as-is
const dataAll = (): tmntFullType => ({ ...mockTmntFullData });

// Brackets only
const dataBracketsOnly = (): tmntFullType => ({
  ...mockTmntFullData,
  pots: [],
  elims: [],
});

// No optional sections at all
const dataNone = (): tmntFullType => ({
  ...mockTmntFullData,
  brkts: [],
  pots: [],
  elims: [],
});

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
) => render(<TmntHomeHeader tmntFullData={data} selectedTmntPageBtn={selected} />);

describe("TmntHomeHeader", () => {
  describe("title (name and date)", () => {
    it("renders the mock tournament name and a single date when start and end dates match", () => {
      renderHeader(dataBracketsOnly());

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent(
        `Mock Tournament: ${getMonthDayYear("2025-09-01")}`
      );
      expect(heading).not.toHaveTextContent(" - ");
    });

    it("renders a date range when start and end dates differ", () => {
      renderHeader(withTmnt({ end_date_str: "2025-09-03" }));

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        `Mock Tournament: ${getMonthDayYear("2025-09-01")} - ${getMonthDayYear("2025-09-03")}`
      );
    });

    it("omits the separator when the tournament name is empty", () => {
      renderHeader(withTmnt({ tmnt_name: "" }));

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent(getMonthDayYear("2025-09-01"));
      expect(heading).not.toHaveTextContent(":");
    });
  });

  describe("navigation structure", () => {
    it("renders a labelled navigation landmark", () => {
      renderHeader(dataAll());
      expect(
        screen.getByRole("navigation", { name: "Tournament navigation" })
      ).toBeInTheDocument();
    });

    it("renders the button group", () => {
      renderHeader(dataAll());
      expect(
        screen.getByRole("group", { name: "Select bracket" })
      ).toBeInTheDocument();
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

    it("shows only Brackets when there are brackets but no pots or elims", () => {
      renderHeader(dataBracketsOnly());
      expect(screen.getByRole("link", { name: "Brackets" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Pots" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Elims" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(4);
    });

    it("shows only Pots when only pots exist", () => {
      renderHeader({ ...dataNone(), pots: mockTmntFullData.pots });
      expect(screen.getByRole("link", { name: "Pots" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Brackets" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Elims" })).not.toBeInTheDocument();
    });

    it("shows only Elims when only elims exist", () => {
      renderHeader({ ...dataNone(), elims: mockTmntFullData.elims });
      expect(screen.getByRole("link", { name: "Elims" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Brackets" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Pots" })).not.toBeInTheDocument();
    });    

    it("mock data has brackets, pots and elims (fixture sanity check)", () => {
      expect(mockTmntFullData.brkts.length).toBeGreaterThan(0);
      expect(mockTmntFullData.pots.length).toBeGreaterThan(0);
      expect(mockTmntFullData.elims.length).toBeGreaterThan(0);
    });

    it("hides Brackets, Pots and Elims when there is no data", () => {
      renderHeader(dataNone());
      expect(screen.queryByRole("link", { name: "Brackets" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Pots" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Elims" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(3);
    });

    it("renders links in order: Home, Players, Standings, Brackets, Pots, Elims", () => {
      renderHeader(dataAll());
      const nav = screen.getByRole("navigation");
      const labels = within(nav)
        .getAllByRole("link")
        .map((l) => l.textContent);
      expect(labels).toEqual([
        "Home",
        "Players",
        "Standings",
        "Brackets",
        "Pots",
        "Elims",
      ]);
    });
  });

  describe("active button state", () => {
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

      allButtons.forEach((label) => {
        const link = screen.getByRole("link", { name: label });
        if (label === selected) {
          expect(link).toHaveClass("active");
        } else {
          expect(link).not.toHaveClass("active");
        }
      });
    });

    it("marks no link as active when selectedTmntPageBtn is None", () => {
      renderHeader(dataAll(), "None");
      screen.getAllByRole("link").forEach((link) => {
        expect(link).not.toHaveClass("active");
      });
    });

    it("keeps the btn and btn-outline-primary classes on every link", () => {
      renderHeader(dataAll());
      screen.getAllByRole("link").forEach((link) => {
        expect(link).toHaveClass("btn", "btn-outline-primary");
      });
    });

    it("renders no active link when the selected page is hidden (Pots with no pots)", () => {
      renderHeader(dataBracketsOnly(), "Pots");
      expect(screen.queryByRole("link", { name: "Pots" })).not.toBeInTheDocument();
      screen.getAllByRole("link").forEach((link) => {
        expect(link).not.toHaveClass("active");
      });
    });
  });
});