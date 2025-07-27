import React, { useState, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Paper, 
  Box, 
  TextField, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';

/**
 * Upload page component
 */
export const UploadPage: React.FC = () => {
  const { state, actions } = useAppContext();
  const { isImporting, importError } = state;
  const { importFiles, setActiveStep } = actions;
  
  // State
  const [negotiationFile, setNegotiationFile] = useState<File | null>(null);
  const [movementFile, setMovementFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear() - 1);
  
  // Refs
  const negotiationFileInputRef = useRef<HTMLInputElement>(null);
  const movementFileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Handle negotiation file change
   * @param event The event
   */
  const handleNegotiationFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNegotiationFile(file);
  };
  
  /**
   * Handle movement file change
   * @param event The event
   */
  const handleMovementFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setMovementFile(file);
  };
  
  /**
   * Handle description change
   * @param event The event
   */
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };
  
  /**
   * Handle year change
   * @param event The event
   */
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setYear(event.target.value as number);
  };
  
  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (negotiationFile) {
      console.log('UploadPage: Starting import process');
      console.log('UploadPage: Files to import:', { 
        negotiationFile, 
        movementFile, 
        year, 
        description 
      });
      
      try {
        await importFiles(negotiationFile, movementFile, year, description);
        console.log('UploadPage: Import completed successfully');
      } catch (error) {
        console.error('UploadPage: Error during import:', error);
        // Display error to user if not already handled by the context
        if (!importError) {
          alert(`Erro ao importar arquivos: ${(error as Error).message}`);
        }
      }
    } else {
      console.warn('UploadPage: No negotiation file selected');
      alert('Por favor, selecione um arquivo de negociação.');
    }
  };
  
  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setActiveStep(0);
  };
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Importar Arquivos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Selecione os arquivos de negociação e movimentação da B3 para importar.
        </Typography>
        
        <Stack spacing={3}>
          <TextField
            label="Descrição da Sessão"
            fullWidth
            value={description}
            onChange={handleDescriptionChange}
            margin="normal"
            helperText="Uma descrição opcional para identificar esta sessão"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="year-select-label">Ano</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={year}
              label="Ano"
              onChange={handleYearChange}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box>
              <input
                type="file"
                accept=".xlsx,.xls,.json"
                hidden
                ref={negotiationFileInputRef}
                onChange={handleNegotiationFileChange}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => negotiationFileInputRef.current?.click()}
                fullWidth
              >
                Selecionar Arquivo de Negociação
              </Button>
              {negotiationFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Arquivo selecionado: {negotiationFile.name}
                </Typography>
              )}
            </Box>
            
            <Box>
              <input
                type="file"
                accept=".xlsx,.xls,.json"
                hidden
                ref={movementFileInputRef}
                onChange={handleMovementFileChange}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => movementFileInputRef.current?.click()}
                fullWidth
              >
                Selecionar Arquivo de Movimentação (Opcional)
              </Button>
              {movementFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Arquivo selecionado: {movementFile.name}
                </Typography>
              )}
            </Box>
          </Box>
          
          {importError && (
            <Alert severity="error">{importError}</Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!negotiationFile || isImporting}
              startIcon={isImporting ? <CircularProgress size={20} /> : undefined}
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </Box>
        </Stack>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Instruções
        </Typography>
        
        <Typography variant="body2" paragraph>
          1. Faça o download dos arquivos de negociação e movimentação no site da B3.
        </Typography>
        
        <Typography variant="body2" paragraph>
          2. Selecione o arquivo de negociação (obrigatório) e o arquivo de movimentação (opcional).
        </Typography>
        
        <Typography variant="body2" paragraph>
          3. Adicione uma descrição opcional para identificar esta sessão.
        </Typography>
        
        <Typography variant="body2" paragraph>
          4. Selecione o ano de referência para a declaração.
        </Typography>
        
        <Typography variant="body2" paragraph>
          5. Clique em "Importar" para iniciar o processamento.
        </Typography>
      </Paper>
    </Box>
  );
};
