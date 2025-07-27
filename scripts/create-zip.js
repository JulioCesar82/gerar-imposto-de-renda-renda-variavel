const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a date string for the zip file name
const date = new Date();
const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, `irpf-b3-generator-${dateString}.zip`));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Archive created: ${archive.pointer()} total bytes`);
  console.log(`Archive has been finalized and the output file descriptor has been closed.`);
  console.log(`File created: irpf-b3-generator-${dateString}.zip`);
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Files and directories to include in the zip
const filesToInclude = [
  'src',
  'public',
  'index.html',
  'package.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'README.md',
  'LICENSE',
  'setup.bat',
  'setup.sh'
];

// Files and directories to exclude
const excludePatterns = [
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.DS_Store',
  '*.zip'
];

// Function to check if a file should be excluded
const shouldExclude = (filePath) => {
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(filePath);
    }
    return filePath.includes(pattern);
  });
};

// Add files to the archive
filesToInclude.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Add directory contents recursively
        archive.directory(filePath, file, (entry) => {
          if (shouldExclude(entry.name)) {
            return false;
          }
          return entry;
        });
      } else {
        // Add file
        if (!shouldExclude(file)) {
          archive.file(filePath, { name: file });
        }
      }
    } else {
      console.warn(`Warning: ${file} does not exist and will not be included in the zip.`);
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});

// Finalize the archive
archive.finalize();
