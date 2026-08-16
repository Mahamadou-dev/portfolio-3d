'use client';

// components/admin/Field.tsx
// Petites primitives de formulaire partagees par les ecrans d'administration.
import React from 'react';

const base =
  'w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:border-blue-500 dark:border-white/15';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-500">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} ${props.className ?? ''}`} />;
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-blue-600"
      />
      {label}
    </label>
  );
}

export function Button({
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const styles = {
    primary: 'bg-gradient-to-r from-blue-600 to-violet-600 text-white',
    ghost: 'border border-black/10 dark:border-white/15 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600/10 text-red-600 dark:text-red-400',
  }[variant];

  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${styles} ${props.className ?? ''}`}
    />
  );
}
