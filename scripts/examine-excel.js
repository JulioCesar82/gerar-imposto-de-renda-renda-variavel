import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to examine an Excel file
function examineExcelFile(filePath) {
  console.log(`\nExamining file: ${filePath}`);
  
  try {
    // Read the file
    const workbook = XLSX.readFile(filePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Print the number of rows
    console.log(`Number of rows: ${data.length}`);
    
    // Print the column names (from the first row)
    if (data.length > 0) {
      console.log('Column names:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => console.log(`  - "${col}"`));
    }
    
    // Print the first row as an example
    if (data.length > 0) {
      console.log('\nFirst row:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
    // Print a few more rows
    if (data.length > 1) {
      console.log('\nSecond row:');
      console.log(JSON.stringify(data[1], null, 2));
    }
    
    if (data.length > 2) {
      console.log('\nThird row:');
      console.log(JSON.stringify(data[2], null, 2));
    }
    
    return data;
  } catch (error) {
    console.error(`Error examining file: ${error.message}`);
    return null;
  }
}

// Examine the negotiation file
const negotiationFile = path.join(__dirname, '..', 'documentation', 'negociacao-exemplo.xlsx');
const negotiationData = examineExcelFile(negotiationFile);

// Examine the movement file
const movementFile = path.join(__dirname, '..', 'documentation', 'movimentacao-exemplo.xlsx');
const movementData = examineExcelFile(movementFile);
