// test/app/results/tmntHeader/tmntHomeHeader.test.tsx

import React from "react";
import { render, screen } from "@testing-library/react";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";

const tmntId = "tmt_1234567890";
const tmntName = "Test Tournament";

describe("TmntHomeHeader", () => {
  it("renders the tournament name", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: tmntName,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders the Home link with the correct href", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Home" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/home`,
    );
  });

  it("renders the Players link with the correct href", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Players" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/players`,
    );
  });

  it("renders the Standings link with the correct href", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Standings" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/standings`,
    );
  });

  it("does not render optional links by default", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Brackets" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Pots" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Elims" }),
    ).not.toBeInTheDocument();
  });

  it("renders the Brackets link when hasBrackets is true", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
        hasBrackets
      />,
    );

    expect(
      screen.getByRole("link", { name: "Brackets" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/brackets`,
    );
  });

  it("renders the Pots link when hasPots is true", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
        hasPots
      />,
    );

    expect(
      screen.getByRole("link", { name: "Pots" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/pots`,
    );
  });

  it("renders the Elims link when hasElims is true", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
        hasElims
      />,
    );

    expect(
      screen.getByRole("link", { name: "Elims" }),
    ).toHaveAttribute(
      "href",
      `/results/tmnt/${tmntId}/elims`,
    );
  });

  it("renders all links when all optional flags are true", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
        hasBrackets
        hasPots
        hasElims
      />,
    );

    expect(
      screen.getByRole("link", { name: "Home" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Players" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Standings" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Brackets" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Pots" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Elims" }),
    ).toBeInTheDocument();
  });
    
  it("centers the tournament name", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: tmntName,
    });

    expect(heading).toHaveClass("text-center");
  });

  it("centers and wraps the navigation links", () => {
    render(
      <TmntHomeHeader
        tmntId={tmntId}
        tmntName={tmntName}
      />,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Tournament navigation",
    });

    expect(navigation).toHaveClass(
      "d-flex",
      "justify-content-center",
      "gap-2",
      "flex-wrap",
    );
  });
});