import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Home, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
  onBack: () => void;
  onHome: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled route error", error, info);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-glow">
          <p className="text-label-md text-primary">화면을 불러오지 못했어요</p>
          <h1 className="mt-2 text-headline-md text-on-surface">
            잠시 후 다시 시도해 주세요.
          </h1>
          <p className="mt-3 text-body-md text-on-surface-variant">
            이전 화면으로 돌아가거나 페이지를 다시 불러올 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.props.onBack}
              className="min-h-11 rounded-md border border-outline-variant bg-surface-container-lowest px-5 text-label-md text-on-surface transition hover:border-primary hover:text-primary"
            >
              이전 화면
            </button>
            <button
              type="button"
              onClick={this.props.onHome}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-5 text-label-md text-on-surface transition hover:border-primary hover:text-primary"
            >
              <Home size={18} aria-hidden="true" />
              홈으로
            </button>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-label-md text-on-primary transition hover:opacity-90"
            >
              <RefreshCw size={18} aria-hidden="true" />
              다시 시도
            </button>
          </div>
        </section>
      </main>
    );
  }
}

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

export default function RouteErrorBoundary({
  children,
}: RouteErrorBoundaryProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ErrorBoundary
      resetKey={location.key}
      onBack={() => navigate(-1)}
      onHome={() => navigate("/")}
    >
      {children}
    </ErrorBoundary>
  );
}
