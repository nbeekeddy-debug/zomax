"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  name?: string;
  fallback?: ReactNode;
};

type State = { failed: boolean };

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Zomax section failed: ${this.props.name ?? "unnamed section"}`, error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-950" role="alert">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Section unavailable</p>
        <h2 className="mt-2 text-xl font-black">{this.props.name ?? "This section"} could not load.</h2>
        <p className="mt-2 text-sm text-rose-800">The rest of Zomax is still available.</p>
        <button
          type="button"
          onClick={() => this.setState({ failed: false })}
          className="mt-4 rounded-xl bg-rose-900 px-4 py-2 text-sm font-black text-white"
        >
          Retry section
        </button>
      </section>
    );
  }
}
