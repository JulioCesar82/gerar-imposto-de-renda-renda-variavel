import React from 'react';
import { 
  Typography, 
  Button, 
  Paper, 
  Box, 
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Container } from '../../infrastructure/di/Container';
import { tryDownloadFile } from 'src/utils/presentation';

/**
 * Result page component
 */
export const ResultPage: React.FC = () => {
  const { state, actions } = useAppContext();
  const { currentSessionData, currentSessionId } = state;
  const { generateDBKFile, generateExcelFile, setActiveStep } = actions;
  
  // State to track if original DBK file exists
  const [hasOriginalDBK, setHasOriginalDBK] = React.useState<boolean>(false);
  
  // Check if original DBK file exists
  React.useEffect(() => {
    const checkOriginalDBK = async () => {
      if (currentSessionId) {
        try {
          const storage = Container.getInstance().getStorage();
          const originalContent = await storage.getOriginalDBK(currentSessionId);
          setHasOriginalDBK(!!originalContent);
        } catch (error) {
          console.error('Error checking original DBK file:', error);
          setHasOriginalDBK(false);
        }
      } else {
        setHasOriginalDBK(false);
      }
    };
    
    checkOriginalDBK();
  }, [currentSessionId]);

  /**
   * Handle DBK download click
   */
  const handleDBKDownloadClick = async () => {
    try {
      const blob = await generateDBKFile();
      
      tryDownloadFile(blob, `irpf_${new Date().getFullYear()}.dbk`);    
    } catch (error) {
      console.error('Error generating .DBK file:', error);
      alert('Erro ao gerar arquivo .DBK');
    }
  };

   /**
   * Handle Excel download click
   */
  const handleDownloadExcel = async () => {
    try {
      const excelBlob = await generateExcelFile();
  
      tryDownloadFile(excelBlob, `irpf_${new Date().getFullYear()}.xlsx`);    
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Erro ao gerar arquivo Excel');
    }
  };
  
  /**
   * Handle original DBK download click
   */
  const handleOriginalDBKDownloadClick = async () => {
    try {
      if (!currentSessionId) {
        throw new Error('No session selected');
      }
      
      // Get original DBK content
      const storage = Container.getInstance().getStorage();
      const originalContent = await storage.getOriginalDBK(currentSessionId);
      
      if (!originalContent) {
        alert('Arquivo DBK original não encontrado');
        return;
      }
      
      // Create a Blob with the original content
      const blob = new Blob([originalContent], { type: 'application/octet-stream' });
      
      tryDownloadFile(blob, `irpf_original_${new Date().getFullYear()}.dbk`);    
    } catch (error) {
      console.error('Error downloading original DBK file:', error);
      alert('Erro ao baixar arquivo DBK original');
    }
  };
  
  /**
   * Handle back click
   */
  const handleBackClick = () => {
    setActiveStep(2);
  };
  
  /**
   * Handle new declaration click
   */
  const handleNewDeclarationClick = () => {
    setActiveStep(0);
  };
  
  // Check if declaration is generated
  const isGenerated = currentSessionData?.generatedDeclaration !== undefined;
  
  if (!isGenerated) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Resultado
        </Typography>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            Nenhuma declaração foi gerada ainda.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => setActiveStep(2)}
          >
            Gerar Declaração
          </Button>
        </Paper>
      </Box>
    );
  }
  
  const declaration = currentSessionData!.generatedDeclaration!;
  const taxPayerInfo = declaration.taxPayerInfo;
  
  // Define columns for the Assets DataGrid
  const assetColumns: GridColDef[] = [
    { field: 'assetCode', headerName: 'Código', width: 120 },
    { field: 'assetName', headerName: 'Nome', width: 200 },
    { field: 'assetCategory', headerName: 'Categoria', width: 150 },
    { 
      field: 'quantity', 
      headerName: 'Quantidade', 
      type: 'number',
      width: 120,
      align: 'right',
      headerAlign: 'right'
    },
    { 
      field: 'averagePrice', 
      headerName: 'Preço Médio', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'totalCost', 
      headerName: 'Valor Total', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    }
  ];
  
  // Prepare rows for the Assets DataGrid
  const assetRows = declaration.assetPositions.map((asset, index) => ({
    id: index, // DataGrid requires a unique id for each row
    ...asset
  }));
  
  // Define columns for the Monthly Results DataGrid
  const monthlyResultsColumns: GridColDef[] = [
    { 
      field: 'month', 
      headerName: 'Mês', 
      width: 120,
      valueFormatter: (params) => {
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return monthNames[params.value - 1] || '';
      }
    },
    { 
      field: 'totalSalesValue', 
      headerName: 'Vendas', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'netResult', 
      headerName: 'Lucro/Prejuízo', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value),
      cellClassName: (params) => params.value < 0 ? 'negative-value' : 'positive-value'
    },
    { 
      field: 'taxDue', 
      headerName: 'Imposto Devido', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'taxWithheld', 
      headerName: 'Imposto Retido', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'taxToPay', 
      headerName: 'Imposto a Pagar', 
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatCurrency(params.value)
    }
  ];
  
  // Prepare rows for the Monthly Results DataGrid
  const monthlyResultsRows = declaration.monthlyResults
    .map((result, index) => ({
      id: `${result.year}-${result.month}`, // Unique ID based on year and month
      ...result
    }));
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Resultado
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Declaração Gerada com Sucesso
        </Typography>
        
        <Typography variant="body1" paragraph>
          A declaração foi gerada com sucesso e está pronta para ser importada no programa da Receita Federal.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 3 }}>        
          <Button
            variant="contained"
            color="primary"
            onClick={handleDBKDownloadClick}
            size="large"
          >
            Baixar Arquivo .DBK
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 3 }}>        
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadExcel}
            size="large"
          >
            Baixar Relatório Excel
          </Button>
        </Box>
        
        {hasOriginalDBK && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleOriginalDBKDownloadClick}
              size="medium"
            >
              Baixar DBK Original
            </Button>
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Resumo da Declaração
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Informações do Contribuinte
            </Typography>
            
            <Stack spacing={1}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1">
                  {taxPayerInfo.name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  CPF
                </Typography>
                <Typography variant="body1">
                  {taxPayerInfo.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Endereço
                </Typography>
                <Typography variant="body1">
                  {`${taxPayerInfo.address.street}, ${taxPayerInfo.address.number}${taxPayerInfo.address.complement ? `, ${taxPayerInfo.address.complement}` : ''}`}
                </Typography>
                <Typography variant="body1">
                  {`${taxPayerInfo.address.neighborhood}, ${taxPayerInfo.address.city} - ${taxPayerInfo.address.state}, ${taxPayerInfo.address.zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')}`}
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Resumo Financeiro
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">Total de Rendimentos</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.totalIncome)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Total de Bens</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.totalAssetsValue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Imposto Devido</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.totalTaxDue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Imposto Retido na Fonte</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.totalTaxWithheld)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Imposto a Pagar</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.totalTaxToPay)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Prejuízo a Compensar</TableCell>
                    <TableCell align="right">{formatCurrency(declaration.remainingLoss)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Ativos
            </Typography>
            
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={assetRows}
                columns={assetColumns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                  sorting: {
                    sortModel: [{ field: 'assetCode', sort: 'asc' }],
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                density="standard"
                sx={{ 
                  '& .MuiDataGrid-cell': { fontSize: '0.875rem' },
                  '& .MuiDataGrid-columnHeader': { fontSize: '0.875rem', fontWeight: 'bold' },
                  '& .negative-value': { color: 'error.main' },
                  '& .positive-value': { color: 'success.main' }
                }}
              />
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Resultados Mensais
            </Typography>
            
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={monthlyResultsRows}
                columns={monthlyResultsColumns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 12 },
                  },
                  sorting: {
                    sortModel: [{ field: 'month', sort: 'asc' }],
                  },
                }}
                pageSizeOptions={[5, 12]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                density="standard"
                sx={{ 
                  '& .MuiDataGrid-cell': { fontSize: '0.875rem' },
                  '& .MuiDataGrid-columnHeader': { fontSize: '0.875rem', fontWeight: 'bold' },
                  '& .negative-value': { color: 'error.main' },
                  '& .positive-value': { color: 'success.main' }
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBackClick}
        >
          Voltar
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleNewDeclarationClick}
        >
          Nova Declaração
        </Button>
      </Box>
    </Box>
  );
};
