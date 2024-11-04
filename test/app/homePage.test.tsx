import React from "react";
import { render, screen } from '../test-utils'
import RootLayout from '../../src/app/layout';
import Home from '../../src/app/page'

describe('Home - Page', () => {
  it('render home page', async () => {
    render(<RootLayout><Home /></RootLayout>)
    const homePage = screen.getByText(/home page/i);
    expect(homePage).toBeInTheDocument();
  })
})