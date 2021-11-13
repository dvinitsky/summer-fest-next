import '../src/styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';
import Head from 'next/head';
import theme from '../src/styles/theme';
import { Snackbar, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { AppContext } from '../src/context/AppContext';

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const handleCloseToast = () => {
    setToastMessage(undefined);
  };

  return (
    <>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <ThemeProvider theme={theme}>
              <AppContext.Provider value={{ toastMessage, setToastMessage }}>
                <Component {...pageProps} />
                <Snackbar
                  open={Boolean(toastMessage)}
                  autoHideDuration={6000}
                  onClose={handleCloseToast}
                  message={toastMessage}
                />
                <ReactQueryDevtools />
              </AppContext.Provider>
            </ThemeProvider>
          </Hydrate>
        </QueryClientProvider>
      </UserProvider>
    </>
  );
}
