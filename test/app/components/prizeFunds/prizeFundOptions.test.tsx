import React from "react";
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import PrizeFundOptions from "@/components/prizeFunds/prizeFundOptions";
import { SquadStage } from "@prisma/client";
import {
  mockTmntFullData,
  tmntId,
  divId1,
  potId1,
  elimId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

const renderComponent = (
  stage: SquadStage,
  show = true,
) => {
  const onClose = jest.fn();

  render(
    <PrizeFundOptions
      show={show}
      fullTmntData={mockTmntFullData}
      stage={stage}
      onClose={onClose}
    />,
  );

  return { onClose };
};

describe("rendering", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("does not render when show=false", () => {
    renderComponent(SquadStage.DEFINE, false);

    expect(
      screen.queryByText("Prize Funds"),
    ).not.toBeInTheDocument();
  });

  it("renders popup when show=true", () => {
    renderComponent(SquadStage.DEFINE);

    expect(
      screen.getByText("Prize Funds"),
    ).toBeInTheDocument();
  });
});

describe("prize fund list", () => {
  it("shows all divisions, pots and elims when prize funds are enabled", () => {
    renderComponent(SquadStage.SCORES);

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(6);

    expect(options[0]).toHaveTextContent("Division");
    expect(options[1]).toHaveTextContent("Division");

    expect(options[2]).toHaveTextContent("Pot");
    expect(options[3]).toHaveTextContent("Pot");

    expect(options[4]).toHaveTextContent("Elim");
    expect(options[5]).toHaveTextContent("Elim");
  });

  it("does not show prize fund list when prize funds are disabled", () => {
    renderComponent(SquadStage.DEFINE);

    expect(
      screen.queryByRole("combobox"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryAllByRole("option"),
    ).toHaveLength(0);
  });
});

describe("closing", () => {
  it("calls onClose when close button clicked", () => {
    const { onClose } = renderComponent(SquadStage.DEFINE);

    fireEvent.click(screen.getByLabelText("Close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on outside click", () => {
    const { onClose } = renderComponent(SquadStage.DEFINE);

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Continue button clicked", () => {
    const { onClose } = renderComponent(SquadStage.DEFINE);

    fireEvent.click(
      screen.getByRole("button", { name: "Continue" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("stage logic", () => {
  it("does not enable prize funds during DEFINE", () => {
    renderComponent(SquadStage.DEFINE);

    expect(
      screen.getByText("Prize Funds not enabled yet."),
    ).toBeInTheDocument();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("does not enable prize funds during ENTRIES", () => {
    renderComponent(SquadStage.ENTRIES);

    expect(
      screen.getByText("Prize Funds not enabled yet."),
    ).toBeInTheDocument();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("enables prize funds during SCORES", () => {
    renderComponent(SquadStage.SCORES);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();

    expect(
      screen.queryByText("Prize Funds not enabled yet."),
    ).not.toBeInTheDocument();
  });

  it("enables prize funds during FINISHED", () => {
    renderComponent(SquadStage.FINISHED);

    expect(screen.getByRole("combobox")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();

    expect(
      screen.queryByText("Prize Funds not enabled yet."),
    ).not.toBeInTheDocument();
  });
});

describe("navigation", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("navigates to division prize fund", () => {
    renderComponent(SquadStage.SCORES);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(push).toHaveBeenCalledWith(
      `/dataEntry/prizeFunds/tmnt/${tmntId}/div/${divId1}`,
    );
  });

  it("navigates to pot prize fund", () => {
    renderComponent(SquadStage.SCORES);

    fireEvent.change(
      screen.getByRole("combobox"),
      {
        target: {
          value: potId1,
        },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(push).toHaveBeenCalledWith(
      `/dataEntry/prizeFunds/tmnt/${tmntId}/pot/${potId1}`,
    );
  });

  it("navigates to elim prize fund", () => {
    renderComponent(SquadStage.SCORES);

    fireEvent.change(
      screen.getByRole("combobox"),
      {
        target: {
          value: elimId1,
        },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(push).toHaveBeenCalledWith(
      `/dataEntry/prizeFunds/tmnt/${tmntId}/elim/${elimId1}`,
    );
  });
});

describe("disabled navigation", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("does not allow navigation during DEFINE", () => {
    renderComponent(SquadStage.DEFINE);

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    expect(push).not.toHaveBeenCalled();
  });

  it("does not allow navigation during ENTRIES", () => {
    renderComponent(SquadStage.ENTRIES);

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    expect(push).not.toHaveBeenCalled();
  });
});
