import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper 
} from '@mui/material';

import { useAppContext } from '../context/AppContext';

/**
 * Main layout props
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { state } = useAppContext();
  const { activeStep, currentSessionId } = state;
  
  // Steps
  const steps = [
    'Selecionar Arquivos',
    'Processar Dados',
    'Gerar Declaração',
    'Resultado'
  ];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gerador de Relatório IRRF via B3
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {currentSessionId && (
          <Paper sx={{ mb: 3, p: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}
        
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme: any) => theme.palette.grey[200] }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Gerador de Relatório IRRF via B3
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
