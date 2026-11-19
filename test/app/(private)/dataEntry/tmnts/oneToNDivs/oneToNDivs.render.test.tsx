// test/app/(private)/dataEntry/tmnts/oneToNDivs/oneToNDivs.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNDivs.tsx
// (rendering only - clicks, typing and deletes are in oneToNDivs.interactions.test.tsx)
import React, { act } from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNDivs from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
import {
  mockDivs,
  mockPots,
  mockBrkts,
  mockElims,
} from "../../../../../mocks/tmnts/twoDivs/mockDivs";
import { defaultHdcpFrom, initDiv } from "@/lib/db/initVals";
import { maxEventLength } from "@/lib/validation/constants";
import type { divType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof OneToNDivs>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders OneToNDivs with a fresh copy of mockDivs; any prop can be overridden */
const renderDivs = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    divs: cloneDeep(mockDivs),
    setDivs: jest.fn(),
    pots: mockPots,
    brkts: mockBrkts,
    elims: mockElims,
    setAcdnErr: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<OneToNDivs {...props} />);
  return props;
};

/** mockDivs with errors set on the 2nd division */
const divsWithErrors = (): divType[] => {
  const divs = cloneDeep(mockDivs);
  divs[1].div_name_err = "test div name error";
  divs[1].hdcp_per_err = "test hdcp error";
  divs[1].hdcp_from_err = "test hdcp from error";
  divs[1].errClassName = "test-err-class";
  return divs;
};

/** mockDivs plus a 3rd division */
const threeDivs = (): divType[] => {
  const divs = cloneDeep(mockDivs);
  return [
    ...divs,
    {
      ...initDiv,
      id: "div_3",
      sort_order: 3,
      div_name: "50+",
      tab_title: "50+",
      tmnt_id: divs[0].tmnt_id,
    },
  ];
};

const nameInputs = () =>
  screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
const hdcpPerInputs = () =>
  screen.getAllByRole("textbox", { name: /hdcp %/i }) as HTMLInputElement[];
const hdcpFromInputs = () =>
  screen.getAllByRole("spinbutton", { name: /hdcp from/i }) as HTMLInputElement[];
const hdcpLabels = () =>
  screen.getAllByText(/hdcp %/i, { selector: "label" }) as HTMLLabelElement[];

// ---------------------------------------------------------------------------

describe("OneToNDivs - render", () => {
  describe("tabs", () => {
    it("renders one tab per division, titled with tab_title, with the first tab active", () => {
      renderDivs();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockDivs.length);
      tabs.forEach((tab, i) =>
        expect(tab).toHaveTextContent(mockDivs[i].tab_title),
      );
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });

    it("selecting the 2nd tab makes it active", async () => {
      const user = userEvent.setup();
      renderDivs();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("adds the division's errClassName to its tab", () => {
      renderDivs({ divs: divsWithErrors() });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveClass("test-err-class");
      expect(tabs[0]).not.toHaveClass("test-err-class");
    });
  });

  describe("first division", () => {
    it("renders the # Divisions label and a disabled count of the divisions", () => {
      renderDivs();

      expect(screen.getByText("# Divisions")).toBeInTheDocument();
      const numDivs = screen.getByRole("textbox", { name: /# divisions/i });
      expect(numDivs).toHaveValue(String(mockDivs.length));
      expect(numDivs).toBeDisabled();
    });

    it("renders an enabled, green Add button and no Delete button", () => {
      renderDivs();

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeEnabled();
      expect(addBtn).toHaveClass("btn-success");
      expect(
        screen.queryByTestId(`divDel${mockDivs[0].id}`),
      ).not.toBeInTheDocument();
    });

    it("renders the div name", () => {
      renderDivs();

      const input = nameInputs()[0];
      expect(input).toHaveValue(mockDivs[0].div_name);
      expect(input).toBeEnabled();
      expect(input).not.toHaveClass("is-invalid");
    });

    it("renders the hdcp % as a formatted percent", () => {
      renderDivs();

      const input = hdcpPerInputs()[0];
      expect(input).toHaveValue("0.00%");
      expect(input).toBeEnabled();
      expect(input).not.toHaveClass("is-invalid");
    });

    it("renders hdcp from disabled, because hdcp % is 0", () => {
      renderDivs();

      const input = hdcpFromInputs()[0];
      expect(input).toHaveValue(defaultHdcpFrom);
      expect(input).toBeDisabled();
      expect(input).not.toHaveClass("is-invalid");
    });
  });

  describe("second division", () => {
    it("renders an enabled, red Delete button and no Add button of its own", () => {
      renderDivs();

      const delBtn = screen.getByTestId(`divDel${mockDivs[1].id}`);
      expect(delBtn).toHaveTextContent("Delete Div");
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
      // only the 1st division has an Add button
      expect(screen.getAllByRole("button", { name: /add/i })).toHaveLength(1);
    });

    it("renders the div name, hdcp % and hdcp from values", () => {
      renderDivs();

      expect(nameInputs()[1]).toHaveValue(mockDivs[1].div_name);
      expect(hdcpPerInputs()[1]).toHaveValue("100.00%");
      expect(hdcpFromInputs()[1]).toHaveValue(mockDivs[1].hdcp_from);
    });

    it("renders hdcp from enabled, because hdcp % is not 0", () => {
      renderDivs();
      expect(hdcpFromInputs()[1]).toBeEnabled();
    });
  });

  describe("labels and inputs on every division", () => {
    it("renders a Div Name, Hdcp % and Hdcp From label for each division", () => {
      renderDivs();

      expect(screen.getAllByText("Div Name")).toHaveLength(mockDivs.length);
      expect(hdcpLabels()).toHaveLength(mockDivs.length);
      expect(screen.getAllByText("Hdcp From")).toHaveLength(mockDivs.length);
    });

    it("renders the Hdcp % label text, then a space, then the ? help icon", () => {
      renderDivs();

      const label = hdcpLabels()[0];
      expect(label.textContent ?? "").toMatch(/^Hdcp %\s+\?/);
      const helpSpan = within(label).getByText("?", { selector: "span" });
      expect(helpSpan).toHaveClass("popup-help");
    });

    it("limits the div name length to maxEventLength", () => {
      renderDivs();
      nameInputs().forEach((input) =>
        expect(input).toHaveAttribute("maxLength", String(maxEventLength)),
      );
    });

    it("renders empty error messages when there are no errors", () => {
      renderDivs();

      for (const testId of ["dangerDivName", "dangerHdcp", "dangerHdcpFrom"]) {
        const errors = screen.getAllByTestId(testId);
        expect(errors).toHaveLength(mockDivs.length);
        errors.forEach((err) => expect(err).toBeEmptyDOMElement());
      }
    });

    it("renders no modal", () => {
      renderDivs();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("division with errors", () => {
    it("marks each input on that division as invalid", () => {
      renderDivs({ divs: divsWithErrors() });

      expect(nameInputs()[1]).toHaveClass("is-invalid");
      expect(hdcpPerInputs()[1]).toHaveClass("is-invalid");
      expect(hdcpFromInputs()[1]).toHaveClass("is-invalid");
    });

    it("shows each error message under its input", () => {
      renderDivs({ divs: divsWithErrors() });

      expect(screen.getAllByTestId("dangerDivName")[1]).toHaveTextContent(
        "test div name error",
      );
      expect(screen.getAllByTestId("dangerHdcp")[1]).toHaveTextContent(
        "test hdcp error",
      );
      expect(screen.getAllByTestId("dangerHdcpFrom")[1]).toHaveTextContent(
        "test hdcp from error",
      );
    });

    it("does not mark the other division as invalid", () => {
      renderDivs({ divs: divsWithErrors() });

      expect(nameInputs()[0]).not.toHaveClass("is-invalid");
      expect(hdcpPerInputs()[0]).not.toHaveClass("is-invalid");
      expect(hdcpFromInputs()[0]).not.toHaveClass("is-invalid");
      expect(screen.getAllByTestId("dangerDivName")[0]).toBeEmptyDOMElement();
    });
  });

  describe("three divisions", () => {
    it("renders 3 tabs, a count of 3, one Add button and 2 Delete buttons", () => {
      const divs = threeDivs();
      renderDivs({ divs });

      expect(screen.getAllByRole("tab")).toHaveLength(3);
      expect(
        screen.getByRole("textbox", { name: /# divisions/i }),
      ).toHaveValue("3");
      expect(screen.getAllByRole("button", { name: /add/i })).toHaveLength(1);
      expect(
        screen.getAllByRole("button", { name: /delete div/i }),
      ).toHaveLength(2);
      expect(screen.getByTestId(`divDel${divs[1].id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`divDel${divs[2].id}`)).toBeInTheDocument();
    });
  });

  describe("isDisabled = true", () => {
    it("disables every input and button, and uses dark button styles", () => {
      const divs = cloneDeep(mockDivs);
      renderDivs({ divs, isDisabled: true });

      expect(
        screen.getByRole("textbox", { name: /# divisions/i }),
      ).toBeDisabled();

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeDisabled();
      expect(addBtn).toHaveClass("btn-dark");
      expect(addBtn).not.toHaveClass("btn-success");

      const delBtn = screen.getByTestId(`divDel${divs[1].id}`);
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");

      [...nameInputs(), ...hdcpPerInputs(), ...hdcpFromInputs()].forEach(
        (input) => expect(input).toBeDisabled(),
      );
    });

    it("still renders the values", () => {
      renderDivs({ isDisabled: true });

      expect(nameInputs()[0]).toHaveValue(mockDivs[0].div_name);
      expect(nameInputs()[1]).toHaveValue(mockDivs[1].div_name);
      expect(hdcpPerInputs()[1]).toHaveValue("100.00%");
    });
  });

  describe("Hdcp % help tooltip", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers();
      });
      jest.useRealTimers();
    });

    it("only shows the tooltip while the help icon is hovered", async () => {
      const hdcpLineRegex = /Enter Hdcp %/i;
      const zeroLineRegex = /Enter 0 for scratch/;
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderDivs();

      // before hover - no tooltip
      expect(screen.queryByText(hdcpLineRegex)).not.toBeInTheDocument();
      expect(screen.queryByText(zeroLineRegex)).not.toBeInTheDocument();

      const helpSpan = within(hdcpLabels()[0]).getByText("?", {
        selector: "span",
      });

      // hover - tooltip shows after the 250ms show delay
      await user.hover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(await screen.findByText(hdcpLineRegex)).toBeInTheDocument();
      expect(await screen.findByText(zeroLineRegex)).toBeInTheDocument();

      // unhover - tooltip goes away after the 1000ms hide delay
      await user.unhover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await waitForElementToBeRemoved(() => screen.queryByText(hdcpLineRegex));
    });
  });
});
