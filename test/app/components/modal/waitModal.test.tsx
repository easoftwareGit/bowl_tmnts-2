import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom/extend-expect';
import WaitModal from '@/components/modal/waitModal';

describe('WaitModal Component', () => {
  it('renders the modal when show is true', () => {
    render(<WaitModal show={true} message="Loading..." />);
    const modalElement = screen.getByTestId('modalWait');
    expect(modalElement).toBeVisible();
  });
  it('does not render the modal when show is false', () => {
    render(<WaitModal show={false} message="Loading..." />);
    const modalElement = screen.queryByTestId('modalWait');
    expect(modalElement).not.toBeInTheDocument();
  });
  it('displays the correct message in the spinner', () => {
    const message = "Please wait...";
    render(<WaitModal show={true} message={message} />);
    const modalElement = screen.queryByTestId('modalWait');
    expect(modalElement).toHaveTextContent(message);
  });  
  it('clicking outside the modal does nothing (modal stays visible)', async () => {
    const user = userEvent.setup();
    render(<WaitModal show={true} message="Loading..." />);

    // modal is shown
    expect(screen.getByTestId('modalWait')).toBeVisible();

    const modal = screen.getByRole('dialog');
    expect(modal).toBeVisible();

    // Click on the dialog container (outside body content)
    await user.click(modal);

    // Modal should still be visible
    expect(screen.getByRole('dialog')).toBeVisible();
  });
  it('pressing ESC does nothing (modal stays visible)', async () => {
    const user = userEvent.setup();
    render(<WaitModal show={true} message="Loading..." />);

    // modal is shown
    expect(screen.getByTestId('modalWait')).toBeVisible();

    await user.keyboard('{Escape}');

    // should still be visible
    expect(screen.getByTestId('modalWait')).toBeVisible();
  });

});