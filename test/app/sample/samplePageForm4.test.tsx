import React from "react";
import { render, screen, act } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import RootLayout from "@/app/layout";
import SamplePage from "@/app/sample/page";

describe('Sample Page + Form 4 no Component', () => { 
  describe('render the sample page', () => {
    it('renders the sample page', async () => {

      const promise = Promise.resolve();

      const myDoc = document.createElement

      render(<RootLayout><SamplePage /></RootLayout>)
      const samplePage = screen.getByText(/test/i);
      expect(samplePage).toBeInTheDocument();      

      await act(() => promise);
    })
    // it('render the select Bowl Name', async () => {
    //   const promise = Promise.resolve();
    //   render(<RootLayout><SamplePage /></RootLayout>)
    //   const bowlName = await screen.findByRole('combobox', { name: /bowl name/i });      
    //   expect(bowlName).toHaveValue("Choose...");
    //   await act(() => promise);
    // })
    // it('add an event', async () => { 
    //   const user = userEvent.setup()
    //   render(<RootLayout><SamplePage /></RootLayout>);
    //   const eventName = await screen.findByLabelText(/event name/i);
    //   expect(eventName).toBeInTheDocument();

    //   await user.clear(eventName);
    //   await user.type(eventName, 'Trios')
    //   const addBtn = screen.getByRole('button', { name: /add event/i });
    //   await user.click(addBtn);
    //   const eventSelect = screen.getByRole('combobox', { name: /select event/i }) as HTMLSelectElement;
    //   expect(eventSelect).toHaveTextContent('Trios')
    //   await user.clear(eventName)
    //   await user.type(eventName, '5 Man Teams')
    //   await user.click(addBtn);
    //   expect(eventSelect).toHaveTextContent('5 Man Teams')
    //   const bowlLabel = await screen.findByText('Bowl Name');
    //   expect(bowlLabel).toBeInTheDocument();
    // })
  })
})