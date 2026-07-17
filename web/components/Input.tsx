import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-lg border border-white/10 bg-ink/70 px-3 py-2 text-sm text-white outline-none ring-cyanSoft/30 transition placeholder:text-slate-500 focus:border-cyanSoft focus:ring-4 ${props.className ?? ''}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-lg border border-white/10 bg-ink/70 px-3 py-2 text-sm text-white outline-none ring-cyanSoft/30 transition placeholder:text-slate-500 focus:border-cyanSoft focus:ring-4 ${props.className ?? ''}`}
    />
  );
}
