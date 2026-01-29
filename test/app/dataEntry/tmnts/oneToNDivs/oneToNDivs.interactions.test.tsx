import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNDivs from "@/app/dataEntry/tmntForm/oneToNDivs";
import { mockDivs, mockPots, mockBrkts, mockElims } from '../../../../mocks/tmnts/twoDivs/mockDivs'
import { initDiv, defaultHdcpFrom } from "@/lib/db/initVals";
import { noAcdnErr } from "@/app/dataEntry/tmntForm/errors";
import { cloneDeep } from "lodash";
import { maxHdcpFrom, minHdcpFrom } from "@/lib/validation/validation";

const mockSetDivs = jest.fn();
const mockSetAcdnErr = jest.fn();

const mockOneToNDivsProps = {
  divs: mockDivs,
  setDivs: mockSetDivs,
  pots: mockPots,
  brkts: mockBrkts,
  elims: mockElims,
  setAcdnErr: mockSetAcdnErr,
  isDisabled: false,
}

describe("OneToNDivs - interactions", () => { 

  describe("add division", () => {
    beforeEach(() => {
      mockSetDivs.mockClear();
      mockSetAcdnErr.mockClear();
    });

    it("adds a new division and passes updated array with correct defaults to setDivs", async () => {
      // ARRANGE
      const user = userEvent.setup();

      // Work with a fresh copy so we don't mutate the shared mockDivs
      const startingDivs = cloneDeep(mockDivs);
      const props = {
        ...mockOneToNDivsProps,
        divs: startingDivs,
      };

      render(<OneToNDivs {...props} />);

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeInTheDocument();

      // ACT
      await user.click(addBtn);

      // ASSERT – setDivs should have been called with a new array
      expect(mockSetDivs).toHaveBeenCalled();

      const lastCall = mockSetDivs.mock.calls[mockSetDivs.mock.calls.length - 1] as [typeof mockDivs];
      const [updatedDivs] = lastCall;

      // Length increased by exactly 1
      expect(updatedDivs).toHaveLength(startingDivs.length + 1);

      const prevLast = startingDivs[startingDivs.length - 1];
      const newDiv = updatedDivs[updatedDivs.length - 1];

      // New div has a new id
      expect(typeof newDiv.id).toBe("string");
      expect(newDiv.id).not.toBe(prevLast.id);
      expect(startingDivs.some((d) => d.id === newDiv.id)).toBe(false);

      // sort_order increments from previous last
      expect(newDiv.sort_order).toBe(prevLast.sort_order + 1);

      // Name / tab_title follow "Division N"
      const expectedName = `Division ${newDiv.sort_order}`;
      expect(newDiv.div_name).toBe(expectedName);
      expect(newDiv.tab_title).toBe(expectedName);

      // tmnt_id propagated from the first div
      expect(newDiv.tmnt_id).toBe(startingDivs[0].tmnt_id);

      // Hdcp-related fields should match initDiv defaults (except what we explicitly override in handleAdd)
      expect(newDiv.hdcp_per).toBe(initDiv.hdcp_per);
      expect(newDiv.hdcp_per_str).toBe(initDiv.hdcp_per_str);
      expect(newDiv.hdcp_from).toBe(initDiv.hdcp_from);

      // No immediate accordion error just from adding a div
      // (validateDivs is not run here, so setAcdnErr should not be called)
      expect(mockSetAcdnErr).not.toHaveBeenCalled();
    });

    it("after adding a division, the first tab stays active and the new tab is appended", async () => {
      // Use a small host component with real React state so that setDivs actually re-renders
      const TestHost = () => {
        const [divs, setDivs] = React.useState(cloneDeep(mockDivs));

        const props = {
          ...mockOneToNDivsProps,
          divs,
          setDivs,
        };

        return <OneToNDivs {...props} />;
      };

      const user = userEvent.setup();

      render(<TestHost />);

      // Initially, there should be 2 tabs, with the first selected
      let tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeInTheDocument();

      // ACT – add a new division
      await user.click(addBtn);

      // After state update, there should now be 3 tabs
      tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);

      // First tab should still be the active one
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      // New tab (last one) should NOT be active by default
      const lastTab = tabs[tabs.length - 1];
      expect(lastTab).toHaveAttribute("aria-selected", "false");
    });
  }); 

  describe("delete division", () => { 

    it("delete division", async () => {
      const user = userEvent.setup();
      
      const localDivs = cloneDeep(mockDivs);
      // Add a third division that we will actually delete
      const divToDeleteId = "3";
      localDivs.push({
        ...initDiv,
        id: divToDeleteId,
        sort_order: 3,
        div_name: "50+",
        tab_title: "50+",
        tmnt_id: localDivs[0].tmnt_id,
      });

      const localSetDivs = jest.fn();
      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
      };

      render(<OneToNDivs {...props} />);

      // There should now be 3 tabs; select the third one (the one we'll delete)
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      await user.click(tabs[2]);

      // On the third tab, there should be a "Delete Div" button
      const delBtns = screen.getAllByRole("button", { name: /delete div/i });
      expect(delBtns.length).toBeGreaterThanOrEqual(1);

      // Click the delete button for the last division
      await user.click(delBtns[delBtns.length - 1]);

      // This should open the confirm modal (ModalConfirm)
      const dialog = await screen.findByRole("dialog");

      // Inside the dialog, click the [yes] button      
      const yesBtn = within(dialog).getByRole("button", { name: /yes/i });
      await user.click(yesBtn);

      // Now the component should have called setDivs with the filtered array
      expect(localSetDivs).toHaveBeenCalledTimes(1);
      const [updatedDivs] = localSetDivs.mock.calls[0] as [typeof localDivs];

      // The deleted division id should be gone, and length should be one less
      expect(updatedDivs).toHaveLength(localDivs.length - 1);
      expect(updatedDivs.some((d) => d.id === divToDeleteId)).toBe(false);
    });    

    it("shows an error modal and does not delete when the division has a Pot", async () => {
      const user = userEvent.setup();

      // Fresh local copy of divs
      const localDivs = cloneDeep(mockDivs);
      const targetDiv = localDivs[1]; // non-first division we will try to delete

      // Create a pots array that ties a Pot to this division
      const localPots = [
        {
          ...(mockPots[0] || {}),
          div_id: targetDiv.id,
        } as any,
      ];

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        pots: localPots,
        brkts: [], // no brackets
        elims: [], // no elims
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      // Focus the tab for the target division (by tab title)
      const targetTab = screen.getByRole("tab", { name: targetDiv.tab_title });
      await user.click(targetTab);

      // Click the Delete Div button
      const delBtn = screen.getByRole("button", { name: /delete div/i });
      await user.click(delBtn);

      // Expect an error modal (ModalErrorMsg), not the confirm modal
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Error message should mention the Pot
      expect(
        screen.getByText(
          `Cannot delete Division: ${targetDiv.div_name}. It has a Pot.`
        )
      ).toBeInTheDocument();

      // No delete actually performed
      expect(localSetDivs).not.toHaveBeenCalled();

      // Optional: close the error modal by clicking the close button
      const closeBtn = within(dialog).getByRole("button", { name: /close/i });
      await user.click(closeBtn);
    });
    
    it("shows an error modal and does not delete when the division has a Bracket", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const targetDiv = localDivs[1];

      const localBrkts = [
        {
          ...(mockBrkts[0] || {}),
          div_id: targetDiv.id,
        } as any,
      ];

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        pots: [], // no pots
        brkts: localBrkts,
        elims: [],
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const targetTab = screen.getByRole("tab", { name: targetDiv.tab_title });
      await user.click(targetTab);

      const delBtn = screen.getByRole("button", { name: /delete div/i });
      await user.click(delBtn);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      expect(
        screen.getByText(
          `Cannot delete Division: ${targetDiv.div_name}. It has a Bracket.`
        )
      ).toBeInTheDocument();

      expect(localSetDivs).not.toHaveBeenCalled();

      const closeBtn = within(dialog).getByRole("button", { name: /close/i });
      await user.click(closeBtn);
    });

    it("shows an error modal and does not delete when the division has an Eliminator", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const targetDiv = localDivs[1];

      const localElims = [
        {
          ...(mockElims[0] || {}),
          div_id: targetDiv.id,
        } as any,
      ];

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        pots: [],
        brkts: [],
        elims: localElims,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const targetTab = screen.getByRole("tab", { name: targetDiv.tab_title });
      await user.click(targetTab);

      const delBtn = screen.getByRole("button", { name: /delete div/i });
      await user.click(delBtn);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      expect(
        screen.getByText(
          `Cannot delete Division: ${targetDiv.div_name}. It has an Eliminator.`
        )
      ).toBeInTheDocument();

      expect(localSetDivs).not.toHaveBeenCalled();

      const closeBtn = within(dialog).getByRole("button", { name: /close/i });
      await user.click(closeBtn);
    });
    
    it("does not delete when the user cancels in the confirm modal", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      // Add a third division we can safely delete/cancel without touching the first two
      const divToDeleteId = "3";
      localDivs.push({
        ...initDiv,
        id: divToDeleteId,
        sort_order: 3,
        div_name: "50+",
        tab_title: "50+",
        tmnt_id: localDivs[0].tmnt_id,
      });

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        pots: [],
        brkts: [],
        elims: [],
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const targetTab = screen.getByRole("tab", { name: "50+" });
      await user.click(targetTab);

      // const delBtn = screen.getByRole("button", { name: /delete div/i });
      const delBtn = screen.getByTestId('divDel' + divToDeleteId);
      await user.click(delBtn);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Click the No button in the confirm modal
      const noBtn = within(dialog).getByRole("button", { name: /no/i });
      await user.click(noBtn);

      // No delete should have happened
      expect(localSetDivs).not.toHaveBeenCalled();

      // Confirm modal should be gone
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  })

  describe("editing fields", () => {
    it("updates div_name and tab title and clears field & accordion errors when user enters a valid name", async () => {
      const user = userEvent.setup();

      // Start with clean copies
      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      // Make the second division look like it previously had a name error
      const targetIndex = 1; // second div
      const targetDiv = localDivs[targetIndex];
      targetDiv.div_name_err = "Div Name is required";
      targetDiv.errClassName = "some-error-class";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      // Focus the second tab
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[targetIndex]);

      const nameInputs = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      const input = nameInputs[targetIndex];

      // ACT – user fixes the name
      fireEvent.change(input, { target: { value: "New Division Name" } });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      // Name + tab title updated
      expect(updated.div_name).toBe("New Division Name");
      expect(updated.tab_title).toBe("New Division Name");

      // Field errors cleared
      expect(updated.div_name_err).toBe("");
      expect(updated.errClassName).toBe("");

      // Accordion error should be cleared (noAcdnErr) if there are no other errors
      expect(localSetAcdnErr).toHaveBeenCalled();
      const lastAcdnCall =
        localSetAcdnErr.mock.calls[localSetAcdnErr.mock.calls.length - 1][0];
      expect(lastAcdnCall).toEqual(noAcdnErr);
    });

    it("when hdcp_from is edited from invalid to valid, it clears hdcp_from_err and errClassName and clears accordion error", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1;
      const targetDiv = localDivs[targetIndex];

      // Make hdcp_from invalid and set an error
      targetDiv.hdcp_from = minHdcpFrom - 10;
      targetDiv.hdcp_from_err = "Hdcp From cannot be less than something";
      targetDiv.errClassName = "some-error-class";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[targetIndex]);

      const hdcpFromInputs = screen.getAllByRole("spinbutton", {
        name: /hdcp from/i,
      }) as HTMLInputElement[];

      const hdcpFromInput = hdcpFromInputs[targetIndex];

      const validValue = Math.floor((minHdcpFrom + maxHdcpFrom) / 2);

      // ACT – user types a valid Hdcp From value
      fireEvent.change(hdcpFromInput, { target: { value: validValue } });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      expect(updated.hdcp_from).toBe(validValue);
      expect(updated.hdcp_from_err).toBe("");
      expect(updated.errClassName).toBe("");

      expect(localSetAcdnErr).toHaveBeenCalled();
      const lastAcdnCall =
        localSetAcdnErr.mock.calls[localSetAcdnErr.mock.calls.length - 1][0];
      expect(lastAcdnCall).toEqual(noAcdnErr);
    });

    it("when Hdcp % is edited to a valid percent, it updates hdcp_per and clears its error", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1;
      const targetDiv = localDivs[targetIndex];

      // Pretend Hdcp % previously had an error
      targetDiv.hdcp_per_err = "Hdcp % cannot be more than X";
      targetDiv.errClassName = "some-error-class";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[targetIndex]);

      const hdcpInputs = screen.getAllByRole("textbox", {
        name: /hdcp %/i,
      }) as HTMLInputElement[];

      const hdcpInput = hdcpInputs[targetIndex];

      // ACT – user types 10 (%)
      fireEvent.change(hdcpInput, { target: { value: '10' } });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      // handlePercentValueChange divides by 100, so 10 => 0.10
      expect(updated.hdcp_per).toBe(0.1);
      // hdcp_per_str is based on rawValue, which should be "10"
      expect(updated.hdcp_per_str).toBe("10");
      expect(updated.hdcp_per_err).toBe("");
      expect(updated.errClassName).toBe("");

      // No accordion error if everything is valid
      expect(localSetAcdnErr).toHaveBeenCalled();
      const lastAcdnCall =
        localSetAcdnErr.mock.calls[localSetAcdnErr.mock.calls.length - 1][0];
      expect(lastAcdnCall).toEqual(noAcdnErr);
    });

    it("when Hdcp % is set to 0 and Hdcp From is out of range, it resets Hdcp From to defaultHdcpFrom and clears its error", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1;
      const targetDiv = localDivs[targetIndex];

      // Make Hdcp From out of range with an error
      targetDiv.hdcp_from = maxHdcpFrom + 10;
      targetDiv.hdcp_from_err = "Hdcp From cannot be more than something";
      targetDiv.errClassName = "some-error-class";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[targetIndex]);

      const hdcpInputs = screen.getAllByRole("textbox", {
        name: /hdcp %/i,
      }) as HTMLInputElement[];
      const hdcpInput = hdcpInputs[targetIndex];

      // ACT – user sets Hdcp % to 0
      fireEvent.change(hdcpInput, { target: { value: '0' } });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      // Because hdcp_per === 0 and hdcp_from was out of range,
      // handlePercentValueChange should reset hdcp_from and clear its error
      expect(updated.hdcp_per).toBe(0);
      expect(updated.hdcp_per_str).toBe("0"); // rawValue is "0"
      expect(updated.hdcp_from).toBe(defaultHdcpFrom);
      expect(updated.hdcp_from_err).toBe("");
      expect(updated.errClassName).toBe("");

      expect(localSetAcdnErr).toHaveBeenCalled();
      const lastAcdnCall =
        localSetAcdnErr.mock.calls[localSetAcdnErr.mock.calls.length - 1][0];
      expect(lastAcdnCall).toEqual(noAcdnErr);
    });
  });

  describe("handleBlur defaults behavior", () => {
    it("when div_name is blurred empty, it resets to 'Division <sort_order>' and updates tab_title", () => {
      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1; // use the second division
      const targetDiv = localDivs[targetIndex];

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[targetIndex]);

      const nameInputs = screen.getAllByRole("textbox", {
        name: /div name/i,
      }) as HTMLInputElement[];
      const input = nameInputs[targetIndex];

      // Simulate blur with an empty value
      fireEvent.blur(input, {
        target: { name: "div_name", value: "" },
      });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      const expectedName = `Division ${updated.sort_order}`;

      expect(updated.div_name).toBe(expectedName);
      expect(updated.tab_title).toBe(expectedName);

      // handleBlur doesn't touch accordion error here, so just make sure we didn't accidentally spam it
      // (no strict expectation on how many times it's called elsewhere)
      // No specific setAcdnErr expectation needed.
    });

    it("when Hdcp % is blurred empty, it resets to 0 / '0.00' and clears hdcp_per_err", () => {
      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1;
      const targetDiv = localDivs[targetIndex];

      // Pretend Hdcp % had an error before
      targetDiv.hdcp_per = 0.5; // some non-zero value
      targetDiv.hdcp_per_str = "50.00";
      targetDiv.hdcp_per_err = "Some hdcp % error";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[targetIndex]);

      const hdcpInputs = screen.getAllByRole("textbox", {
        name: /hdcp %/i,
      }) as HTMLInputElement[];
      const hdcpInput = hdcpInputs[targetIndex];

      // Simulate blur with empty value on the Hdcp % input
      fireEvent.blur(hdcpInput, {
        target: { name: "hdcp_per_str", value: "" },
      });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      expect(updated.hdcp_per).toBe(0);
      expect(updated.hdcp_per_str).toBe("0.00");
      expect(updated.hdcp_per_err).toBe("");
      // errClassName is not explicitly reset here, but it's safe to assert it's unchanged or blank
    });

    it("when Hdcp From is blurred empty, it resets to 0 and clears hdcp_from_err", () => {
      const localDivs = cloneDeep(mockDivs).map((d) => ({
        ...d,
        div_name_err: "",
        hdcp_per_err: "",
        hdcp_from_err: "",
        errClassName: "",
      }));

      const targetIndex = 1;
      const targetDiv = localDivs[targetIndex];

      // Pretend Hdcp From was invalid previously
      targetDiv.hdcp_from = 250;
      targetDiv.hdcp_from_err = "Hdcp From cannot be less than something";

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
      };

      render(<OneToNDivs {...props} />);

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[targetIndex]);

      const hdcpFromInputs = screen.getAllByRole("spinbutton", {
        name: /hdcp from/i,
      }) as HTMLInputElement[];
      const hdcpFromInput = hdcpFromInputs[targetIndex];

      // Simulate blur with empty value on the Hdcp From input
      fireEvent.blur(hdcpFromInput, {
        target: { name: "hdcp_from", value: "" },
      });

      expect(localSetDivs).toHaveBeenCalled();

      const lastCall = localSetDivs.mock.calls[localSetDivs.mock.calls.length - 1] as any;
      const [updatedDivs] = lastCall;
      const updated = updatedDivs.find((d: any) => d.id === targetDiv.id)!;

      expect(updated.hdcp_from).toBe(0);
      expect(updated.hdcp_from_err).toBe("");
      // Again, no strict expectations on errClassName here
    });
  });

  describe("isDisabled = true - no side effects", () => {
    it("clicking Add does not call setDivs or setAcdnErr", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
        isDisabled: true,
      };

      render(<OneToNDivs {...props} />);

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeDisabled();

      await user.click(addBtn);

      expect(localSetDivs).not.toHaveBeenCalled();
      expect(localSetAcdnErr).not.toHaveBeenCalled();
    });

    it("clicking Delete does not call setDivs or open a confirm modal", async () => {
      const user = userEvent.setup();

      // Add a third division so we know we have a delete button on a non-first div
      const localDivs = cloneDeep(mockDivs);
      const divToDeleteId = "3";
      localDivs.push({
        ...initDiv,
        id: divToDeleteId,
        sort_order: 3,
        div_name: "50+",
        tab_title: "50+",
        tmnt_id: localDivs[0].tmnt_id,
      });

      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
        isDisabled: true,
      };

      render(<OneToNDivs {...props} />);

      // Focus the tab for the deletable division
      const targetTab = screen.getByRole("tab", { name: "50+" });
      await user.click(targetTab);

      // Use the data-testid from your updated AddOrDelButton: data-testid={`divDel${id}`}
      const delBtn = screen.getByTestId(`divDel${divToDeleteId}`) as HTMLButtonElement;
      expect(delBtn).toBeDisabled();

      await user.click(delBtn);

      // No side effects
      expect(localSetDivs).not.toHaveBeenCalled();
      expect(localSetAcdnErr).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("changing Div Name via user input does not call setDivs or setAcdnErr when disabled", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
        isDisabled: true,
      };

      render(<OneToNDivs {...props} />);

      const nameInputs = screen.getAllByRole("textbox", {
        name: /div name/i,
      }) as HTMLInputElement[];

      // Inputs should be disabled and user typing should have no effect
      for (const input of nameInputs) {
        expect(input).toBeDisabled();
        await user.type(input, "Some New Name");
      }

      expect(localSetDivs).not.toHaveBeenCalled();
      expect(localSetAcdnErr).not.toHaveBeenCalled();
    });

    it("changing Hdcp % via user input does not call setDivs or setAcdnErr when disabled", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
        isDisabled: true,
      };

      render(<OneToNDivs {...props} />);

      const hdcpInputs = screen.getAllByRole("textbox", {
        name: /hdcp %/i,
      }) as HTMLInputElement[];

      for (const input of hdcpInputs) {
        expect(input).toBeDisabled();
        await user.type(input, "10");
      }

      expect(localSetDivs).not.toHaveBeenCalled();
      expect(localSetAcdnErr).not.toHaveBeenCalled();
    });

    it("changing Hdcp From via user input does not call setDivs or setAcdnErr when disabled", async () => {
      const user = userEvent.setup();

      const localDivs = cloneDeep(mockDivs);
      const localSetDivs = jest.fn();
      const localSetAcdnErr = jest.fn();

      const props = {
        ...mockOneToNDivsProps,
        divs: localDivs,
        setDivs: localSetDivs,
        setAcdnErr: localSetAcdnErr,
        isDisabled: true,
      };

      render(<OneToNDivs {...props} />);

      const hdcpFromInputs = screen.getAllByRole("spinbutton", {
        name: /hdcp from/i,
      }) as HTMLInputElement[];

      for (const input of hdcpFromInputs) {
        expect(input).toBeDisabled();
        await user.type(input, "220");
      }

      expect(localSetDivs).not.toHaveBeenCalled();
      expect(localSetAcdnErr).not.toHaveBeenCalled();
    });

  });

})