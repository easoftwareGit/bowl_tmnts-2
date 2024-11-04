import React from "react";
import { render, screen } from '../../../test-utils'
import RootLayout from '../../../../src/app/layout';

describe('EaNavBar - Component', () => {  
  it('renders navBar brand', () => { 
    render(<RootLayout> </RootLayout>)
    const btDb = screen.getByText(/bt db/i);
    expect(btDb).toBeInTheDocument();    
  })
  it('render "Hello" nav menu button', () => {
    render(<RootLayout> </RootLayout>)
    const helloBtn = screen.getByText(/hello/i);
    expect(helloBtn).toBeInTheDocument();
  })
  it('render "Results" nav menu button', () => { 
    render(<RootLayout> </RootLayout>)
    const resultsBtn = screen.getByText(/results/i);
    expect(resultsBtn).toBeInTheDocument();
  })
  it('render "Upcoming" nav menu button', () => {
    render(<RootLayout> </RootLayout>)
    const upcomingBtn = screen.getByText(/upcoming/i);
    expect(upcomingBtn).toBeInTheDocument();
  })
  it('render "Contact" nav menu item', () => {
    render(<RootLayout> </RootLayout>)
    const contactBtn = screen.getByText(/contact/i);
    expect(contactBtn).toBeInTheDocument();
  })
  it('render "Sample" nav menu item', () => {
    render(<RootLayout> </RootLayout>)
    const sampleBtn = screen.getByText(/sample/i);
    expect(sampleBtn).toBeInTheDocument();
  })
  it('render "Tmnt Data" nav menu item', () => { 
    render(<RootLayout> </RootLayout>)
    const tmntDataBtn = screen.getByText(/tmnt data/i);
    expect(tmntDataBtn).toBeInTheDocument();
  })
  it('render "Log In" nav menu item', () => { 
    render(<RootLayout> </RootLayout>)
    const logInBtn = screen.getByText(/log in/i);
    expect(logInBtn).toBeInTheDocument();
  })
})
