import React from "react";
import { render, screen, within } from "@testing-library/react";
import BracketHeader, {
  type brktPageBtnType
} from "@/app/results/tmnt/[tmntId]/brackets/bracketHeader";
import type { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const renderHeader = (
  selectedBrktPageBtn: brktPageBtnType = "Brackets",
  data: tmntFullType = mockTmntFullData
) =>
  render(
    <BracketHeader
      tmntFullData={data}
      selectedBrktPageBtn={selectedBrktPageBtn}
    />
  );

describe("BracketHeader", () => {
  describe("structure", () => {
    it("renders the header container", () => {
      renderHeader();
      expect(screen.getByTestId("bracket-header")).toBeInTheDocument();
    });

    it("renders a labelled navigation landmark inside the header", () => {
      renderHeader();

      const header = screen.getByTestId("bracket-header");
      expect(
        within(header).getByRole("navigation", { name: "Bracket navigation" })
      ).toBeInTheDocument();
    });

    it("renders the labelled button group", () => {
      renderHeader();

      expect(
        screen.getByRole("group", { name: "Select bracket" })
      ).toBeInTheDocument();
    });

    it("renders exactly two links, in the order Brackets then Payouts", () => {
      renderHeader();

      const labels = screen
        .getAllByRole("link")
        .map((link) => link.textContent);
      expect(labels).toEqual(["Brackets", "Payouts"]);
    });

    it("renders the links inside the button group", () => {
      renderHeader();

      const group = screen.getByRole("group", { name: "Select bracket" });
      expect(within(group).getAllByRole("link")).toHaveLength(2);
    });
  });

  describe("links", () => {
    it("links Brackets to the tournament's brackets page", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Brackets" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets`
      );
    });

    it("links Payouts to the tournament's payouts page", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Payouts" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/brackets/payouts`
      );
    });

    it("uses the id of the tournament that is passed in", () => {
      const otherId = "tmt_differentid00000000000000000000";
      renderHeader("Brackets", {
        ...mockTmntFullData,
        tmnt: { ...mockTmntFullData.tmnt, id: otherId },
      });

      expect(screen.getByRole("link", { name: "Brackets" })).toHaveAttribute(
        "href",
        `/results/tmnt/${otherId}/brackets`
      );
      expect(screen.getByRole("link", { name: "Payouts" })).toHaveAttribute(
        "href",
        `/results/tmnt/${otherId}/brackets/payouts`
      );
    });

    it("keeps the btn and btn-outline-primary classes on every link", () => {
      renderHeader();

      screen.getAllByRole("link").forEach((link) => {
        expect(link).toHaveClass("btn", "btn-outline-primary");
      });
    });
  });

  describe("active button state", () => {
    it("marks only Brackets as active when Brackets is selected", () => {
      renderHeader("Brackets");

      expect(screen.getByRole("link", { name: "Brackets" })).toHaveClass("active");
      expect(screen.getByRole("link", { name: "Payouts" })).not.toHaveClass("active");
    });

    it("marks no link as active when None is selected", () => {
      renderHeader("None");

      screen.getAllByRole("link").forEach((link) => {
        expect(link).not.toHaveClass("active");
      });
    });

    it.each([
      ["an empty string", ""],
      ["an unknown name", "Elims"],
      ["a different case", "brackets"],
    ])(
      "marks no link as active when the selected button is %s (not possible through the type)",
      (_label, selected) => {
        renderHeader(selected as brktPageBtnType);

        screen.getAllByRole("link").forEach((link) => {
          expect(link).not.toHaveClass("active");
        });
      }
    );

    it("updates the active link when the selected button changes", () => {
      const { rerender } = renderHeader("Brackets");
      expect(screen.getByRole("link", { name: "Brackets" })).toHaveClass("active");

      rerender(
        <BracketHeader
          tmntFullData={mockTmntFullData}
          selectedBrktPageBtn="Payouts"
        />
      );

      expect(screen.getByRole("link", { name: "Brackets" })).not.toHaveClass("active");
      expect(screen.getByRole("link", { name: "Payouts" })).toHaveClass("active");
    });
  });

  describe("fixture sanity check", () => {
    it("mock tournament has an id that matches the exported tmntId", () => {
      expect(mockTmntFullData.tmnt.id).toBe(tmntId);
    });
  });
});
