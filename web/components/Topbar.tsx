import { InstallAppButton } from './InstallAppButton';

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b border-white/10 bg-ink/80 px-4 backdrop-blur lg:px-8">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-cyanSoft">Painel</p>
        <h1 className="text-lg font-semibold">Mission Tools</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <InstallAppButton />
      </div>
    </header>
  );
}
