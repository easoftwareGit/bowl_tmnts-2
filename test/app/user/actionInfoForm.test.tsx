// test/app/user/acctInfo/form.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
// import { findUserById } from '@/lib/db/users/users';
import { findUserById } from '../../../src/lib/db/users/users';
import AcctInfoForm from '@/app/user/acctInfo/form';

jest.mock('next-auth/react');
jest.mock('../../../src/lib/db/users/users');

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

  it('should render and populate the form with user data', async () => {
    render(<AcctInfoForm />);

    // Wait for the form to be populated with user data
    await waitFor(() => {
      expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Phone/i)).toHaveValue('1234567890');
    });
  });
});