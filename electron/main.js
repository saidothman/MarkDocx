const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { generateDocxFromMarkdown } = require('./markdownDocxConverter');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 880,
    minHeight: 620,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0A0F1D',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER LOG]: ${message}`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (process.argv.includes('--test-automation')) {
      console.log('Automated Test: Starting end-to-end verification in Electron...');
      setTimeout(async () => {
        try {
          console.log('Automated Test: Step 1 - Selecting sample file in React Native UI...');
          await mainWindow.webContents.executeJavaScript(`
            window.testSelectSample && window.testSelectSample();
          `);

          // Verify file details card is rendered
          setTimeout(async () => {
            const hasBlankScreen = await mainWindow.webContents.executeJavaScript(`
              document.body.innerText.includes('Application Encountered an Error') ||
              document.getElementById('root').innerHTML === ''
            `);

            const cardTitle = await mainWindow.webContents.executeJavaScript(`
              document.body.innerText.includes('Project_Quantum_Report.md')
            `);

            console.log('Automated Test Verification [File Card Render]:', {
              hasBlankScreen,
              cardTitlePresent: cardTitle
            });

            if (hasBlankScreen || !cardTitle) {
              console.error('❌ TEST FAILED: Screen became blank or card did not render!');
              process.exit(1);
            }

            console.log('Automated Test: Step 2 - Triggering conversion pipeline...');
            await mainWindow.webContents.executeJavaScript(`
              window.testConvert && window.testConvert();
            `);

            // Check conversion completion and DOCX generation
            setTimeout(async () => {
              const successRendered = await mainWindow.webContents.executeJavaScript(`
                document.body.innerText.includes('Conversion Successful!')
              `);

              const outputPath = path.join(__dirname, '../sample_documents/automated_test_output.docx');
              const fileCreated = fs.existsSync(outputPath);
              let fileSize = 0;
              if (fileCreated) {
                fileSize = fs.statSync(outputPath).size;
                try { fs.unlinkSync(outputPath); } catch (_) {}
              }

              console.log('Automated Test Verification [Conversion Complete]:', {
                successRendered,
                fileCreated,
                fileSizeBytes: fileSize
              });

              if (successRendered && fileCreated && fileSize > 1000) {
                console.log('🎉 100% SUCCESS: File selection, animations, and conversion pipeline fully verified!');
                setTimeout(() => app.quit(), 500);
              } else {
                console.error('❌ TEST FAILED: Conversion did not complete properly!');
                process.exit(1);
              }
            }, 3200);
          }, 800);
        } catch (e) {
          console.error('Automated Test Exception:', e);
          process.exit(1);
        }
      }, 1000);
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window Controls IPC
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return false;
  } else {
    mainWindow.maximize();
    return true;
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Open File Dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Markdown File',
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'mdown', 'mkd', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const content = await fs.promises.readFile(selectedPath, 'utf-8');
  const stats = await fs.promises.stat(selectedPath);

  return {
    filePath: selectedPath,
    fileName: path.basename(selectedPath),
    content,
    size: stats.size,
    lastModified: stats.mtimeMs
  };
});

// Save File Dialog
ipcMain.handle('dialog:saveFile', async (event, defaultName = 'Document.docx') => {
  if (process.argv.includes('--test-automation')) {
    return path.join(__dirname, '../sample_documents/automated_test_output.docx');
  }

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Converted DOCX',
    defaultPath: defaultName,
    filters: [
      { name: 'Word Document (*.docx)', extensions: ['docx'] }
    ]
  });

  if (result.canceled) return null;
  return result.filePath;
});

// Read Dropped File
ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const stats = await fs.promises.stat(filePath);
    return {
      filePath,
      fileName: path.basename(filePath),
      content,
      size: stats.size,
      lastModified: stats.mtimeMs
    };
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }
});

// Convert Markdown to DOCX
ipcMain.handle('convert:markdown', async (event, { markdown, outputPath, options }) => {
  try {
    const { buffer, stats } = await generateDocxFromMarkdown(markdown, options);
    await fs.promises.writeFile(outputPath, buffer);
    return {
      success: true,
      outputPath,
      fileName: path.basename(outputPath),
      fileSize: buffer.length,
      stats
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || String(err)
    };
  }
});

// Shell Actions
ipcMain.handle('shell:openFile', async (event, filePath) => {
  return await shell.openPath(filePath);
});

ipcMain.handle('shell:showInFolder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
  return true;
});
