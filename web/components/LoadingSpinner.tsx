// Decorative: the surrounding control (e.g. a busy button) announces the state.
export function LoadingSpinner() {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      <span className="h-3 w-1 animate-pulse bg-current" />
      <span className="h-3 w-1 animate-pulse bg-current delay-75" />
      <span className="h-3 w-1 animate-pulse bg-current delay-150" />
    </span>
  );
}
