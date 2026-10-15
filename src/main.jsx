import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== [GLOBAL ERROR CAUGHT] ===', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 36,
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            height: '100vh',
            fontFamily: 'Segoe UI, sans-serif',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              backgroundColor: '#1E293B',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #EF4444',
            }}
          >
            <h2 style={{ color: '#EF4444', marginBottom: 12 }}>
              ⚠️ Application Encountered an Error
            </h2>
            <p style={{ color: '#94A3B8', marginBottom: 16, fontSize: 14 }}>
              An error occurred during rendering. Details are provided below:
            </p>
            <pre
              style={{
                backgroundColor: '#090D16',
                padding: 16,
                borderRadius: 8,
                color: '#FCA5A5',
                fontSize: 13,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {this.state.error?.toString()}
              {'\n\nComponent Stack:\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                backgroundColor: '#38BDF8',
                color: '#0A0F1D',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handlers
window.addEventListener('error', (e) => {
  console.error('[UNCAUGHT ERROR]:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[UNHANDLED REJECTION]:', e.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
