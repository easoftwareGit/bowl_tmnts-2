import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WaitModal from '@/components/modal/waitModal';

describe('WaitModal Component', () => {
  test('renders the modal when show is true', () => {
    render(<WaitModal show={true} message="Loading..." />);
    const modalElement = screen.getByTestId('modalWait');
    expect(modalElement).toBeVisible();
  });

  test('does not render the modal when show is false', () => {
    render(<WaitModal show={false} message="Loading..." />);
    const modalElement = screen.queryByTestId('modalWait');
    expect(modalElement).not.toBeInTheDocument();
  });

  test('displays the correct message in the spinner', () => {
    const message = "Please wait...";
    render(<WaitModal show={true} message={message} />);
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toHaveTextContent(message);
  });
});