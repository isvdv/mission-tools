import { CommandPalette } from './CommandPalette';
import { InstallAppButton } from './InstallAppButton';

export function Topbar() {
  return <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-4 pl-16 lg:px-8">
    <p className="min-w-0 truncate text-sm font-medium text-[var(--text-secondary)]">Mission Tools</p>
    <div className="ml-auto flex shrink-0 items-center gap-2"><CommandPalette /><InstallAppButton /></div>
  </header>;
}
