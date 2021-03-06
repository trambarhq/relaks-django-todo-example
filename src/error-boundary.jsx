import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      return <div className="error-boundary">{error.message}</div>;
    }
    return children || null;
  }

  componentDidCatch(error, info) {
    this.setState({ error });
  }
}
