'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal } from 'lucide-react';
import { navigationGroups } from '../lib/navigation';

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const commands = useMemo(() => navigationGroups.flatMap((group) => group.items.map((item) => ({
    ...item,
    group: group.label
  }))), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) => `${command.label} ${command.command} ${command.group}`.toLowerCase().includes(normalized));
  }, [commands, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function runCommand(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--text-secondary)] transition duration-150 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
        aria-label="Buscar ferramenta"
      >
        <Search className="h-4 w-4" />
        <span className="hidden text-xs sm:inline">Ctrl K</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Buscar ferramenta">
          <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={() => setOpen(false)} aria-label="Fechar busca" />
          <div className="technical-panel relative mx-auto mt-16 w-full max-w-2xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-none">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <Terminal className="h-4 w-4 text-[var(--accent)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ferramenta..."
                className="h-9 min-w-0 flex-1 bg-transparent font-mono text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] sm:text-sm"
              />
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {filtered.length ? filtered.map((command) => (
                <button
                  key={command.href}
                  type="button"
                  onClick={() => runCommand(command.href)}
                  className="flex w-full items-center justify-between gap-4 border-l border-transparent px-3 py-2 text-left transition duration-150 hover:border-[var(--accent)] hover:bg-[var(--surface-secondary)]"
                >
                  <span>
                    <span className="block text-sm font-medium text-[var(--text-primary)]">{command.label}</span>
                    <span className="block font-mono text-[11px] text-[var(--text-muted)]">{command.command}</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">{command.group}</span>
                </button>
              )) : (
                <div className="px-3 py-8 text-center font-mono text-xs text-[var(--text-muted)]">Nenhuma ferramenta encontrada. Tente outro nome.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
