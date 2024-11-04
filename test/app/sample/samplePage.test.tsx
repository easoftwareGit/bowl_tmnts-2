import React from 'react';
import { render, screen } from '../../test-utils'; // Import the custom render function

import RootLayout from '../../../src/app/layout';
import SamplePage from '@/app/sample/page';

describe('RootLayout', () => {
  test('renders children correctly', () => {      
    render(<RootLayout><SamplePage /></RootLayout>);
    const eventName = screen.getByText(/event name/i);
    expect(eventName).toBeInTheDocument();
  });
});