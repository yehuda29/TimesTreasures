// src/components/ErrorBoundary.jsx

import React from 'react';

// ErrorBoundary is a class component that catches JavaScript errors anywhere in its child component tree,
// logs those errors, and displays a fallback UI instead of the component tree that crashed.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Initialize state with hasError false; this will change if an error is caught.
    this.state = { hasError: false };
  }

  // getDerivedStateFromError is a lifecycle method that is invoked after an error has been thrown by a descendant component.
  // It receives the error that was thrown and returns a new state, which updates this.state.hasError to true.
  static getDerivedStateFromError(error) {
    // Update state so that the next render will show the fallback UI.
    return { hasError: true };
  }

  // componentDidCatch is another lifecycle method that is called after an error has been thrown.
  // It receives the error and an errorInfo object with details about which component tree branch caused the error.
  componentDidCatch(error, errorInfo) {
    // Here, you can log the error to an error reporting service, e.g., Sentry.
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  // The render method determines what to render based on the current state.
  render() {
    // If an error was caught, render the fallback UI.
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again later.</h2>;
    }

    // Otherwise, render the child components as usual.
    return this.props.children; 
  }
}

export default ErrorBoundary;
