import React from 'react';
import { render, screen } from './test-utils'; // Import the custom render function

import RootLayout from '../src/app/layout'; // Import the component you want to test

describe('RootLayout', () => {
  test('renders children correctly', () => {
    render(<RootLayout>This is a child component</RootLayout>);

    expect(screen.getByText('This is a child component')).toBeInTheDocument();
  });
});