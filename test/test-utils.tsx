import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Metadata } from 'next';

interface ProvidersProps {
  children?: ReactNode;
}

// Custom render function to wrap components with required providers
const render = (
  ui: ReactElement,
  {
    metadata,
    providers,
    ...renderOptions
  }: { metadata?: Metadata; providers?: ReactElement<ProvidersProps>[] } & RenderOptions = {}
) => {
  const AllProviders = ({ children }: { children?: ReactNode }) => {
    const defaultProviders = (
      <SessionProvider session={null}>
        {/* Add any other default providers here */}
        {children}
      </SessionProvider>
    );

    // Merge default and custom providers
    const mergedProviders = providers
      ? providers.reduceRight((acc, provider) => React.cloneElement(provider, {}, acc), defaultProviders)
      : defaultProviders;

    return <>{mergedProviders}</>;
  };

  return rtlRender(ui, { wrapper: AllProviders, ...renderOptions });
};

export * from '@testing-library/react'; // re-export everything
export { render };
