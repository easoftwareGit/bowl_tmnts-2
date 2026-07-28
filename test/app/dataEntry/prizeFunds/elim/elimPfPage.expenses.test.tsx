import { screen, waitFor } from "@testing-library/react";
import {
  setup,
  standardBeforeEach,
} from "./elimPfPage.testSetup.test";

describe("Expenses", () => {
  beforeEach(() => {
    standardBeforeEach();
  });

  it("passes the total prize fund to the grid when expenses change", async () => {
    const {
      user,
      tmntData,
      elimId,
    } = setup();

    const entryFees =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "ENTRIES" &&
          money.flow === "IN" &&
          money.pot_id === null &&
          money.brkt_id === null &&
          money.elim_id === elimId,
      )!.amount!;

    const expensesInput =
      screen.getByLabelText("Expenses");

    await user.clear(expensesInput);
    await user.type(expensesInput, "15");
    await user.tab();

    const expected = entryFees - 15;

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "mock-grid-total-prize-fund",
        ),
      ).toHaveTextContent(expected.toString());
    });
  });

  it("rejects a negative sign in the expenses input", async () => {
    const { user } = setup();

    const expenses =
      screen.getByLabelText("Expenses");

    await user.clear(expenses);
    await user.type(expenses, "-5");

    expect(expenses).toHaveValue("5");
  });

  it("limits expenses to the maximum prize fund", async () => {
    const {
      user,
      tmntData,
      elimId,
    } = setup();

    const prizeFundMoney =
      tmntData.moneys.find(
        (money) =>
          money.descrip === "PRIZEFUND" &&
          money.flow === "OUT" &&
          money.pot_id === null &&
          money.brkt_id === null &&
          money.elim_id === elimId,
      );

    expect(prizeFundMoney).toBeDefined();

    const prizeFund = prizeFundMoney!.amount!;

    const expenses =
      screen.getByLabelText("Expenses");

    await user.clear(expenses);
    await user.type(expenses, "999999");
    await user.tab();

    expect(expenses).toHaveValue(
      prizeFund.toFixed(2),
    );
  });

  it("changes an empty expenses value to zero", async () => {
    const { user } = setup();

    const expenses =
      screen.getByLabelText("Expenses");

    await user.clear(expenses);
    await user.tab();

    expect(expenses).toHaveValue("0.00");
  });

  it("truncates expenses to two decimal places", async () => {
    const { user } = setup();

    const expenses =
      screen.getByLabelText("Expenses");

    await user.clear(expenses);
    await user.type(expenses, "12.349");
    await user.tab();

    expect(expenses).toHaveValue("12.34");
  });
});