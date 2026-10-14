import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TmntDivHeader from "@/app/results/tmnt/[tmntId]/standings/tmntDivHeader";
import type { divDataType } from "@/lib/types/types";
import {
  mockTmntFullData,
  divId1,
  divId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const divs: divDataType[] = mockTmntFullData.divs;
const [firstDiv, secondDiv] = divs;

const onSelectDiv = jest.fn();

const renderHeader = (
  selectedDivId: string = divId1,
  divsToRender: divDataType[] = divs
) =>
  render(
    <TmntDivHeader
      divs={divsToRender}
      selectedDivId={selectedDivId}
      onSelectDiv={onSelectDiv}
    />
  );

describe("TmntDivHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fixture sanity check", () => {
    it("mock data has two divisions with the expected ids and names", () => {
      expect(divs).toHaveLength(2);
      expect(firstDiv.id).toBe(divId1);
      expect(secondDiv.id).toBe(divId2);
      expect(firstDiv.div_name).not.toBe(secondDiv.div_name);
    });
  });

  describe("structure", () => {
    it("renders the labelled button group", () => {
      renderHeader();
      expect(
        screen.getByRole("group", { name: "Select division" })
      ).toBeInTheDocument();
    });

    it("renders one button per division, in order, with the division name", () => {
      renderHeader();

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(divs.length);
      divs.forEach((div, i) => {
        expect(buttons[i]).toHaveTextContent(div.div_name);
      });
    });

    it("renders buttons of type button", () => {
      renderHeader();
      screen.getAllByRole("button").forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("renders the group with no buttons when there are no divisions", () => {
      renderHeader("", []);

      expect(
        screen.getByRole("group", { name: "Select division" })
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    it("renders a button for every division when there are more than two", () => {
      const extraDiv: divDataType = {
        ...firstDiv,
        id: "div_0123cae28786485bb7a036935f0f6a0c",
        div_name: "Senior",
      };
      renderHeader(divId1, [...divs, extraDiv]);

      expect(screen.getAllByRole("button")).toHaveLength(3);
      expect(screen.getByRole("button", { name: "Senior" })).toBeInTheDocument();
    });
  });

  describe("selected state", () => {
    it("marks only the first division as selected when it is the selectedDivId", () => {
      renderHeader(divId1);

      const first = screen.getByRole("button", { name: firstDiv.div_name });
      const second = screen.getByRole("button", { name: secondDiv.div_name });

      expect(first).toHaveAttribute("aria-pressed", "true");
      expect(first).toHaveClass("btn", "btn-primary");
      expect(first).not.toHaveClass("btn-outline-primary");

      expect(second).toHaveAttribute("aria-pressed", "false");
      expect(second).toHaveClass("btn", "btn-outline-primary");
      expect(second).not.toHaveClass("btn-primary");
    });

    it("marks only the second division as selected when it is the selectedDivId", () => {
      renderHeader(divId2);

      const first = screen.getByRole("button", { name: firstDiv.div_name });
      const second = screen.getByRole("button", { name: secondDiv.div_name });

      expect(first).toHaveAttribute("aria-pressed", "false");
      expect(first).toHaveClass("btn-outline-primary");
      expect(second).toHaveAttribute("aria-pressed", "true");
      expect(second).toHaveClass("btn-primary");
    });

    it("marks no division as selected when selectedDivId matches none", () => {
      renderHeader("div_doesnotexist00000000000000000000");

      screen.getAllByRole("button").forEach((button) => {
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(button).toHaveClass("btn-outline-primary");
        expect(button).not.toHaveClass("btn-primary");
      });
    });

    it("updates the selected division when selectedDivId changes", () => {
      const { rerender } = renderHeader(divId1);
      expect(
        screen.getByRole("button", { name: firstDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");

      rerender(
        <TmntDivHeader
          divs={divs}
          selectedDivId={divId2}
          onSelectDiv={onSelectDiv}
        />
      );

      expect(
        screen.getByRole("button", { name: firstDiv.div_name })
      ).toHaveAttribute("aria-pressed", "false");
      expect(
        screen.getByRole("button", { name: secondDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("selection callback", () => {
    it("does not call onSelectDiv on render", () => {
      renderHeader();
      expect(onSelectDiv).not.toHaveBeenCalled();
    });

    it("calls onSelectDiv with the division id when an unselected division is clicked", () => {
      renderHeader(divId1);

      fireEvent.click(screen.getByRole("button", { name: secondDiv.div_name }));

      expect(onSelectDiv).toHaveBeenCalledTimes(1);
      expect(onSelectDiv).toHaveBeenCalledWith(divId2);
    });

    it("calls onSelectDiv with the division id when the selected division is clicked", () => {
      renderHeader(divId1);

      fireEvent.click(screen.getByRole("button", { name: firstDiv.div_name }));

      expect(onSelectDiv).toHaveBeenCalledTimes(1);
      expect(onSelectDiv).toHaveBeenCalledWith(divId1);
    });

    it("calls onSelectDiv once per click, with the id of the clicked division", () => {
      renderHeader(divId1);

      fireEvent.click(screen.getByRole("button", { name: secondDiv.div_name }));
      fireEvent.click(screen.getByRole("button", { name: firstDiv.div_name }));

      expect(onSelectDiv).toHaveBeenCalledTimes(2);
      expect(onSelectDiv).toHaveBeenNthCalledWith(1, divId2);
      expect(onSelectDiv).toHaveBeenNthCalledWith(2, divId1);
    });

    it("does not change the displayed selection itself (selection is controlled by the parent)", () => {
      renderHeader(divId1);

      fireEvent.click(screen.getByRole("button", { name: secondDiv.div_name }));

      expect(
        screen.getByRole("button", { name: firstDiv.div_name })
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("button", { name: secondDiv.div_name })
      ).toHaveAttribute("aria-pressed", "false");
    });
  });
});