import React from 'react';
import { TerminalSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SandboxPage() {
  const Icon = TerminalSquare;
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[600px]">
      <div className="p-4 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] mb-6">
        <Icon className="w-8 h-8 text-[var(--acid)]" />
      </div>
      <h1 className="text-3xl font-semibold text-[var(--ink)] font-[var(--sans)] mb-2">
        Sandbox
      </h1>
      <p className="text-[var(--muted)] font-[var(--sans)] mb-6">
        Coming soon...
      </p>
      <div className="px-3 py-1 rounded-full bg-[var(--acid)]/10 border border-[var(--acid)]/20 text-[var(--acid)] text-sm font-medium font-[var(--mono)]">
        Under Construction
      </div>
    </div>
  );
}
