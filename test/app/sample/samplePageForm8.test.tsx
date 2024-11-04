import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Form8 } from '@/app/sample/form8';

// Mock the postTmnt function
jest.mock('../../../src/lib/db/tmnts/tmntsAxios', () => ({
  postTmnt: jest.fn(),
}));

describe('Form8 Component', () => { 

  it('should update input values on change', () => {
    render(<Form8 />);

    const firstNameInput = screen.getByLabelText('First');
    const lastNameInput = screen.getByLabelText('Last');
    const emailInput = screen.getByLabelText('Email');
    const phoneInput = screen.getByLabelText('Phone');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(emailInput).toHaveValue('john.doe@example.com');
    expect(phoneInput).toHaveValue('1234567890');
  });

  it('should call postTmnt on form submit', async () => {
    const { postTmnt } = require('../../../src/lib/db/tmnts/tmntsAxios');
    postTmnt.mockResolvedValue(true);

    render(<Form8 />);

    const firstNameInput = screen.getByLabelText('First');
    const lastNameInput = screen.getByLabelText('Last');
    const emailInput = screen.getByLabelText('Email');
    const phoneInput = screen.getByLabelText('Phone');
    const saveButton = screen.getByText('Save');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    fireEvent.click(saveButton);

    expect(postTmnt).toHaveBeenCalledWith({
      first: 'John',
      last: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });
  });

})