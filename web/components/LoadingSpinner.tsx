export function LoadingSpinner() {
  return (
    <span className="inline-flex items-center gap-0.5" role="status" aria-label="Carregando">
      <span className="h-3 w-1 animate-pulse bg-current" />
      <span className="h-3 w-1 animate-pulse bg-current delay-75" />
      <span className="h-3 w-1 animate-pulse bg-current delay-150" />
    </span>
  );
}
