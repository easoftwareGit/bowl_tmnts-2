// test/app/(private)/dataEntry/tmnts/oneToNDivs/oneToNDivs.interactions.test.tsx
// test for src/app/(private)/dataEntry/tmntForm/oneToNDivs.tsx
import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
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
import { initDiv, defaultHdcpFrom } from "@/lib/db/initVals";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import { maxHdcpFrom, minHdcpFrom } from "@/lib/validation/constants";
import type { divType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof OneToNDivs>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const validHdcpFrom = Math.floor((minHdcpFrom + maxHdcpFrom) / 2);

/** fresh copy of mockDivs with all errors cleared */
const cleanDivs = (): divType[] =>
  cloneDeep(mockDivs).map((d) => ({
    ...d,
    div_name_err: "",
    hdcp_per_err: "",
    hdcp_from_err: "",
    errClassName: "",
  }));

/** cleanDivs plus a 3rd division ("50+") that has nothing linked to it */
const thirdDivId = "div_3";
const cleanDivsPlusThird = (): divType[] => {
  const divs = cleanDivs();
  return [
    ...divs,
    {
      ...initDiv,
      id: thirdDivId,
      sort_order: 3,
      div_name: "50+",
      tab_title: "50+",
      tmnt_id: divs[0].tmnt_id,
    },
  ];
};

/** renders OneToNDivs with mock setters; any prop can be overridden */
const renderDivs = (overrides: Partial<Props> = {}) => {
  const setDivs = jest.fn();
  const setAcdnErr = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    divs: cleanDivs(),
    setDivs,
    pots: [],
    brkts: [],
    elims: [],
    setAcdnErr,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<OneToNDivs {...props} />);
  return { props, setDivs, setAcdnErr, markPendingChanges };
};

/** wraps OneToNDivs in real state, so setDivs re-renders the component */
const StatefulDivs: React.FC<{
  initialDivs: divType[];
  markPendingChanges?: jest.Mock;
}> = ({ initialDivs, markPendingChanges }) => {
  const [divs, setDivs] = React.useState(initialDivs);
  return (
    <OneToNDivs
      divs={divs}
      setDivs={setDivs}
      pots={[]}
      brkts={[]}
      elims={[]}
      setAcdnErr={jest.fn()}
      isDisabled={false}
      markPendingChanges={markPendingChanges}
    />
  );
};

/** the divs array from the last setDivs call */
const lastDivs = (setDivs: jest.Mock): divType[] =>
  setDivs.mock.calls[setDivs.mock.calls.length - 1][0];

/** one div from the last setDivs call */
const lastDiv = (setDivs: jest.Mock, id: string): divType => {
  const div = lastDivs(setDivs).find((d) => d.id === id);
  if (!div) throw new Error(`div ${id} not in last setDivs call`);
  return div;
};

/** the value from the last setAcdnErr call */
const lastAcdnErr = (setAcdnErr: jest.Mock) =>
  setAcdnErr.mock.calls[setAcdnErr.mock.calls.length - 1][0];

const nameInputs = () =>
  screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
const hdcpPerInputs = () =>
  screen.getAllByRole("textbox", { name: /hdcp %/i }) as HTMLInputElement[];
const hdcpFromInputs = () =>
  screen.getAllByRole("spinbutton", { name: /hdcp from/i }) as HTMLInputElement[];

// ---------------------------------------------------------------------------

describe("OneToNDivs - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add division", () => {
    it("passes the divs plus one new division with correct defaults to setDivs", async () => {
      const user = userEvent.setup();
      const startingDivs = cleanDivs();
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({
        divs: startingDivs,
      });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setDivs).toHaveBeenCalledTimes(1);

      const updatedDivs = lastDivs(setDivs);
      expect(updatedDivs).toHaveLength(startingDivs.length + 1);
      // existing divs are passed through unchanged
      expect(updatedDivs.slice(0, startingDivs.length)).toEqual(startingDivs);

      const prevLast = startingDivs[startingDivs.length - 1];
      const newDiv = updatedDivs[updatedDivs.length - 1];
      const expectedName = `Division ${prevLast.sort_order + 1}`;

      expect(newDiv).toEqual({
        ...initDiv,
        id: newDiv.id,
        tmnt_id: startingDivs[0].tmnt_id,
        div_name: expectedName,
        tab_title: expectedName,
        sort_order: prevLast.sort_order + 1,
      });
      expect(newDiv.id).toMatch(/^div_/);
      expect(startingDivs.some((d) => d.id === newDiv.id)).toBe(false);

      // adding does not validate, so no accordion error
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("appends a new tab and keeps the first tab active", async () => {
      const user = userEvent.setup();
      const markPendingChanges = jest.fn();
      render(
        <StatefulDivs
          initialDivs={cleanDivs()}
          markPendingChanges={markPendingChanges}
        />,
      );

      let tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("numbers each new division one higher than the last", async () => {
      const user = userEvent.setup();
      const startingDivs = cleanDivs();
      const lastSort = startingDivs[startingDivs.length - 1].sort_order;
      render(<StatefulDivs initialDivs={startingDivs} />);

      const addBtn = () => screen.getByRole("button", { name: /add/i });
      await user.click(addBtn());
      await user.click(addBtn());

      expect(
        screen.getByRole("tab", { name: `Division ${lastSort + 1}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: `Division ${lastSort + 2}` }),
      ).toBeInTheDocument();
    });
  });

  describe("delete division", () => {
    it("does not show a Delete button for the first division", () => {
      const divs = cleanDivs();
      renderDivs({ divs });

      expect(screen.queryByTestId(`divDel${divs[0].id}`)).not.toBeInTheDocument();
      expect(screen.getByTestId(`divDel${divs[1].id}`)).toBeInTheDocument();
    });

    it("asks to confirm, then removes the division and clears the accordion error", async () => {
      const user = userEvent.setup();
      const divs = cleanDivsPlusThird();
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({ divs });

      await user.click(screen.getByTestId(`divDel${thirdDivId}`));

      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText("Do you want to delete Division: 50+?"),
      ).toBeInTheDocument();
      // nothing happens until the user confirms
      expect(setDivs).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setDivs).toHaveBeenCalledTimes(1);
      const updatedDivs = lastDivs(setDivs);
      expect(updatedDivs).toEqual(divs.filter((d) => d.id !== thirdDivId));
      expect(lastAcdnErr(setAcdnErr)).toEqual(noAcdnErr);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("after a delete, sets the accordion error to the next division that still has an error", async () => {
      const user = userEvent.setup();
      const divs = cleanDivsPlusThird();
      divs[1].hdcp_per_err = "Hdcp % error";
      const { setAcdnErr } = renderDivs({ divs });

      await user.click(screen.getByTestId(`divDel${thirdDivId}`));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(lastAcdnErr(setAcdnErr)).toEqual({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(divs[1].div_name, "Hdcp % error"),
      });
    });

    it("after a delete, makes the first tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulDivs initialDivs={cleanDivsPlusThird()} />);

      await user.click(screen.getByRole("tab", { name: "50+" }));
      expect(screen.getByRole("tab", { name: "50+" })).toHaveAttribute(
        "aria-selected",
        "true",
      );

      await user.click(screen.getByTestId(`divDel${thirdDivId}`));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user cancels", async () => {
      const user = userEvent.setup();
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({
        divs: cleanDivsPlusThird(),
      });

      await user.click(screen.getByTestId(`divDel${thirdDivId}`));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /no/i }));

      expect(setDivs).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    const blockers: [string, string, (divId: string) => Partial<Props>][] = [
      ["Pot", "a Pot", (divId) => ({ pots: [{ ...mockPots[0], div_id: divId }] })],
      [
        "Bracket",
        "a Bracket",
        (divId) => ({ brkts: [{ ...mockBrkts[0], div_id: divId }] }),
      ],
      [
        "Eliminator",
        "an Eliminator",
        (divId) => ({ elims: [{ ...mockElims[0], div_id: divId }] }),
      ],
    ];

    it.each(blockers)(
      "shows an error and does not delete when the division has a %s",
      async (_label, phrase, makeProps) => {
        const user = userEvent.setup();
        const divs = cleanDivs();
        const target = divs[1];
        const { setDivs, markPendingChanges } = renderDivs({
          divs,
          ...makeProps(target.id),
        });

        await user.click(screen.getByTestId(`divDel${target.id}`));

        const dialog = await screen.findByRole("dialog");
        expect(
          within(dialog).getByText(
            `Cannot delete Division: ${target.div_name}. It has ${phrase}.`,
          ),
        ).toBeInTheDocument();
        // the error modal has no Yes button, so it is not the confirm modal
        expect(
          within(dialog).queryByRole("button", { name: /yes/i }),
        ).not.toBeInTheDocument();

        await user.click(within(dialog).getByRole("button", { name: /close/i }));

        expect(setDivs).not.toHaveBeenCalled();
        expect(markPendingChanges).not.toHaveBeenCalled();
        await waitFor(() =>
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
      },
    );
  });

  describe("editing fields", () => {
    it("updating div_name sets the tab title and clears the name error and accordion error", () => {
      const divs = cleanDivs();
      divs[1].div_name_err = "Div Name is required";
      divs[1].errClassName = objErrClassName;
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({ divs });

      fireEvent.change(nameInputs()[1], {
        target: { value: "New Division Name" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.div_name).toBe("New Division Name");
      expect(updated.tab_title).toBe("New Division Name");
      expect(updated.div_name_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastAcdnErr(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited division", () => {
      const divs = cleanDivs();
      const { setDivs } = renderDivs({ divs });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      expect(lastDivs(setDivs)[0]).toBe(divs[0]);
    });

    it("keeps other errors on the edited division and leaves it marked as an error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_from_err = "Hdcp From error";
      divs[1].errClassName = objErrClassName;
      const { setDivs, setAcdnErr } = renderDivs({ divs });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_from_err).toBe("Hdcp From error");
      expect(updated.errClassName).toBe(objErrClassName);
      expect(lastAcdnErr(setAcdnErr)).toEqual({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg("Changed", "Hdcp From error"),
      });
    });

    it("sets the accordion error to another division's error when the edited one is fixed", () => {
      const divs = cleanDivs();
      divs[0].hdcp_per_err = "Hdcp % error";
      divs[1].div_name_err = "Div Name is required";
      const { setAcdnErr } = renderDivs({ divs });

      fireEvent.change(nameInputs()[1], { target: { value: "Fixed" } });

      expect(lastAcdnErr(setAcdnErr)).toEqual({
        errClassName: acdnErrClassName,
        message: getAcdnErrMsg(divs[0].div_name, "Hdcp % error"),
      });
    });

    it("editing hdcp_from from invalid to valid clears its error and the accordion error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_from = minHdcpFrom - 10;
      divs[1].hdcp_from_err = "Hdcp From cannot be less than something";
      divs[1].errClassName = objErrClassName;
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({ divs });

      fireEvent.change(hdcpFromInputs()[1], {
        target: { value: validHdcpFrom },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_from).toBe(validHdcpFrom);
      expect(updated.hdcp_from_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastAcdnErr(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("editing Hdcp % to a valid percent updates hdcp_per and clears its error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_per_err = "Hdcp % cannot be more than X";
      divs[1].errClassName = objErrClassName;
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({ divs });

      fireEvent.change(hdcpPerInputs()[1], { target: { value: "10" } });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_per).toBe(0.1); // 10% => 0.10
      expect(updated.hdcp_per_str).toBe("10");
      expect(updated.hdcp_per_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastAcdnErr(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("setting Hdcp % to 0 resets an out-of-range Hdcp From to the default and clears its error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_per = 0.5;
      divs[1].hdcp_from = maxHdcpFrom + 10;
      divs[1].hdcp_from_err = "Hdcp From cannot be more than something";
      divs[1].errClassName = objErrClassName;
      const { setDivs, setAcdnErr } = renderDivs({ divs });

      fireEvent.change(hdcpPerInputs()[1], { target: { value: "0" } });

      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_per).toBe(0);
      expect(updated.hdcp_per_str).toBe("0");
      expect(updated.hdcp_from).toBe(defaultHdcpFrom);
      expect(updated.hdcp_from_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastAcdnErr(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("setting Hdcp % to 0 keeps an in-range Hdcp From", () => {
      const divs = cleanDivs();
      divs[1].hdcp_per = 0.5;
      divs[1].hdcp_from = validHdcpFrom;
      const { setDivs } = renderDivs({ divs });

      fireEvent.change(hdcpPerInputs()[1], { target: { value: "0" } });

      expect(lastDiv(setDivs, divs[1].id).hdcp_from).toBe(validHdcpFrom);
    });

    it("disables Hdcp From when Hdcp % is 0 and enables it otherwise", () => {
      const divs = cleanDivs();
      divs[0].hdcp_per = 0;
      divs[1].hdcp_per = 0.5;
      renderDivs({ divs });

      expect(hdcpFromInputs()[0]).toBeDisabled();
      expect(hdcpFromInputs()[1]).toBeEnabled();
    });
  });

  describe("handleBlur defaults", () => {
    it("an empty div_name resets to 'Division <sort_order>' and clears the name error", () => {
      const divs = cleanDivs();
      divs[1].div_name_err = "Div Name is required";
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({ divs });

      fireEvent.blur(nameInputs()[1], {
        target: { name: "div_name", value: "" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      const expectedName = `Division ${divs[1].sort_order}`;
      expect(updated.div_name).toBe(expectedName);
      expect(updated.tab_title).toBe(expectedName);
      // the old code cleared "name_err", a field that doesn't exist
      expect(updated.div_name_err).toBe("");
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("an empty Hdcp % resets to 0 / '0.00' and clears its error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_per = 0.5;
      divs[1].hdcp_per_str = "50.00";
      divs[1].hdcp_per_err = "Some hdcp % error";
      const { setDivs, markPendingChanges } = renderDivs({ divs });

      fireEvent.blur(hdcpPerInputs()[1], {
        target: { name: "hdcp_per_str", value: "" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_per).toBe(0);
      expect(updated.hdcp_per_str).toBe("0.00");
      expect(updated.hdcp_per_err).toBe("");
    });

    it("an empty Hdcp From resets to 0 and clears its error", () => {
      const divs = cleanDivs();
      divs[1].hdcp_per = 0.5;
      divs[1].hdcp_from = maxHdcpFrom + 10;
      divs[1].hdcp_from_err = "Hdcp From cannot be more than something";
      const { setDivs, markPendingChanges } = renderDivs({ divs });

      fireEvent.blur(hdcpFromInputs()[1], {
        target: { name: "hdcp_from", value: "" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastDiv(setDivs, divs[1].id);
      expect(updated.hdcp_from).toBe(0);
      expect(updated.hdcp_from_err).toBe("");
    });

    it("a non-empty value does nothing", () => {
      const { setDivs, markPendingChanges } = renderDivs();

      fireEvent.blur(nameInputs()[1], {
        target: { name: "div_name", value: "Still Here" },
      });

      expect(setDivs).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("isDisabled = true", () => {
    it("disables Add, and clicking it does nothing", async () => {
      const user = userEvent.setup();
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({
        isDisabled: true,
      });

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeDisabled();
      await user.click(addBtn);

      expect(setDivs).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });

    it("disables Delete, and clicking it opens no modal", async () => {
      const user = userEvent.setup();
      const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({
        divs: cleanDivsPlusThird(),
        isDisabled: true,
      });

      const delBtn = screen.getByTestId(`divDel${thirdDivId}`);
      expect(delBtn).toBeDisabled();
      await user.click(delBtn);

      expect(setDivs).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it.each([
      ["Div Name", nameInputs, "Some New Name"],
      ["Hdcp %", hdcpPerInputs, "10"],
      ["Hdcp From", hdcpFromInputs, "220"],
    ] as const)(
      "disables every %s input, and typing does nothing",
      async (_label, getInputs, text) => {
        const user = userEvent.setup();
        const divs = cleanDivs().map((d) => ({ ...d, hdcp_per: 0.5 }));
        const { setDivs, setAcdnErr, markPendingChanges } = renderDivs({
          divs,
          isDisabled: true,
        });

        for (const input of getInputs()) {
          expect(input).toBeDisabled();
          await user.type(input, text);
        }

        expect(setDivs).not.toHaveBeenCalled();
        expect(setAcdnErr).not.toHaveBeenCalled();
        expect(markPendingChanges).not.toHaveBeenCalled();
      },
    );
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds a division without crashing", async () => {
      const user = userEvent.setup();
      const { setDivs } = renderDivs({ markPendingChanges: undefined });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(setDivs).toHaveBeenCalled();
    });

    it("updates div_name without crashing", () => {
      const { setDivs } = renderDivs({ markPendingChanges: undefined });

      fireEvent.change(nameInputs()[0], { target: { value: "Updated Div" } });

      expect(setDivs).toHaveBeenCalled();
    });

    it("deletes a division without crashing", async () => {
      const user = userEvent.setup();
      const { setDivs } = renderDivs({
        divs: cleanDivsPlusThird(),
        markPendingChanges: undefined,
      });

      await user.click(screen.getByTestId(`divDel${thirdDivId}`));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(setDivs).toHaveBeenCalled();
    });
  });
});

