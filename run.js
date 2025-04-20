import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Check if server dependencies are installed
const checkServerDependencies = () => {
  return new Promise((resolve) => {
    const serverPackageJsonPath = path.join(__dirname, 'server', 'node_modules');
    if (!fs.existsSync(serverPackageJsonPath)) {
      console.log(`${colors.yellow}Server dependencies not found. Installing...${colors.reset}`);
      exec('cd server && npm install', (error) => {
        if (error) {
          console.error(`${colors.red}Failed to install server dependencies:${colors.reset}`, error);
          resolve(false);
        } else {
          console.log(`${colors.green}Server dependencies installed successfully.${colors.reset}`);
          resolve(true);
        }
      });
    } else {
      resolve(true);
    }
  });
};

// Check if frontend dependencies are installed
const checkFrontendDependencies = () => {
  return new Promise((resolve) => {
    const frontendNodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(frontendNodeModulesPath)) {
      console.log(`${colors.yellow}Frontend dependencies not found. Installing...${colors.reset}`);
      exec('npm install', (error) => {
        if (error) {
          console.error(`${colors.red}Failed to install frontend dependencies:${colors.reset}`, error);
          resolve(false);
        } else {
          console.log(`${colors.green}Frontend dependencies installed successfully.${colors.reset}`);
          resolve(true);
        }
      });
    } else {
      resolve(true);
    }
  });
};

// Start the server
const startServer = () => {
  console.log(`${colors.cyan}${colors.bright}Starting server...${colors.reset}`);
  const serverProcess = exec('cd server && npm run dev');
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`${colors.cyan}[SERVER] ${colors.reset}${data.trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`${colors.red}[SERVER ERROR] ${colors.reset}${data.trim()}`);
  });
  
  return serverProcess;
};

// Start the frontend
const startFrontend = () => {
  console.log(`${colors.green}${colors.bright}Starting frontend...${colors.reset}`);
  const frontendProcess = exec('npm run dev');
  
  frontendProcess.stdout.on('data', (data) => {
    console.log(`${colors.green}[FRONTEND] ${colors.reset}${data.trim()}`);
  });
  
  frontendProcess.stderr.on('data', (data) => {
    console.error(`${colors.red}[FRONTEND ERROR] ${colors.reset}${data.trim()}`);
  });
  
  return frontendProcess;
};

// Main function to run everything
const main = async () => {
  console.log(`${colors.bright}Camera Shop Application Starter${colors.reset}`);
  console.log('----------------------------------------');
  
  // Check dependencies
  const serverDepsOk = await checkServerDependencies();
  const frontendDepsOk = await checkFrontendDependencies();
  
  if (!serverDepsOk || !frontendDepsOk) {
    console.error(`${colors.red}Failed to install dependencies. Please check the errors above.${colors.reset}`);
    process.exit(1);
  }
  
  // Start both applications
  const serverProcess = startServer();
  
  // Wait a bit for the server to start before starting the frontend
  setTimeout(() => {
    const frontendProcess = startFrontend();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(`${colors.yellow}Shutting down...${colors.reset}`);
      serverProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
  }, 2000);
};

main().catch(err => {
  console.error(`${colors.red}Error running the application:${colors.reset}`, err);
  process.exit(1);
});