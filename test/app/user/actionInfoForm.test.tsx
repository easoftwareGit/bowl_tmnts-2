import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useSession } from 'next-auth/react';
import { findUserById } from '../../../src/lib/db/users/users';
import AcctInfoForm from '@/app/user/acctInfo/form';

jest.mock('next-auth/react');
jest.mock('../../../src/lib/db/users/users');

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null
    };
  }
}));

describe('AcctInfoForm Component', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockFindUserById = findUserById as jest.Mock;

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'fake-user-id' } },
      status: 'authenticated',
    });

    mockFindUserById.mockResolvedValue({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form and loading message', async () => { 
    render(<AcctInfoForm />);
    const accountInfo = screen.getByText(/Account Information/i);
    expect(accountInfo).toBeInTheDocument();
    const loading = screen.getByText(/loading/i);
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      expect(loading).not.toBeInTheDocument();
    })

    const chgPwdBtn = screen.getByRole('button', { name: /change password/i });
    expect(chgPwdBtn).toBeInTheDocument();
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();

  })

  it('should render and populate the form with user data', async () => {
    render(<AcctInfoForm />);

    // Wait for the form to be populated with user data
    await waitFor(() => {
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
    });
    // if First Name is populated, then the rest of the form should be populated
    // no need to wait for the rest of the form to be populated
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('1234567890');
  });

  it('should change to the change password form', async () => { 
    const user = userEvent.setup()
    render(<AcctInfoForm />);
    const accountInfo = screen.getByText(/Account Information/i);
    expect(accountInfo).toBeInTheDocument();
    const loading = screen.getByText(/loading/i);
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      expect(loading).not.toBeInTheDocument();
    })

    const chgPwdBtn = screen.getByRole('button', { name: /change password/i });
    expect(chgPwdBtn).toBeInTheDocument();
    await user.click(chgPwdBtn);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    })
    const headerText = screen.getByText(/change password/i);
    expect(headerText).toBeInTheDocument();
    const fullName = screen.getByText(/john doe/i);
    expect(fullName).toBeInTheDocument();    

    const currentPwd = screen.getByTestId('inputCurrent');        
    expect(currentPwd).toBeInTheDocument();
    const currentShow = screen.queryByRole('textBox', { name: /current/i });
    expect(currentShow).not.toBeInTheDocument();

    const newPwd = screen.getByTestId('inputNew');    
    expect(newPwd).toBeInTheDocument();
    const newShow = screen.queryByRole('textBox', { name: /new/i });
    expect(newShow).not.toBeInTheDocument();

    const confirm = screen.getByTestId('inputConfirm');    
    expect(confirm).toBeInTheDocument();
    const confirmShow = screen.queryByRole('textBox', { name: /confirm/i });
    expect(confirmShow).not.toBeInTheDocument();

    const acctInfo = screen.getByRole('button', { name: /acct info/i });
    expect(acctInfo).toBeInTheDocument();
    const updateBtn = screen.getByRole('button', { name: /update/i });
    expect(updateBtn).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();

    const allBtns = screen.getAllByRole('button');
    expect(allBtns).toHaveLength(6);
    const allImages = screen.getAllByRole('img');
    expect(allImages).toHaveLength(3);   
  })

  it('should revert to the change password form', async () => { 
    const user = userEvent.setup()
    render(<AcctInfoForm />);
    const accountInfo = screen.getByText(/Account Information/i);
    expect(accountInfo).toBeInTheDocument();
    const loading = screen.getByText(/loading/i);
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      expect(loading).not.toBeInTheDocument();
    })

    const chgPwdBtn = screen.getByRole('button', { name: /change password/i });
    expect(chgPwdBtn).toBeInTheDocument();
    await user.click(chgPwdBtn);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    })
    const acctInfo = screen.getByRole('button', { name: /acct info/i });
    expect(acctInfo).toBeInTheDocument();

    await user.click(acctInfo);
    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
  })
  it('should show/hide the password text when show/hide buttons are clicked', async () => { 
    const user = userEvent.setup()
    render(<AcctInfoForm />);
    const accountInfo = screen.getByText(/Account Information/i);
    expect(accountInfo).toBeInTheDocument();
    const loading = screen.getByText(/loading/i);
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      expect(loading).not.toBeInTheDocument();
    })

    const chgPwdBtn = screen.getByRole('button', { name: /change password/i });
    expect(chgPwdBtn).toBeInTheDocument();
    await user.click(chgPwdBtn);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    })    
    const allBtns = screen.getAllByRole('button');
    expect(allBtns).toHaveLength(6);

    // show the passwords by clicking the show/hide buttons 
    await user.click(allBtns[0]); // current password button
    await user.click(allBtns[1]); // new password button
    await user.click(allBtns[2]); // confirm password button

    // find password inputs as textboxes    
    expect(screen.getByRole('textbox', { name: /current/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /confirm/i })).toBeInTheDocument();

    // hide the passwords by clicking the show/hide buttons 
    await user.click(allBtns[0]); // current password button
    await user.click(allBtns[1]); // new password button
    await user.click(allBtns[2]); // confirm password button

    expect(screen.getByTestId('inputCurrent')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /current/i })).not.toBeInTheDocument();

    expect(screen.getByTestId('inputNew')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /new/i })).not.toBeInTheDocument();

    expect(screen.getByTestId('inputConfirm')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /confirm/i })).not.toBeInTheDocument();
  })
});