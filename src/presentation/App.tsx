import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import { AppContextProvider, useAppContext } from './context/AppContext';
import { MainLayout } from './layout/MainLayout';

import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ProcessPage } from './pages/ProcessPage';
import { DeclarationPage } from './pages/DeclarationPage';
import { ResultPage } from './pages/ResultPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Main app content
 */
const AppContent: React.FC = () => {
  const { state } = useAppContext();
  const { activeStep, currentSessionId } = state;
  
  // Render page based on active step
  const renderPage = () => {
    console.log('AppContent: Rendering page with activeStep:', activeStep, 'and currentSessionId:', currentSessionId);
    
    if (!currentSessionId && activeStep !== 0) {
      console.log('AppContent: No currentSessionId, returning to HomePage');
      return <HomePage />;
    }
    
    switch (activeStep) {
      case 0:
        console.log('AppContent: Rendering HomePage');
        return <HomePage />;
      case 1:
        console.log('AppContent: Rendering UploadPage');
        return <UploadPage />;
      case 2:
        console.log('AppContent: Rendering ProcessPage');
        return <ProcessPage />;
      case 3:
        console.log('AppContent: Rendering DeclarationPage');
        return <DeclarationPage />;
      case 4:
        console.log('AppContent: Rendering ResultPage');
        return <ResultPage />;
      default:
        console.log('AppContent: Default case, rendering HomePage');
        return <HomePage />;
    }
  };
  
  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
};

/**
 * Main app component
 */
export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ThemeProvider>
  );
};
