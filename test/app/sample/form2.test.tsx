import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { Form2 } from '@/app/sample/form2';

describe("Form2 - Component", () => {
  it('confirm initial status of fruit radio buttons', () => { 
    const user = userEvent.setup()
    render(<Form2 />);
    const appleRadio = screen.getByLabelText("Apple");
    const bananaRadio = screen.getByLabelText("Banana");
    const cherryRadio = screen.getByLabelText("Cherry");
    expect(appleRadio).toBeChecked();
    // expect(appleRadio).not.toBeChecked();
    expect(bananaRadio).not.toBeChecked();
    expect(cherryRadio).not.toBeChecked();    
  })
  it('confirm initial status of number radio buttons', () => { 
    const user = userEvent.setup()
    render(<Form2 />);
    const oneRadio = screen.getByLabelText("One");
    const twoRadio = screen.getByLabelText("Two");
    const threeRadio = screen.getByLabelText("Three");
    expect(oneRadio).not.toBeChecked();
    // expect(twoRadio).not.toBeChecked();
    expect(twoRadio).toBeChecked();
    expect(threeRadio).not.toBeChecked();
  })
  it('confirm checked status of fruit radio buttons', async () => { 
    const user = userEvent.setup()
    render(<Form2 />);
    const appleRadio = screen.getByLabelText("Apple");
    const bananaRadio = screen.getByLabelText("Banana");
    const cherryRadio = screen.getByLabelText("Cherry");
    
    await user.click(bananaRadio);
    expect(appleRadio).not.toBeChecked();
    expect(bananaRadio).toBeChecked();
    expect(cherryRadio).not.toBeChecked();

    expect(appleRadio.getAttributeNames()).not.toContain("checked")
    expect(bananaRadio.getAttributeNames()).toContain("checked")
    expect(cherryRadio.getAttributeNames()).not.toContain("checked")

    await user.click(cherryRadio);
    expect(appleRadio).not.toBeChecked();
    expect(bananaRadio).not.toBeChecked();
    expect(cherryRadio).toBeChecked();

    await user.click(appleRadio);
    await waitFor(() => {
      expect(appleRadio).toBeChecked();  
    })    
    expect(appleRadio).toBeChecked();
    expect(bananaRadio).not.toBeChecked();
    expect(cherryRadio).not.toBeChecked();

  })
  it('confirm checked status of number radio buttons', async () => {
    const user = userEvent.setup()
    render(<Form2 />);
    const oneRadio = screen.getByLabelText("One");
    const twoRadio = screen.getByLabelText("Two");
    const threeRadio = screen.getByLabelText("Three");
    // expect(oneRadio).not.toBeChecked();
    // expect(twoRadio).not.toBeChecked();
    // expect(threeRadio).not.toBeChecked();

    await user.click(oneRadio);
    expect(oneRadio).toBeChecked();
    expect(twoRadio).not.toBeChecked();
    expect(threeRadio).not.toBeChecked();

    await user.click(twoRadio);
    expect(oneRadio).not.toBeChecked();
    expect(twoRadio).toBeChecked();
    expect(threeRadio).not.toBeChecked();

    await user.click(threeRadio);
    expect(oneRadio).not.toBeChecked();
    expect(twoRadio).not.toBeChecked();
    expect(threeRadio).toBeChecked();
  })
})