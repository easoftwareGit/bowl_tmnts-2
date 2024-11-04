import { render, screen, waitFor } from "@testing-library/react"
import { ReduxProvider } from "@/redux/provider"
import Form9 from "@/app/sample/form9"

describe('Form9 Component', () => {
  it('should render a heading' , async () => {
    render(<ReduxProvider><Form9 /></ReduxProvider>);
    const heading = await screen.findByRole('heading', {
      name: /form 9/i
    })
    expect(heading).toBeInTheDocument()
  })
  it('should render a loading message while bowls are loading', async () => { 
    render(<ReduxProvider><Form9 /></ReduxProvider>);
    const loadingMessage = screen.getByText(/loading/i); 
    expect(loadingMessage).toBeInTheDocument();
    // wait for loading to stop    
    await waitFor(() => expect(loadingMessage).not.toBeInTheDocument()); 
    expect(loadingMessage).not.toBeInTheDocument();
  })

  // to have this test pass, do options 1 OR 2
  // 1) run the developement server
  //   a) open another terminal
  //   b) type: npm run dev
  // 2) run the debug server
  //   in the VS activity bar, 
  //   a) click on "Run and Debug" (Ctrl+Shift+D)
  //   b) at the top of the window, click on the drop-down arrow
  //   c) select "Node.js: debug server-side"
  //   d) directly to the left of the drop down select, click the green play button
  //      This will start the server in debug mode. 

  it('renders the data for each bowl after bowls are loaded', async () => { 
    render(<ReduxProvider><Form9 /></ReduxProvider>);
    const loadingMessage = screen.getByText(/loading/i); 
    expect(loadingMessage).toBeInTheDocument();
    // wait for loading to stop    
    await waitFor(() => expect(loadingMessage).not.toBeInTheDocument()); 
    expect(loadingMessage).not.toBeInTheDocument();

    // screen.debug()
    const bowlNameColumHeader = screen.getByText(/bowl name/i);
    expect(bowlNameColumHeader).toBeInTheDocument();
    const cityColumnHeader = screen.getByText(/city/i);
    expect(cityColumnHeader).toBeInTheDocument();
    const stateColumnHeader = screen.getByText(/state/i);
    expect(stateColumnHeader).toBeInTheDocument();
    const UrlColumnHeader = screen.getByText(/url/i);
    expect(UrlColumnHeader).toBeInTheDocument();
  })
})