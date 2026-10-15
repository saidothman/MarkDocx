const { spawn } = require('child_process');
const http = require('http');

const VITE_PORT = 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

console.log('🚀 Starting Vite Dev Server...');

// Start Vite
const vite = spawn('npx.cmd', ['vite', '--port', String(VITE_PORT)], {
  stdio: 'inherit',
  shell: true,
});

function checkViteReady() {
  http.get(VITE_URL, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      console.log('✨ Vite Dev Server is ready! Launching Native Windows Electron Application...');
      launchElectron();
    } else {
      setTimeout(checkViteReady, 300);
    }
  }).on('error', () => {
    setTimeout(checkViteReady, 300);
  });
}

function launchElectron() {
  const electron = spawn('npx.cmd', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: VITE_URL,
    },
  });

  electron.on('close', (code) => {
    console.log(`Windows application exited with code ${code}`);
    vite.kill();
    process.exit(code || 0);
  });
}

// Start checking
setTimeout(checkViteReady, 500);

process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
