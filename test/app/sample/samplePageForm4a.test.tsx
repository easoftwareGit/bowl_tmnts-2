import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'; // for better assertion messages

// Import the component that contains the HTML code
// For the purpose of this example, I'll assume you have a component named SamplePage
import SamplePage from '../../../src/app/sample/page';

describe('SamplePage', () => {
  test('renders input fields correctly', () => {
    // Render the SamplePage component
    render(<SamplePage />);

    // Assert that the input fields are rendered correctly
    expect(screen.getByLabelText('Event Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Event')).toBeInTheDocument();
  });

  test('adds new event correctly', async () => {
    const user = userEvent.setup()
    // Render the SamplePage component
    render(<SamplePage />);

    const addBtn = screen.getByRole('button', { name: 'Add Event' });
    const eventName = screen.getByLabelText('Event Name');
    await user.clear(eventName);
    await user.type(eventName, 'Trios');
    await user.click(addBtn);
    
    const selectedEvent = screen.getByLabelText('Select Event');
    expect(selectedEvent).toHaveTextContent('Trios');
  });

  test('selects event correctly', () => {
    // Render the SamplePage component
    render(<SamplePage />);

    // Get the select input and change its value
    fireEvent.change(screen.getByTestId('selectEvent'), { target: { value: 'evt_6ff6774e94884658be5bdebc68a6aa7c' } });

    // Assert that the event is selected correctly
    expect(screen.getByTestId('selectEvent')).toHaveValue('evt_6ff6774e94884658be5bdebc68a6aa7c');
  });

  // You can write more tests to cover other functionalities like input change events, form submission, etc.
});
