import React from "react";
import { render, screen } from "@testing-library/react";
import Home from '@/app/page'

describe('Home - Page', () => {
  it('render home page', async () => {
    render(<Home />)
    const homePage = screen.getByText(/home page/i);
    expect(homePage).toBeInTheDocument();
  })
})