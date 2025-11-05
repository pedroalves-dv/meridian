"use client";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (or send to error tracking service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "4rem auto",
          textAlign: "center",
          fontFamily: "Arial, sans-serif"
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#d32f2f" }}>
            Oops! Something went wrong
          </h1>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            We&apos;re sorry for the inconvenience. The app encountered an unexpected error.
          </p>
          <button
            onClick={() => {
              // Reset error state and reload
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Reload Application
          </button>
          
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details style={{ marginTop: "2rem", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", color: "#666" }}>
                Show error details (Development only)
              </summary>
              <pre style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.875rem"
              }}>
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
