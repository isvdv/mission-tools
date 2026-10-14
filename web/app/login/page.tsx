import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-6"><Link href="/" className="justify-self-start text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Voltar ao início</Link><LoginForm /></div>
    </main>
  );
}
