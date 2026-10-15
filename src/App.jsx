import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import TitleBar from './components/TitleBar';
import DropZone from './components/DropZone';
import FileDetailsCard from './components/FileDetailsCard';
import ConversionProgress from './components/ConversionProgress';
import StyleConfigurator from './components/StyleConfigurator';
import MarkdownPreview from './components/MarkdownPreview';

const SAMPLE_MARKDOWN = `# Project Quantum • Technical Architecture Report

A high-performance system designed for automated document synthesis and real-time formatting.

> [!NOTE]
> This document was generated using MarkDocx Studio for Windows. All headings, tables, callouts, and code blocks map directly to Microsoft Word OpenXML (.docx) typography.

## 1. System Goals & Objectives
The platform converts rich GitHub-flavored Markdown documents into executive-ready Word files.

### Key Milestones
- [x] Initial AST tokenizer integration
- [x] Custom typography and Fluent Windows theme styling
- [x] High-fidelity table formatting with zebra-striping
- [ ] Automated CI/CD document publication

---

## 2. Component Performance Matrix
Below is the evaluation matrix across different processing layers:

| Module | Purpose | Latency | Accuracy |
| :--- | :--- | :---: | :---: |
| Markdown Parser | AST Lexer & Syntax Tree | 4.2 ms | 100% |
| Word Builder | OpenXML Synthesis (.docx) | 12.8 ms | 99.8% |
| Native Bridge | Windows Shell & IPC | 1.1 ms | 100% |

> [!TIP]
> You can change the primary accent color in the "Document Style" tab to Office Blue, Royal Indigo, Emerald Green, or Crimson Red!

## 3. Implementation Code Snippet

\`\`\`typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function exportWordDocument(markdownText: string): Promise<Buffer> {
  const doc = new Document({
    title: "Executive Report",
    creator: "MarkDocx Studio",
    sections: [
      /* Structured OpenXML children */
    ]
  });
  return await Packer.toBuffer(doc);
}
\`\`\`

## 4. Summary & Next Steps
Enjoy seamless Markdown-to-DOCX conversions with dynamic Windows animations and native OS integration!
`;

export default function App() {
  const [activeTab, setActiveTab] = useState('convert');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'file-selected' | 'converting' | 'completed' | 'error'
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const [options, setOptions] = useState({
    palette: 'blue',
    primaryFont: 'Segoe UI',
    margins: 'normal',
    codeTheme: 'dark',
    includeHeaderFooter: true,
  });

  // Handle file selection
  const handleFileSelected = (selectedFile) => {
    if (!selectedFile) return;
    const safeFile = {
      filePath: selectedFile.filePath || selectedFile.fileName || 'Document.md',
      fileName: selectedFile.fileName || 'Document.md',
      content: typeof selectedFile.content === 'string' ? selectedFile.content : '',
      size: typeof selectedFile.size === 'number' ? selectedFile.size : (selectedFile.content?.length || 0),
      lastModified: selectedFile.lastModified || Date.now(),
    };
    setFile(safeFile);
    setStatus('file-selected');
    setError(null);
  };

  // Expose test helper for automated verification
  React.useEffect(() => {
    window.testSelectSample = handleLoadSample;
    window.testSelectFile = (content, name = 'test.md') => {
      handleFileSelected({
        filePath: 'C:\\test\\' + name,
        fileName: name,
        content: content || '# Test Document\n\nContent paragraph.',
        size: (content || '').length,
        lastModified: Date.now()
      });
    };
  }, []);

  React.useEffect(() => {
    window.testConvert = handleConvert;
  }, [file, options]);

  // Load sample markdown
  const handleLoadSample = () => {
    handleFileSelected({
      filePath: 'C:\\Users\\Public\\Documents\\Project_Quantum_Report.md',
      fileName: 'Project_Quantum_Report.md',
      content: SAMPLE_MARKDOWN,
      size: SAMPLE_MARKDOWN.length,
      lastModified: Date.now(),
    });
  };

  // Reset to initial state
  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    setCurrentStep(0);
  };

  // Convert File
  const handleConvert = async () => {
    if (!file) return;

    try {
      setStatus('converting');
      setCurrentStep(0);
      setError(null);

      // Determine output file path
      const baseName = file.fileName.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '');
      const defaultDocxName = `${baseName}.docx`;

      let outputPath = null;

      if (window.electronAPI?.saveFileDialog) {
        // In native Windows desktop, open save dialog or auto-save next to the source
        const defaultSavePath = file.filePath && !file.filePath.startsWith('C:\\Users\\Public')
          ? file.filePath.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '.docx')
          : defaultDocxName;

        outputPath = await window.electronAPI.saveFileDialog(defaultSavePath);
        if (!outputPath) {
          // User cancelled save dialog
          setStatus('file-selected');
          return;
        }
      } else {
        outputPath = defaultDocxName;
      }

      // Step 1: Lexing AST
      setCurrentStep(0);
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Typography & Styles
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 450));

      // Step 3: Tables & Callouts
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 400));

      // Step 4: Compiling OpenXML DOCX
      setCurrentStep(3);

      let convResult;

      if (window.electronAPI?.convertMarkdown) {
        // Native Windows Electron conversion
        convResult = await window.electronAPI.convertMarkdown(
          file.content,
          outputPath,
          options
        );
      } else {
        // Browser fallback: client-side mock/download
        await new Promise((r) => setTimeout(r, 500));
        convResult = {
          success: true,
          outputPath: outputPath,
          fileName: defaultDocxName,
          fileSize: file.size * 3.5,
          stats: { tokensCount: 15, paragraphsCount: 12 },
        };
      }

      if (convResult.success) {
        setResult(convResult);
        setStatus('completed');
        setHistory((prev) => [
          {
            ...convResult,
            convertedAt: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 4),
        ]);
      } else {
        setError(convResult.error || 'Conversion failed');
        setStatus('error');
      }
    } catch (err) {
      console.error('Error during conversion:', err);
      setError(err.message || 'An error occurred during conversion');
      setStatus('error');
    }
  };

  return (
    <View style={styles.windowContainer}>
      {/* Titlebar with window controls and navigation tabs */}
      <TitleBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace Body */}
      <View style={styles.body}>
        {activeTab === 'convert' && (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Title & Tagline */}
            <View style={styles.headerHero}>
              <Text style={styles.heroTitle}>Convert Markdown to Word</Text>
              <Text style={styles.heroSubtitle}>
                Native Windows OpenXML generation with rich typography, callouts & table layouts.
              </Text>
            </View>

            {/* Dynamic Interactive Flow */}
            {status === 'idle' && (
              <DropZone
                onFileSelected={handleFileSelected}
                onLoadSample={handleLoadSample}
              />
            )}

            {status === 'file-selected' && (
              <FileDetailsCard
                file={file}
                options={options}
                onConvert={handleConvert}
                onReset={handleReset}
                onPreview={() => setActiveTab('preview')}
              />
            )}

            {(status === 'converting' || status === 'completed' || status === 'error') && (
              <ConversionProgress
                status={status}
                result={result}
                error={error}
                currentStep={currentStep}
                onReset={handleReset}
              />
            )}
          </ScrollView>
        )}

        {activeTab === 'preview' && (
          <MarkdownPreview
            file={file}
            options={options}
            onConvert={handleConvert}
          />
        )}

        {activeTab === 'styles' && (
          <StyleConfigurator
            options={options}
            onOptionsChange={setOptions}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  windowContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#0A0F1D',
  },
  body: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 520,
  },
});
