import React from 'react';
import { render, screen } from '../../test-utils'; // Import the custom render function
import userEvent from "@testing-library/user-event";
import RootLayout from '../../../src/app/layout';
import SamplePage from '@/app/sample/page';

describe('RootLayout', () => {
  it('renders children correctly', () => {    
    render(<RootLayout><SamplePage /></RootLayout>);
    const eventName = screen.getByText(/event name/i);
    expect(eventName).toBeInTheDocument();
  });

  it('add a pet', async () => { 
    const user = userEvent.setup()
    render(<RootLayout><SamplePage /></RootLayout>);
    const eventName = screen.getByLabelText(/event name/i);
    await user.clear(eventName);
    await user.type(eventName, 'Bird')
    const addBtn = screen.getByRole('button', { name: /add pet/i });
    await user.click(addBtn);
    const petSelect = screen.getByRole('combobox', { name: /event/i }) as HTMLScriptElement;      
    expect(petSelect).toHaveTextContent('Bird')
    await user.clear(eventName)
    await user.type(eventName, 'Fish')
    await user.click(addBtn);
    expect(petSelect).toHaveTextContent('Fish')
  })
});